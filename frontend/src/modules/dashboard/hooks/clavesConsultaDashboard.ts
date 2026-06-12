import type {
  FiltrosDashboardEstadisticas,
  FiltrosHeatmapGridEstadisticas,
  FiltrosRangoFechaEstadisticas,
  FiltrosTendenciasEstadisticas,
  FiltrosZonasEstadisticas
} from '../types/estadisticasTipos';

const claveBaseDashboard = ['dashboard'] as const;

export const clavesConsultaDashboard = {
  todos: claveBaseDashboard,

  estadisticas: (filtros?: FiltrosDashboardEstadisticas) =>
    [...claveBaseDashboard, 'estadisticas', filtros ?? {}] as const,

  tendencias: (filtros?: FiltrosTendenciasEstadisticas) =>
    [...claveBaseDashboard, 'tendencias', filtros ?? {}] as const,

  zonas: (filtros?: FiltrosZonasEstadisticas) =>
    [...claveBaseDashboard, 'zonas', filtros ?? {}] as const,

  transiciones: (filtros?: FiltrosRangoFechaEstadisticas) =>
    [...claveBaseDashboard, 'transiciones', filtros ?? {}] as const,

  heatmapGrid: (filtros?: FiltrosHeatmapGridEstadisticas) =>
    [...claveBaseDashboard, 'heatmap-grid', filtros ?? {}] as const
} as const;