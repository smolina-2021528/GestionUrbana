import type { PaginacionReportes } from '../../reports/types/reportesTipos';

export const tiposNotificacionReporte = [
  'STATUS_CHANGED',
  'NEW_COMMENT',
  'REPORT_ASSIGNED'
] as const;

export type TipoNotificacionReporte = (typeof tiposNotificacionReporte)[number] | string;

export type ReporteNotificacionResumen = {
  id: string;
  title: string;
};

export type NotificacionReporte = {
  id: string;
  type: TipoNotificacionReporte;
  message: string;
  isRead: boolean;
  createdAt: string;
  report: ReporteNotificacionResumen | null;
};

export type FiltrosNotificaciones = {
  page?: number;
  limit?: number;
  onlyUnread?: boolean;
};

export type RespuestaApiNotificacionesExitosa<TDatos = undefined> = {
  success: true;
  message?: string;
  data?: TDatos;
};

export type RespuestaApiNotificacionesFallida = {
  success: false;
  message?: string;
  error?: string;
  errors?: unknown;
};

export type RespuestaApiNotificaciones<TDatos = undefined> =
  | RespuestaApiNotificacionesExitosa<TDatos>
  | RespuestaApiNotificacionesFallida;

export type RespuestaNotificaciones = RespuestaApiNotificaciones<NotificacionReporte[]> & {
  unreadCount?: number;
  pagination?: PaginacionReportes;
};

export type RespuestaAccionNotificacion = RespuestaApiNotificaciones;