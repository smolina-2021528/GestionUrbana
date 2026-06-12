export const categoriasReporte = ['INFRAESTRUCTURA', 'SEGURIDAD', 'LIMPIEZA'] as const;
export const prioridadesReporte = ['ALTA', 'MEDIA', 'BAJA'] as const;
export const estadosReporte = ['PENDIENTE', 'EN_PROCESO', 'RESUELTO', 'RECHAZADO'] as const;
export const agrupacionesTendencia = ['day', 'week', 'month'] as const;
export const rangosFechaEstadisticas = ['TODAY', 'LAST_7_DAYS', 'LAST_30_DAYS', 'LAST_90_DAYS', 'THIS_YEAR'] as const;
export const radiosZonaEstadisticas = [500, 1000, 2000, 5000] as const;
export const formatosExportacionEstadisticas = ['csv', 'xlsx'] as const;

export type CategoriaReporte = (typeof categoriasReporte)[number];
export type PrioridadReporte = (typeof prioridadesReporte)[number];
export type EstadoReporte = (typeof estadosReporte)[number];
export type AgrupacionTendencia = (typeof agrupacionesTendencia)[number];
export type RangoFechaEstadisticas = (typeof rangosFechaEstadisticas)[number];
export type RadioZonaEstadisticas = (typeof radiosZonaEstadisticas)[number];
export type FormatoExportacionEstadisticas = (typeof formatosExportacionEstadisticas)[number];

export type FechaIsoONulo = string | null;
export type NumeroONulo = number | null;

export type RespuestaExitosaEstadisticas<TDatos, TFiltros = Record<string, unknown>> = {
  success: true;
  filters?: TFiltros;
  data: TDatos;
  message?: string;
};

export type RespuestaFallidaEstadisticas = {
  success: false;
  message: string;
};

export type RespuestaApiEstadisticas<TDatos, TFiltros = Record<string, unknown>> =
  | RespuestaExitosaEstadisticas<TDatos, TFiltros>
  | RespuestaFallidaEstadisticas;

export type FiltrosRangoFechaEstadisticas = {
  startDate?: string;
  endDate?: string;
  dateRange?: RangoFechaEstadisticas;
};

export type FiltrosDashboardEstadisticas = FiltrosRangoFechaEstadisticas & {
  category?: CategoriaReporte;
  priority?: PrioridadReporte;
};

export type FiltrosDashboardAplicados = {
  startDate: FechaIsoONulo;
  endDate: FechaIsoONulo;
  category: CategoriaReporte | null;
  priority: PrioridadReporte | null;
};

export type ResumenGeneralDashboard = {
  total: number;
  resolutionRate: number;
  avgResolutionHours: NumeroONulo;
};

export type EstadisticasPorEstado = {
  pendiente: number;
  enProceso: number;
  resuelto: number;
  rechazado: number;
};

export type EstadisticasPorCategoria = {
  infraestructura: number;
  seguridad: number;
  limpieza: number;
};

export type EstadisticasPorPrioridad = {
  alta: number;
  media: number;
  baja: number;
};

export type EstadisticasUbicacionDashboard = {
  withLocation: number;
  withoutLocation: number;
  coveragePercent: number;
};

export type EstadisticasInteraccionDashboard = {
  totalPublicComments: number;
  totalActiveFollowers: number;
};

export type EstadisticasDashboard = {
  overview: ResumenGeneralDashboard;
  byStatus: EstadisticasPorEstado;
  byCategory: EstadisticasPorCategoria;
  byPriority: EstadisticasPorPrioridad;
  location: EstadisticasUbicacionDashboard;
  engagement: EstadisticasInteraccionDashboard;
};

export type RespuestaDashboardEstadisticas = RespuestaApiEstadisticas<
  EstadisticasDashboard,
  FiltrosDashboardAplicados
>;

export type FiltrosTendenciasEstadisticas = FiltrosRangoFechaEstadisticas & {
  groupBy?: AgrupacionTendencia;
  category?: CategoriaReporte;
  status?: EstadoReporte;
};

export type FiltrosTendenciasAplicados = {
  startDate: FechaIsoONulo;
  endDate: FechaIsoONulo;
  groupBy: AgrupacionTendencia;
  category: CategoriaReporte | null;
  status: EstadoReporte | null;
};

export type PuntoTendenciaReportes = {
  period: string;
  total: number;
};

export type PuntoTendenciaResolucion = {
  period: string;
  avgHours: NumeroONulo;
};

export type TendenciasDashboard = {
  trends: PuntoTendenciaReportes[];
  resolution: PuntoTendenciaResolucion[];
};

export type RespuestaTendenciasEstadisticas = RespuestaApiEstadisticas<
  TendenciasDashboard,
  FiltrosTendenciasAplicados
>;

export type FiltrosZonasEstadisticas = {
  radius?: RadioZonaEstadisticas;
  limit?: number;
  category?: CategoriaReporte;
  status?: EstadoReporte;
};

export type FiltrosZonasAplicados = {
  radius: number;
  limit: number;
  category: CategoriaReporte | null;
  status: EstadoReporte | null;
};

export type CentroZonaEstadisticas = {
  latitude: number;
  longitude: number;
};

export type ZonaEstadisticas = {
  rank: number;
  reportCount: number;
  dominantCategory: CategoriaReporte | string | null;
  dominantPriority: PrioridadReporte | string | null;
  clusterId?: number | null;
  center?: CentroZonaEstadisticas | null;
  zone?: string | null;
};

export type RankingZonasEstadisticas = {
  spatial: ZonaEstadisticas[];
  byAddress: ZonaEstadisticas[];
};

export type RespuestaZonasEstadisticas = RespuestaApiEstadisticas<
  RankingZonasEstadisticas,
  FiltrosZonasAplicados
>;

export type TransicionEstadoEstadisticas = {
  previousStatus: EstadoReporte | string | null;
  newStatus: EstadoReporte | string;
  count: number;
};

export type FiltrosTransicionesAplicados = {
  startDate: FechaIsoONulo;
  endDate: FechaIsoONulo;
};

export type RespuestaTransicionesEstadisticas = RespuestaApiEstadisticas<
  TransicionEstadoEstadisticas[],
  FiltrosTransicionesAplicados
>;

export type FiltrosHeatmapGridEstadisticas = FiltrosRangoFechaEstadisticas & {
  cellDegrees?: number;
  category?: CategoriaReporte;
  priority?: PrioridadReporte;
  status?: EstadoReporte;
};

export type FiltrosHeatmapGridAplicados = {
  category: CategoriaReporte | null;
  priority: PrioridadReporte | null;
  status: EstadoReporte | null;
  startDate: FechaIsoONulo;
  endDate: FechaIsoONulo;
  cellDegrees: number;
};

export type CeldaHeatmapGridEstadisticas = {
  gridLat: NumeroONulo;
  gridLng: NumeroONulo;
  count: number;
  dominantCategory: CategoriaReporte | string | null;
};

export type RespuestaHeatmapGridEstadisticas = RespuestaApiEstadisticas<
  CeldaHeatmapGridEstadisticas[],
  FiltrosHeatmapGridAplicados
> & {
  total?: number;
};

export type FiltrosExportacionEstadisticas = FiltrosRangoFechaEstadisticas & {
  format?: FormatoExportacionEstadisticas;
  category?: CategoriaReporte;
  priority?: PrioridadReporte;
  status?: EstadoReporte;
};