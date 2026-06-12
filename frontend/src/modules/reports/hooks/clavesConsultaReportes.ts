import type {
  FiltrosBoundingBoxReportes,
  FiltrosBusquedaReportes,
  FiltrosHeatmapReportes,
  FiltrosListadoReportes,
  FiltrosMisReportes,
  FiltrosReportesCercanos
} from '../types/reportesTipos';

const claveBaseReportes = ['reportes'] as const;

export const clavesConsultaReportes = {
  todos: claveBaseReportes,

  listas: () => [...claveBaseReportes, 'listas'] as const,

  listado: (filtros?: FiltrosListadoReportes) =>
    [...claveBaseReportes, 'listado', filtros ?? {}] as const,

  misReportes: (filtros?: FiltrosMisReportes) =>
    [...claveBaseReportes, 'mis-reportes', filtros ?? {}] as const,

  busqueda: (filtros: FiltrosBusquedaReportes) =>
    [...claveBaseReportes, 'busqueda', filtros] as const,

  cercanos: (filtros: FiltrosReportesCercanos) =>
    [...claveBaseReportes, 'cercanos', filtros] as const,

  heatmap: (filtros?: FiltrosHeatmapReportes) =>
    [...claveBaseReportes, 'heatmap', filtros ?? {}] as const,

  bbox: (filtros: FiltrosBoundingBoxReportes) => [...claveBaseReportes, 'bbox', filtros] as const,

  detalles: () => [...claveBaseReportes, 'detalle'] as const,

  detalle: (reporteId: string) => [...claveBaseReportes, 'detalle', reporteId] as const,

  historial: (reporteId: string) => [...claveBaseReportes, 'historial', reporteId] as const
} as const;