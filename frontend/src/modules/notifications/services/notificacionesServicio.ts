import { rutasApi } from '../../../config/rutasApi';
import { clienteReportes, obtenerDatosRespuesta } from '../../../shared/services/clienteHttp';
import type {
  FiltrosNotificaciones,
  NotificacionReporte,
  RespuestaAccionNotificacion,
  RespuestaNotificaciones
} from '../types/notificacionesTipos';

type RegistroDesconocido = Record<string, unknown>;

function esObjeto(valor: unknown): valor is RegistroDesconocido {
  return typeof valor === 'object' && valor !== null && !Array.isArray(valor);
}

function obtenerMensajeRespuestaFallida(respuesta: RegistroDesconocido) {
  return typeof respuesta.message === 'string'
    ? respuesta.message
    : 'No fue posible completar la acción solicitada.';
}

function limpiarParametros(parametros?: FiltrosNotificaciones) {
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

function extraerNotificaciones(respuesta: unknown): NotificacionReporte[] {
  if (Array.isArray(respuesta)) {
    return respuesta as NotificacionReporte[];
  }

  if (!esObjeto(respuesta)) {
    return [];
  }

  if (Array.isArray(respuesta.data)) {
    return respuesta.data as NotificacionReporte[];
  }

  if (Array.isArray(respuesta.notifications)) {
    return respuesta.notifications as NotificacionReporte[];
  }

  return [];
}

function normalizarRespuestaNotificaciones(respuesta: unknown): RespuestaNotificaciones {
  if (esObjeto(respuesta) && respuesta.success === false) {
    return {
      success: false,
      message: obtenerMensajeRespuestaFallida(respuesta),
      error: typeof respuesta.error === 'string' ? respuesta.error : undefined,
      errors: respuesta.errors
    };
  }

  const respuestaNormalizada: RespuestaNotificaciones = {
    success: true,
    data: extraerNotificaciones(respuesta)
  };

  if (esObjeto(respuesta)) {
    if (typeof respuesta.message === 'string') {
      respuestaNormalizada.message = respuesta.message;
    }

    if (typeof respuesta.unreadCount === 'number') {
      respuestaNormalizada.unreadCount = respuesta.unreadCount;
    }

    if (esObjeto(respuesta.pagination)) {
      respuestaNormalizada.pagination =
        respuesta.pagination as RespuestaNotificaciones['pagination'];
    }
  }

  return respuestaNormalizada;
}

function normalizarRespuestaAccion(respuesta: unknown): RespuestaAccionNotificacion {
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

export const notificacionesServicio = {
  async obtenerNotificaciones(
    filtros?: FiltrosNotificaciones
  ): Promise<RespuestaNotificaciones> {
    const respuesta = await obtenerDatosRespuesta<unknown>(
      clienteReportes.get(rutasApi.notificaciones.listar, {
        params: limpiarParametros(filtros)
      })
    );

    return normalizarRespuestaNotificaciones(respuesta);
  },

  async marcarNotificacionLeida(notificacionId: string): Promise<RespuestaAccionNotificacion> {
    const respuesta = await obtenerDatosRespuesta<unknown>(
      clienteReportes.patch(rutasApi.notificaciones.marcarLeida(notificacionId))
    );

    return normalizarRespuestaAccion(respuesta);
  },

  async marcarTodasNotificacionesLeidas(): Promise<RespuestaAccionNotificacion> {
    const respuesta = await obtenerDatosRespuesta<unknown>(
      clienteReportes.patch(rutasApi.notificaciones.marcarTodasLeidas)
    );

    return normalizarRespuestaAccion(respuesta);
  },

  async eliminarNotificacion(notificacionId: string): Promise<RespuestaAccionNotificacion> {
    const respuesta = await obtenerDatosRespuesta<unknown>(
      clienteReportes.delete(rutasApi.notificaciones.eliminar(notificacionId))
    );

    return normalizarRespuestaAccion(respuesta);
  }
};