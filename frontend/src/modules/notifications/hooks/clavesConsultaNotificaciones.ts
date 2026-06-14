import type { FiltrosNotificaciones } from '../types/notificacionesTipos';

const claveBaseNotificaciones = ['notificaciones'] as const;

export const clavesConsultaNotificaciones = {
  todos: claveBaseNotificaciones,

  listas: () => [...claveBaseNotificaciones, 'listas'] as const,

  listado: (filtros?: FiltrosNotificaciones) =>
    [...claveBaseNotificaciones, 'listado', filtros ?? {}] as const
} as const;