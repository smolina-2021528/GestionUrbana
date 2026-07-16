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
};

export type CrearReporteResponse = {
  success: boolean;
  message?: string;
  data?: ReporteResumen;
};