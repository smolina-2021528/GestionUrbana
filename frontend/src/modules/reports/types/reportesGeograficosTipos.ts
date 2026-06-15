import type {
  CategoriaReporte,
  EstadoReporte,
  FiltrosFechaAplicados,
  FiltrosFechaReportes,
  PaginacionReportes,
  PrioridadReporte,
  Reporte,
  RespuestaApiReportes
} from './reportesTipos';

export const limitesGeograficosReportes = {
  latitudMinima: -90,
  latitudMaxima: 90,
  longitudMinima: -180,
  longitudMaxima: 180,
  radioMinimoMetros: 50,
  radioMaximoMetros: 50000,
  limiteMaximoConsulta: 50,
  minimoCaracteresBusqueda: 3
} as const;

export type CoordenadasGeograficas = {
  latitude: number;
  longitude: number;
};

export type BoundingBoxReportes = {
  sw: CoordenadasGeograficas;
  ne: CoordenadasGeograficas;
};

export type FiltrosBusquedaReportes = FiltrosFechaReportes & {
  q: string;
  page?: number;
  limit?: number;
};

export type FiltrosReportesCercanos = {
  lat: number;
  lng: number;
  radius?: number;
  page?: number;
  limit?: number;
  status?: EstadoReporte;
  category?: CategoriaReporte;
};

export type FiltrosHeatmapReportes = FiltrosFechaReportes & {
  category?: CategoriaReporte;
  priority?: PrioridadReporte;
  status?: EstadoReporte;
};

export type FiltrosBoundingBoxReportes = {
  swLat: number;
  swLng: number;
  neLat: number;
  neLng: number;
  status?: EstadoReporte;
  category?: CategoriaReporte;
};

export type ActualizarUbicacionReportePayload = {
  latitude: number;
  longitude: number;
  address?: string;
};

export type ReporteResumenMapa = {
  id: string;
  title: string;
  category: CategoriaReporte;
  priority: PrioridadReporte;
  status: EstadoReporte;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  hasLocation: boolean;
  createdAt: string;
};

export type PuntoHeatmapReporte = {
  id: string;
  latitude: number | null;
  longitude: number | null;
  weight: number;
  category: CategoriaReporte;
  priority: PrioridadReporte;
  priorityColor?: string;
  status: EstadoReporte;
};

export type RespuestaActualizarUbicacionReporte = RespuestaApiReportes<Reporte>;

export type RespuestaBusquedaReportes = RespuestaApiReportes<Reporte[]> & {
  pagination?: PaginacionReportes;
  filters?: FiltrosFechaAplicados;
};

export type RespuestaReportesCercanos = RespuestaApiReportes<Reporte[]> & {
  meta?: {
    center: CoordenadasGeograficas;
    radius: number;
  };
  pagination?: PaginacionReportes;
};

export type RespuestaHeatmapReportes = RespuestaApiReportes<PuntoHeatmapReporte[]> & {
  total?: number;
};

export type RespuestaBoundingBoxReportes = RespuestaApiReportes<ReporteResumenMapa[]> & {
  total?: number;
  bbox?: BoundingBoxReportes;
};