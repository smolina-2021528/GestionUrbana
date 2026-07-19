import type { ImagePickerAsset } from 'expo-image-picker';

export type CategoriaReporte = 'INFRAESTRUCTURA' | 'SEGURIDAD' | 'LIMPIEZA';

export type PrioridadReporte = 'ALTA' | 'MEDIA' | 'BAJA';

export type EstadoReporte = 'PENDIENTE' | 'EN_PROCESO' | 'RESUELTO' | 'RECHAZADO';

export type CoordenadasReporte = {
  latitude: number;
  longitude: number;
};

export type CrearReporteFormulario = {
  title: string;
  description: string;
  category: CategoriaReporte;
  address?: string;
};

export type CrearReportePayload = CrearReporteFormulario & {
  clientRequestId?: string;
  image: ImagePickerAsset;
  coordinates?: CoordenadasReporte | null;
};

export type AnalizarReporteConIaPayload = CrearReporteFormulario & {
  image: ImagePickerAsset;
};

export type ImagenReporte = {
  id?: string;
  Id?: string;
  url?: string | null;
  imageUrl?: string | null;
  ImageUrl?: string | null;
  publicId?: string | null;
  PublicId?: string | null;
  order?: number;
  Order?: number;
  createdAt?: string | null;
  CreatedAt?: string | null;
};

export type UsuarioResumenReporte = {
  id?: string;
  name?: string;
  surname?: string;
  username?: string;
};

export type ReporteResumen = {
  id: string;
  clientRequestId?: string | null;
  title: string;
  description: string;
  category: CategoriaReporte;
  priority: PrioridadReporte;
  status: EstadoReporte;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  createdAt?: string;
  updatedAt?: string;
  images?: ImagenReporte[];
  citizen?: UsuarioResumenReporte | null;
};

export type CrearReporteResponse = {
  success: boolean;
  message?: string;
  data?: ReporteResumen;
  duplicateHandled?: boolean;
  recoveredAfterTimeout?: boolean;
};

export type EstadoValidacionEvidencia = 'RELATED' | 'REVIEW' | 'UNRELATED' | 'NO_CONTEXT' | string;

export type ValidacionEvidenciaReporte = {
  status: EstadoValidacionEvidencia;
  isRelevant: boolean;
  shouldWarn: boolean;
  score: number | null;
  confidence: 'none' | 'low' | 'medium' | 'high' | string;
  message: string;
  reasons: string[];
  comparedWith: {
    titleProvided: boolean;
    descriptionProvided: boolean;
    categoryProvided: boolean;
    suggestedCategory?: CategoriaReporte | string | null;
  };
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
  evidenceValidation: ValidacionEvidenciaReporte;
  location: UbicacionAnalisisReporte;
  ready: boolean;
};

export type RespuestaAnalisisReporteFallida = {
  success: false;
  message?: string;
  error?: string;
  stage?: string;
};

export type RespuestaAnalisisReporte =
  | RespuestaAnalisisReporteExitosa
  | RespuestaAnalisisReporteFallida;

export type ContenedorReportes = {
  reports?: ReporteResumen[];
  items?: ReporteResumen[];
  rows?: ReporteResumen[];
  data?: ReporteResumen[];
  total?: number;
};

export type MisReportesResponse = {
  success: boolean;
  message?: string;
  error?: string;
  data?: ReporteResumen[] | ContenedorReportes;
  reports?: ReporteResumen[];
};

export type MisReportesNormalizados = {
  success: boolean;
  message?: string;
  reportes: ReporteResumen[];
};

export type ReporteDetalleResponse = {
  success: boolean;
  message?: string;
  error?: string;
  data?: ReporteResumen;
  report?: ReporteResumen;
};

export type ReporteDetalleNormalizado = {
  success: boolean;
  message?: string;
  reporte: ReporteResumen | null;
};