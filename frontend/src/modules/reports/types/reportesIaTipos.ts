import type {
  CategoriaReporte,
  PrioridadReporte,
  Reporte,
  RespuestaApiReportes
} from './reportesTipos';

export const etapasErrorIaReporte = ['gemini', 'cloudinary', 'database'] as const;

export const etiquetasSimilitudReporte = [
  'Duplicado probable',
  'Muy similar',
  'Similar'
] as const;

export const limitesIaReportes = {
  direccionMaxima: 500,
  tituloMinimoDuplicados: 3,
  tituloMaximoDuplicados: 150,
  descripcionMinimaDuplicados: 10,
  descripcionMaximaDuplicados: 2000,
  limiteMinimoDuplicados: 1,
  limiteMaximoDuplicados: 10,
  limiteMinimoSimilares: 1,
  limiteMaximoSimilares: 20,
  umbralMinimo: 0,
  umbralMaximo: 1
} as const;

export type EtapaErrorIaReporte = (typeof etapasErrorIaReporte)[number] | string;

export type EtiquetaSimilitudReporte =
  | (typeof etiquetasSimilitudReporte)[number]
  | string;

export type ErrorIaReporte = {
  success: false;
  message?: string;
  error?: string;
  errors?: unknown;
  stage?: EtapaErrorIaReporte;
};

export type AnalizarReporteConIaPayload = {
  image: File;
  address: string;
};

export type CrearReporteConIaPayload = {
  image: File;
  address: string;
};

export type AnalisisSugeridoReporte = {
  title: string;
  description: string;
  category: CategoriaReporte;
  priority: PrioridadReporte;
};

export type UbicacionAnalisisReporte = {
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  found: boolean;
};

export type RespuestaAnalisisReporteExitosa = {
  success: true;
  analysis: AnalisisSugeridoReporte;
  location: UbicacionAnalisisReporte;
  ready: boolean;
};

export type RespuestaAnalisisReporte = RespuestaAnalisisReporteExitosa | ErrorIaReporte;

export type ReporteCreadoConIa = Reporte & {
  aiGenerated: true;
};

export type RespuestaCrearReporteConIa = ReporteCreadoConIa | ErrorIaReporte;

export type VerificarDuplicadosReportePayload = {
  title: string;
  description: string;
  category: CategoriaReporte;
  latitude?: number | null;
  longitude?: number | null;
};

export type FiltrosDuplicadosReporte = {
  limit?: number;
  threshold?: number;
};

export type FiltrosReportesSimilares = {
  limit?: number;
  threshold?: number;
};

export type SimilitudReporte = {
  score: number;
  isDuplicate: boolean;
  distanceM: number | null;
  label: EtiquetaSimilitudReporte;
};

export type ReporteConSimilitud = Reporte & {
  similarity: SimilitudReporte;
};

export type DatosDuplicadosReporte = {
  hasDuplicates: boolean;
  message: string;
  candidates: ReporteConSimilitud[];
};

export type MetaDuplicadosReporte = {
  threshold: number;
  duplicateThreshold: number;
};

export type RespuestaDuplicadosReporte = RespuestaApiReportes<DatosDuplicadosReporte> & {
  meta?: MetaDuplicadosReporte;
};

export type ReporteBaseSimilares = {
  id: string;
  title: string;
  category: CategoriaReporte | string;
};

export type DatosReportesSimilares = {
  baseReport: ReporteBaseSimilares;
  similar: ReporteConSimilitud[];
};

export type MetaReportesSimilares = {
  total: number;
  threshold: number;
  duplicateThreshold: number;
};

export type RespuestaReportesSimilares = RespuestaApiReportes<DatosReportesSimilares> & {
  meta?: MetaReportesSimilares;
};

export type RespuestaReprocesarIaReporte = RespuestaApiReportes<Reporte>;

export type ResultadoIaReporte =
  | RespuestaAnalisisReporte
  | RespuestaCrearReporteConIa
  | RespuestaDuplicadosReporte
  | RespuestaReportesSimilares
  | RespuestaReprocesarIaReporte;