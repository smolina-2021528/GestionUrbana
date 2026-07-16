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
  image: ImagePickerAsset;
  coordinates?: CoordenadasReporte | null;
};

export type ImagenReporte = {
  id?: string;
  imageUrl?: string;
  url?: string;
  publicId?: string;
};

export type ReporteResumen = {
  id: string;
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
};

export type CrearReporteResponse = {
  success: boolean;
  message?: string;
  data?: ReporteResumen;
};

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