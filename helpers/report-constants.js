// Categorías de reportes urbanos
export const REPORT_CATEGORIES = ['INFRAESTRUCTURA', 'SEGURIDAD', 'LIMPIEZA'];

// Prioridades de atención
export const REPORT_PRIORITIES = ['ALTA', 'MEDIA', 'BAJA'];

// Estados del ciclo de vida de un reporte
export const REPORT_STATUSES = ['PENDIENTE', 'EN_PROCESO', 'RESUELTO', 'RECHAZADO'];

// Valores por defecto
export const DEFAULT_CATEGORY = 'INFRAESTRUCTURA';
export const DEFAULT_PRIORITY = 'MEDIA';
export const DEFAULT_STATUS   = 'PENDIENTE';

// Colores para el mapa de calor del frontend según prioridad
export const PRIORITY_COLORS = {
  ALTA:  '#EF4444',
  MEDIA: '#F59E0B',
  BAJA:  '#22C55E',
};
