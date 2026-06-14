import { rutasApi } from '../../../config/rutasApi';
import { clienteReportes, obtenerDatosRespuesta } from '../../../shared/services/clienteHttp';
import type {
  FiltrosReportesSeguidos,
  ReporteSeguido,
  RespuestaReportesSeguidos,
  RespuestaSeguimientoReporte
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

function limpiarParametros(parametros?: FiltrosReportesSeguidos) {
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

function obtenerTexto(valor: unknown) {
  return typeof valor === 'string' ? valor : '';
}

function obtenerFuenteReporteSeguido(valor: unknown) {
  if (!esObjeto(valor)) {
    return {};
  }

  if (esObjeto(valor.Report)) {
    return valor.Report;
  }

  return valor;
}

function normalizarReporteSeguido(valor: unknown): ReporteSeguido {
  const reporte = obtenerFuenteReporteSeguido(valor);

  return {
    id: obtenerTexto(reporte.id ?? reporte.Id),
    title: obtenerTexto(reporte.title ?? reporte.Title),
    category: obtenerTexto(reporte.category ?? reporte.Category) as ReporteSeguido['category'],
    priority: obtenerTexto(reporte.priority ?? reporte.Priority) as ReporteSeguido['priority'],
    status: obtenerTexto(reporte.status ?? reporte.Status) as ReporteSeguido['status'],
    createdAt: obtenerTexto(reporte.createdAt ?? reporte.CreatedAt)
  };
}

function extraerReportesSeguidos(respuesta: unknown): ReporteSeguido[] {
  if (Array.isArray(respuesta)) {
    return respuesta.map(normalizarReporteSeguido);
  }

  if (!esObjeto(respuesta)) {
    return [];
  }

  if (Array.isArray(respuesta.data)) {
    return respuesta.data.map(normalizarReporteSeguido);
  }

  if (Array.isArray(respuesta.reports)) {
    return respuesta.reports.map(normalizarReporteSeguido);
  }

  return [];
}

function normalizarRespuestaSeguimiento(respuesta: unknown): RespuestaSeguimientoReporte {
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

function normalizarRespuestaReportesSeguidos(respuesta: unknown): RespuestaReportesSeguidos {
  if (esObjeto(respuesta) && respuesta.success === false) {
    return {
      success: false,
      message: obtenerMensajeRespuestaFallida(respuesta),
      error: typeof respuesta.error === 'string' ? respuesta.error : undefined,
      errors: respuesta.errors
    };
  }

  const respuestaNormalizada: RespuestaReportesSeguidos = {
    success: true,
    data: extraerReportesSeguidos(respuesta)
  };

  if (esObjeto(respuesta)) {
    if (typeof respuesta.message === 'string') {
      respuestaNormalizada.message = respuesta.message;
    }

    if (esObjeto(respuesta.pagination)) {
      respuestaNormalizada.pagination =
        respuesta.pagination as RespuestaReportesSeguidos['pagination'];
    }
  }

  return respuestaNormalizada;
}

export const seguimientoReporteServicio = {
  async seguirReporte(reporteId: string): Promise<RespuestaSeguimientoReporte> {
    const respuesta = await obtenerDatosRespuesta<unknown>(
      clienteReportes.post(rutasApi.reportes.seguimiento.seguir(reporteId))
    );

    return normalizarRespuestaSeguimiento(respuesta);
  },

  async dejarDeSeguirReporte(reporteId: string): Promise<RespuestaSeguimientoReporte> {
    const respuesta = await obtenerDatosRespuesta<unknown>(
      clienteReportes.delete(rutasApi.reportes.seguimiento.dejarDeSeguir(reporteId))
    );

    return normalizarRespuestaSeguimiento(respuesta);
  },

  async obtenerReportesSeguidos(
    filtros?: FiltrosReportesSeguidos
  ): Promise<RespuestaReportesSeguidos> {
    const respuesta = await obtenerDatosRespuesta<unknown>(
      clienteReportes.get(rutasApi.reportes.seguimiento.seguidos, {
        params: limpiarParametros(filtros)
      })
    );

    return normalizarRespuestaReportesSeguidos(respuesta);
  }
};