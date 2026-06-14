import { rutasApi } from '../../../config/rutasApi';
import { clienteReportes, obtenerDatosRespuesta } from '../../../shared/services/clienteHttp';
import type {
  ComentarioReporte,
  CrearComentarioReportePayload,
  FiltrosComentariosReporte,
  RespuestaComentariosReporte,
  RespuestaCrearComentarioReporte,
  RespuestaEliminarComentarioReporte
} from '../types/interaccionesReporteTipos';

type RegistroDesconocido = Record<string, unknown>;

function esObjeto(valor: unknown): valor is RegistroDesconocido {
  return typeof valor === 'object' && valor !== null && !Array.isArray(valor);
}

function obtenerMensajeRespuestaFallida(respuesta: RegistroDesconocido) {
  return typeof respuesta.message === 'string'
    ? respuesta.message
    : 'No fue posible completar la acción solicitada.';
}

function limpiarTexto(valor: string) {
  return valor.trim();
}

function limpiarParametros(parametros?: FiltrosComentariosReporte) {
  if (!parametros) {
    return undefined;
  }

  const parametrosLimpios = Object.entries(parametros).reduce<RegistroDesconocido>(
    (acumulador, [llave, valor]) => {
      if (valor === undefined || valor === null) {
        return acumulador;
      }

      acumulador[llave] = valor;
      return acumulador;
    },
    {}
  );

  return Object.keys(parametrosLimpios).length > 0 ? parametrosLimpios : undefined;
}

function extraerComentarios(respuesta: unknown): ComentarioReporte[] {
  if (Array.isArray(respuesta)) {
    return respuesta as ComentarioReporte[];
  }

  if (!esObjeto(respuesta)) {
    return [];
  }

  if (Array.isArray(respuesta.data)) {
    return respuesta.data as ComentarioReporte[];
  }

  if (Array.isArray(respuesta.comments)) {
    return respuesta.comments as ComentarioReporte[];
  }

  return [];
}

function extraerComentario(respuesta: unknown): ComentarioReporte | undefined {
  if (!esObjeto(respuesta)) {
    return undefined;
  }

  if (esObjeto(respuesta.data)) {
    return respuesta.data as ComentarioReporte;
  }

  if (esObjeto(respuesta.comment)) {
    return respuesta.comment as ComentarioReporte;
  }

  return undefined;
}

function normalizarRespuestaComentarios(respuesta: unknown): RespuestaComentariosReporte {
  if (esObjeto(respuesta) && respuesta.success === false) {
    return {
      success: false,
      message: obtenerMensajeRespuestaFallida(respuesta),
      error: typeof respuesta.error === 'string' ? respuesta.error : undefined,
      errors: respuesta.errors
    };
  }

  const respuestaNormalizada: RespuestaComentariosReporte = {
    success: true,
    data: extraerComentarios(respuesta)
  };

  if (esObjeto(respuesta)) {
    if (typeof respuesta.message === 'string') {
      respuestaNormalizada.message = respuesta.message;
    }

    if (esObjeto(respuesta.pagination)) {
      respuestaNormalizada.pagination =
        respuesta.pagination as RespuestaComentariosReporte['pagination'];
    }
  }

  return respuestaNormalizada;
}

function normalizarRespuestaCrearComentario(respuesta: unknown): RespuestaCrearComentarioReporte {
  if (esObjeto(respuesta) && respuesta.success === false) {
    return {
      success: false,
      message: obtenerMensajeRespuestaFallida(respuesta),
      error: typeof respuesta.error === 'string' ? respuesta.error : undefined,
      errors: respuesta.errors
    };
  }

  const respuestaNormalizada: RespuestaCrearComentarioReporte = {
    success: true
  };

  const comentario = extraerComentario(respuesta);

  if (comentario) {
    respuestaNormalizada.data = comentario;
  }

  if (esObjeto(respuesta) && typeof respuesta.message === 'string') {
    respuestaNormalizada.message = respuesta.message;
  }

  return respuestaNormalizada;
}

function normalizarRespuestaEliminarComentario(
  respuesta: unknown
): RespuestaEliminarComentarioReporte {
  if (esObjeto(respuesta) && respuesta.success === false) {
    return {
      success: false,
      message: obtenerMensajeRespuestaFallida(respuesta),
      error: typeof respuesta.error === 'string' ? respuesta.error : undefined,
      errors: respuesta.errors
    };
  }

  return {
    success: true,
    ...(esObjeto(respuesta) &&
      typeof respuesta.message === 'string' && {
        message: respuesta.message
      })
  };
}

function construirPayloadComentario(datos: CrearComentarioReportePayload) {
  return {
    content: limpiarTexto(datos.content),
    ...(typeof datos.isInternal === 'boolean' && { isInternal: datos.isInternal })
  };
}

export const comentariosReporteServicio = {
  async obtenerComentariosReporte(
    reporteId: string,
    filtros?: FiltrosComentariosReporte
  ): Promise<RespuestaComentariosReporte> {
    const respuesta = await obtenerDatosRespuesta<unknown>(
      clienteReportes.get(rutasApi.reportes.comentarios.listar(reporteId), {
        params: limpiarParametros(filtros)
      })
    );

    return normalizarRespuestaComentarios(respuesta);
  },

  async crearComentarioReporte(
    reporteId: string,
    datos: CrearComentarioReportePayload
  ): Promise<RespuestaCrearComentarioReporte> {
    const respuesta = await obtenerDatosRespuesta<unknown>(
      clienteReportes.post(
        rutasApi.reportes.comentarios.crear(reporteId),
        construirPayloadComentario(datos)
      )
    );

    return normalizarRespuestaCrearComentario(respuesta);
  },

  async eliminarComentarioReporte(
    reporteId: string,
    comentarioId: string
  ): Promise<RespuestaEliminarComentarioReporte> {
    const respuesta = await obtenerDatosRespuesta<unknown>(
      clienteReportes.delete(rutasApi.reportes.comentarios.eliminar(reporteId, comentarioId))
    );

    return normalizarRespuestaEliminarComentario(respuesta);
  }
};