import type {
  CategoriaReporte,
  EstadoReporte,
  PrioridadReporte,
  Reporte,
  UsuarioResumenReporte
} from './reportesTipos';

export const agrupacionesOperativasReporte = [
  'ESTADO',
  'PRIORIDAD',
  'CATEGORIA',
  'RESPONSABLE'
] as const;

export const estadosGestionablesReporte = [
  'PENDIENTE',
  'EN_PROCESO',
  'RESUELTO',
  'RECHAZADO'
] as const;

export const transicionesOperativasReporte: Record<EstadoReporte, EstadoReporte[]> = {
  PENDIENTE: ['EN_PROCESO', 'RECHAZADO'],
  EN_PROCESO: ['RESUELTO', 'RECHAZADO', 'PENDIENTE'],
  RESUELTO: [],
  RECHAZADO: ['PENDIENTE']
};

export const nivelesAtencionOperativa = ['CRITICO', 'ALTO', 'MEDIO', 'BAJO'] as const;

export type AgrupacionOperativaReporte = (typeof agrupacionesOperativasReporte)[number];

export type NivelAtencionOperativa = (typeof nivelesAtencionOperativa)[number];

export type ResponsableOperativoReporte = UsuarioResumenReporte | null;

export type ConteoPorEstadoReporte = Record<EstadoReporte, number>;

export type ConteoPorPrioridadReporte = Record<PrioridadReporte, number>;

export type ConteoPorCategoriaReporte = Record<CategoriaReporte, number>;

export type ResumenOperativoReportes = {
  total: number;
  pendientes: number;
  enProceso: number;
  resueltos: number;
  rechazados: number;
  altaPrioridad: number;
  sinResponsable: number;
  conResponsable: number;
  conUbicacion: number;
  sinUbicacion: number;
  porEstado: ConteoPorEstadoReporte;
  porPrioridad: ConteoPorPrioridadReporte;
  porCategoria: ConteoPorCategoriaReporte;
};

export type CargaTrabajoResponsable = {
  responsable: ResponsableOperativoReporte;
  responsableId: string | null;
  nombreResponsable: string;
  total: number;
  pendientes: number;
  enProceso: number;
  resueltos: number;
  rechazados: number;
  altaPrioridad: number;
};

export type ReporteOperativoAgrupado = {
  clave: string;
  titulo: string;
  descripcion: string;
  total: number;
  reportes: Reporte[];
};

export type EvaluacionOperativaReporte = {
  nivel: NivelAtencionOperativa;
  etiqueta: string;
  descripcion: string;
  requiereAtencion: boolean;
};

export type TransicionEstadoReporte = {
  estado: EstadoReporte;
  etiqueta: string;
  disponible: boolean;
  descripcion: string;
};

export type FiltrosLocalesOperacionReportes = {
  soloSinResponsable?: boolean;
  soloConResponsable?: boolean;
  soloAltaPrioridad?: boolean;
  soloConUbicacion?: boolean;
  soloSinUbicacion?: boolean;
};