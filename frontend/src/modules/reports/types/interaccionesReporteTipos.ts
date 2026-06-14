import type {
  CategoriaReporte,
  EstadoReporte,
  PaginacionReportes,
  PrioridadReporte,
  Reporte,
  UsuarioResumenReporte
} from './reportesTipos';

export type ComentarioReporte = {
  id: string;
  content: string;
  isInternal: boolean;
  createdAt: string;
  author: UsuarioResumenReporte | null;
};

export type CrearComentarioReportePayload = {
  content: string;
  isInternal?: boolean;
};

export type FiltrosComentariosReporte = {
  page?: number;
  limit?: number;
  includeInternal?: boolean;
};

export type ReporteSeguidoCrudo = {
  Id: string;
  Title: string;
  Category: CategoriaReporte | string;
  Priority: PrioridadReporte | string;
  Status: EstadoReporte | string;
  CreatedAt: string;
};

export type ReporteSeguido = Pick<
  Reporte,
  'id' | 'title' | 'category' | 'priority' | 'status' | 'createdAt'
>;

export type FiltrosReportesSeguidos = {
  page?: number;
  limit?: number;
};

export type RespuestaApiInteraccionesExitosa<TDatos = undefined> = {
  success: true;
  message?: string;
  data?: TDatos;
};

export type RespuestaApiInteraccionesFallida = {
  success: false;
  message?: string;
  error?: string;
  errors?: unknown;
};

export type RespuestaApiInteracciones<TDatos = undefined> =
  | RespuestaApiInteraccionesExitosa<TDatos>
  | RespuestaApiInteraccionesFallida;

export type RespuestaComentariosReporte = RespuestaApiInteracciones<ComentarioReporte[]> & {
  pagination?: PaginacionReportes;
};

export type RespuestaCrearComentarioReporte = RespuestaApiInteracciones<ComentarioReporte>;

export type RespuestaEliminarComentarioReporte = RespuestaApiInteracciones;

export type RespuestaSeguimientoReporte = RespuestaApiInteracciones;

export type RespuestaReportesSeguidosCruda = RespuestaApiInteracciones<ReporteSeguidoCrudo[]> & {
  pagination?: PaginacionReportes;
};

export type RespuestaReportesSeguidos = RespuestaApiInteracciones<ReporteSeguido[]> & {
  pagination?: PaginacionReportes;
};