import { clienteReportes } from '../../../shared/services/clienteHttp';
import type {
  FiltrosNotificaciones,
  Notificacion,
  NotificacionesNormalizadas,
  RespuestaAccionNotificacion,
  RespuestaListadoNotificaciones
} from '../types/notificaciones.types';

function normalizarEnteroPositivo(valor: number | undefined) {
  if (
    typeof valor !== 'number' ||
    !Number.isInteger(valor) ||
    valor <= 0
  ) {
    return undefined;
  }

  return valor;
}

function construirParametros(filtros?: FiltrosNotificaciones) {
  const parametros: Record<string, string | number | boolean> = {};

  const page = normalizarEnteroPositivo(filtros?.page);
  const limit = normalizarEnteroPositivo(filtros?.limit);

  if (page !== undefined) {
    parametros.page = page;
  }

  if (limit !== undefined) {
    parametros.limit = limit;
  }

  if (typeof filtros?.onlyUnread === 'boolean') {
    parametros.onlyUnread = filtros.onlyUnread;
  }

  return Object.keys(parametros).length > 0 ? parametros : undefined;
}

function normalizarNotificacion(notificacion: Notificacion): Notificacion {
  return {
    id: notificacion.id,
    type: notificacion.type,
    message: notificacion.message,
    isRead: Boolean(notificacion.isRead),
    createdAt: notificacion.createdAt,
    report: notificacion.report
      ? {
          id: notificacion.report.id,
          title: notificacion.report.title
        }
      : null
  };
}

function normalizarRespuestaListado(
  respuesta: RespuestaListadoNotificaciones
): NotificacionesNormalizadas {
  const notificaciones = Array.isArray(respuesta.data)
    ? respuesta.data.map(normalizarNotificacion)
    : [];

  return {
    success: respuesta.success,
    message: respuesta.message,
    notificaciones,
    unreadCount: respuesta.unreadCount ?? notificaciones.filter((item) => !item.isRead).length,
    pagination: respuesta.pagination
  };
}

function validarIdentificador(id: string, nombreCampo: string) {
  const valor = id.trim();

  if (!valor) {
    throw new Error(`${nombreCampo} es obligatorio.`);
  }

  return valor;
}

export const notificacionesService = {
  async obtenerNotificaciones(
    filtros?: FiltrosNotificaciones
  ): Promise<NotificacionesNormalizadas> {
    const respuesta = await clienteReportes.get<RespuestaListadoNotificaciones>(
      '/notifications',
      {
        params: construirParametros(filtros)
      }
    );

    return normalizarRespuestaListado(respuesta.data);
  },

  async marcarComoLeida(
    notificacionId: string
  ): Promise<RespuestaAccionNotificacion> {
    const id = validarIdentificador(
      notificacionId,
      'El identificador de la notificación'
    );

    const respuesta = await clienteReportes.patch<RespuestaAccionNotificacion>(
      `/notifications/${encodeURIComponent(id)}/read`
    );

    return respuesta.data;
  },

  async marcarTodasComoLeidas(): Promise<RespuestaAccionNotificacion> {
    const respuesta = await clienteReportes.patch<RespuestaAccionNotificacion>(
      '/notifications/read-all'
    );

    return respuesta.data;
  },

  async eliminarNotificacion(
    notificacionId: string
  ): Promise<RespuestaAccionNotificacion> {
    const id = validarIdentificador(
      notificacionId,
      'El identificador de la notificación'
    );

    const respuesta = await clienteReportes.delete<RespuestaAccionNotificacion>(
      `/notifications/${encodeURIComponent(id)}`
    );

    return respuesta.data;
  }
};