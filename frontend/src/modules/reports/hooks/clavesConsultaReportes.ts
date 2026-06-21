import type {
  FiltrosBoundingBoxReportes,
  FiltrosBusquedaReportes,
  FiltrosHeatmapReportes,
  FiltrosListadoReportes,
  FiltrosMisReportes,
  FiltrosReportesCercanos
} from '../types/reportesTipos';
import type {
  FiltrosComentariosReporte,
  FiltrosReportesSeguidos
} from '../types/interaccionesReporteTipos';
import type { FiltrosReportesSimilares } from '../types/reportesIaTipos';

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

  historial: (reporteId: string) => [...claveBaseReportes, 'historial', reporteId] as const,

  comentarios: (reporteId: string, filtros?: FiltrosComentariosReporte) =>
    [...claveBaseReportes, 'comentarios', reporteId, filtros ?? {}] as const,

  comentariosReporte: (reporteId: string) =>
    [...claveBaseReportes, 'comentarios', reporteId] as const,

  seguimiento: (reporteId: string) => [...claveBaseReportes, 'seguimiento', reporteId] as const,

  reportesSeguidos: (filtros?: FiltrosReportesSeguidos) =>
    [...claveBaseReportes, 'reportes-seguidos', filtros ?? {}] as const,

  listasSeguimiento: () => [...claveBaseReportes, 'reportes-seguidos'] as const,

  inteligencia: () => [...claveBaseReportes, 'inteligencia'] as const,

  duplicados: () => [...claveBaseReportes, 'inteligencia', 'duplicados'] as const,

  similaresReporte: (reporteId: string) =>
    [...claveBaseReportes, 'inteligencia', 'similares', reporteId] as const,

  reportesSimilares: (reporteId: string, filtros?: FiltrosReportesSimilares) =>
    [...claveBaseReportes, 'inteligencia', 'similares', reporteId, filtros ?? {}] as const
} as const;