export type TipoNotificacion =
  | 'STATUS_CHANGED'
  | 'NEW_COMMENT'
  | 'REPORT_ASSIGNED'
  | string;

export type ReporteNotificacion = {
  id: string;
  title: string;
};

export type Notificacion = {
  id: string;
  type: TipoNotificacion;
  message: string;
  isRead: boolean;
  createdAt: string;
  report: ReporteNotificacion | null;
};

export type PaginacionNotificaciones = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type FiltrosNotificaciones = {
  page?: number;
  limit?: number;
  onlyUnread?: boolean;
};

export type RespuestaListadoNotificaciones = {
  success: boolean;
  message?: string;
  error?: string;
  data?: Notificacion[];
  unreadCount?: number;
  pagination?: PaginacionNotificaciones;
};

export type NotificacionesNormalizadas = {
  success: boolean;
  message?: string;
  notificaciones: Notificacion[];
  unreadCount: number;
  pagination?: PaginacionNotificaciones;
};

export type RespuestaAccionNotificacion = {
  success: boolean;
  message?: string;
  error?: string;
};