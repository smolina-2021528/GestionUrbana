export const categoriasReporte = ['INFRAESTRUCTURA', 'SEGURIDAD', 'LIMPIEZA'] as const;
export const prioridadesReporte = ['ALTA', 'MEDIA', 'BAJA'] as const;
export const estadosReporte = ['PENDIENTE', 'EN_PROCESO', 'RESUELTO', 'RECHAZADO'] as const;
export const estadosIAReporte = ['PENDING', 'OK', 'FAILED'] as const;
export const ordenesReportes = ['ASC', 'DESC'] as const;
export const camposOrdenReportes = ['date', 'priority'] as const;
export const rangosFechaReportes = [
  'TODAY',
  'LAST_7_DAYS',
  'LAST_30_DAYS',
  'LAST_90_DAYS',
  'THIS_YEAR'
] as const;

export type CategoriaReporte = (typeof categoriasReporte)[number];
export type PrioridadReporte = (typeof prioridadesReporte)[number];
export type EstadoReporte = (typeof estadosReporte)[number];
export type EstadoIAReporte = (typeof estadosIAReporte)[number];
export type OrdenReporte = (typeof ordenesReportes)[number];
export type CampoOrdenReporte = (typeof camposOrdenReportes)[number];
export type RangoFechaReporte = (typeof rangosFechaReportes)[number];

export type FechaIsoONulo = string | null;
export type NumeroONulo = number | null;

export type UsuarioResumenReporte = {
  id: string;
  username: string;
  name: string;
  surname?: string;
};

export type ImagenReporte = {
  id: string;
  url: string | null;
  publicId: string | null;
  order: number;
  createdAt: FechaIsoONulo;

  // Compatibilidad defensiva con respuestas anteriores.
  imageUrl?: string | null;
  ImageUrl?: string | null;
  PublicId?: string | null;
  CreatedAt?: string | null;
};

export type AnalisisIAReporte = {
  status: EstadoIAReporte | string;
  category: CategoriaReporte | string | null;
  priority: PrioridadReporte | string | null;
  confidence: NumeroONulo;
  reasoning: string | null;
  processedAt: FechaIsoONulo;
};

export type Reporte = {
  id: string;
  title: string;
  description: string;
  category: CategoriaReporte;
  priority: PrioridadReporte;
  status: EstadoReporte;
  priorityColor?: string;
  images: ImagenReporte[];
  citizen: UsuarioResumenReporte | null;
  assignedTo: UsuarioResumenReporte | null;
  resolvedAt: FechaIsoONulo;
  ai: AnalisisIAReporte | null;
  createdAt: string;
  updatedAt: string;
  latitude: NumeroONulo;
  longitude: NumeroONulo;
  address: string | null;
  hasLocation: boolean;
};

export type HistorialEstadoReporte = {
  id: string;
  previousStatus: EstadoReporte | string | null;
  newStatus: EstadoReporte | string;
  notes: string | null;
  createdAt: string;
  changedBy: UsuarioResumenReporte | null;
};

export type PaginacionReportes = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type OrdenReportesAplicado = {
  sortBy: CampoOrdenReporte;
  sortOrder: OrdenReporte;
};

export type FiltrosFechaReportes = {
  startDate?: string;
  endDate?: string;
  dateRange?: RangoFechaReporte;
};

export type FiltrosFechaAplicados = {
  startDate: FechaIsoONulo;
  endDate: FechaIsoONulo;
};

export type FiltrosListadoReportes = FiltrosFechaReportes & {
  page?: number;
  limit?: number;
  category?: CategoriaReporte;
  priority?: PrioridadReporte;
  status?: EstadoReporte;
  sortBy?: CampoOrdenReporte;
  sortOrder?: OrdenReporte;
};

export type FiltrosMisReportes = FiltrosFechaReportes & {
  page?: number;
  limit?: number;
};

export type CrearReportePayload = {
  title?: string;
  description?: string;
  category?: CategoriaReporte;
  latitude?: number;
  longitude?: number;
  address?: string;
  images?: File[];
};

export type ActualizarReportePayload = {
  title?: string;
  description?: string;
  category?: CategoriaReporte;
  latitude?: number;
  longitude?: number;
  address?: string;
  images?: File[];
};

export type CambiarEstadoReportePayload = {
  status: EstadoReporte;
  notes?: string;
};

export type AsignarReportePayload = {
  assignedTo: string;
};

export type RespuestaApiReportesExitosa<TDatos = undefined> = {
  success: true;
  message?: string;
  data?: TDatos;
};

export type RespuestaApiReportesFallida = {
  success: false;
  message?: string;
  error?: string;
  errors?: unknown;
};

export type RespuestaApiReportes<TDatos = undefined> =
  | RespuestaApiReportesExitosa<TDatos>
  | RespuestaApiReportesFallida;

export type RespuestaListadoReportes = RespuestaApiReportes<Reporte[]> & {
  pagination?: PaginacionReportes;
  sort?: OrdenReportesAplicado;
  filters?: FiltrosFechaAplicados;
};

export type RespuestaDetalleReporte = RespuestaApiReportes<Reporte>;

export type RespuestaCrearReporte = RespuestaApiReportes<Reporte> & {
  aiGenerated?: boolean;
  locationResolved?: boolean;
};

export type RespuestaActualizarReporte = RespuestaApiReportes<Reporte> & {
  locationResolved?: boolean;
};

export type RespuestaCambiarEstadoReporte = RespuestaApiReportes<Reporte>;

export type RespuestaAsignarReporte = RespuestaApiReportes<Reporte>;

export type RespuestaEliminarReporte = RespuestaApiReportes;

export type RespuestaEliminarImagenReporte = RespuestaApiReportes;

export type RespuestaHistorialReporte = RespuestaApiReportes<HistorialEstadoReporte[]>;

export { limitesGeograficosReportes } from './reportesGeograficosTipos';

export type {
  ActualizarUbicacionReportePayload,
  BoundingBoxReportes,
  CoordenadasGeograficas,
  FiltrosBoundingBoxReportes,
  FiltrosBusquedaReportes,
  FiltrosHeatmapReportes,
  FiltrosReportesCercanos,
  PuntoHeatmapReporte,
  ReporteResumenMapa,
  RespuestaActualizarUbicacionReporte,
  RespuestaBoundingBoxReportes,
  RespuestaBusquedaReportes,
  RespuestaHeatmapReportes,
  RespuestaReportesCercanos
} from './reportesGeograficosTipos';