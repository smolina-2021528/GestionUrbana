export type EstadoReporte = 'PENDIENTE' | 'EN_PROCESO' | 'RESUELTO' | 'RECHAZADO';

export type PrioridadReporte = 'BAJA' | 'MEDIA' | 'ALTA';

export type CategoriaReporte = 'INFRAESTRUCTURA' | 'SEGURIDAD' | 'LIMPIEZA';

export const estadosReporte = {
  PENDIENTE: {
    valor: 'PENDIENTE',
    etiqueta: 'Pendiente',
    descripcion: 'Reporte recibido y pendiente de revisión.',
    clase: 'estadoPendiente',
    colorTexto: 'var(--color-estado-pendiente)',
    colorFondo: 'var(--color-estado-pendiente-fondo)'
  },
  EN_PROCESO: {
    valor: 'EN_PROCESO',
    etiqueta: 'En proceso',
    descripcion: 'Reporte revisado y actualmente en atención.',
    clase: 'estadoEnProceso',
    colorTexto: 'var(--color-estado-en-proceso)',
    colorFondo: 'var(--color-estado-en-proceso-fondo)'
  },
  RESUELTO: {
    valor: 'RESUELTO',
    etiqueta: 'Resuelto',
    descripcion: 'Reporte atendido y cerrado correctamente.',
    clase: 'estadoResuelto',
    colorTexto: 'var(--color-estado-resuelto)',
    colorFondo: 'var(--color-estado-resuelto-fondo)'
  },
  RECHAZADO: {
    valor: 'RECHAZADO',
    etiqueta: 'Rechazado',
    descripcion: 'Reporte rechazado por información insuficiente o no aplicable.',
    clase: 'estadoRechazado',
    colorTexto: 'var(--color-estado-rechazado)',
    colorFondo: 'var(--color-estado-rechazado-fondo)'
  }
} as const satisfies Record<
  EstadoReporte,
  {
    valor: EstadoReporte;
    etiqueta: string;
    descripcion: string;
    clase: string;
    colorTexto: string;
    colorFondo: string;
  }
>;

export const prioridadesReporte = {
  BAJA: {
    valor: 'BAJA',
    etiqueta: 'Baja',
    descripcion: 'Incidencia de bajo riesgo o impacto limitado.',
    clase: 'prioridadBaja',
    colorTexto: 'var(--color-prioridad-baja)',
    colorFondo: 'var(--color-prioridad-baja-fondo)'
  },
  MEDIA: {
    valor: 'MEDIA',
    etiqueta: 'Media',
    descripcion: 'Incidencia que requiere seguimiento oportuno.',
    clase: 'prioridadMedia',
    colorTexto: 'var(--color-prioridad-media)',
    colorFondo: 'var(--color-prioridad-media-fondo)'
  },
  ALTA: {
    valor: 'ALTA',
    etiqueta: 'Alta',
    descripcion: 'Incidencia crítica que requiere atención prioritaria.',
    clase: 'prioridadAlta',
    colorTexto: 'var(--color-prioridad-alta)',
    colorFondo: 'var(--color-prioridad-alta-fondo)'
  }
} as const satisfies Record<
  PrioridadReporte,
  {
    valor: PrioridadReporte;
    etiqueta: string;
    descripcion: string;
    clase: string;
    colorTexto: string;
    colorFondo: string;
  }
>;

export const categoriasReporte = {
  INFRAESTRUCTURA: {
    valor: 'INFRAESTRUCTURA',
    etiqueta: 'Infraestructura',
    ejemplosVisuales: ['Bache', 'Calle dañada', 'Banqueta en mal estado', 'Problemas de agua']
  },
  SEGURIDAD: {
    valor: 'SEGURIDAD',
    etiqueta: 'Seguridad',
    ejemplosVisuales: ['Alumbrado', 'Zona insegura', 'Señalización dañada']
  },
  LIMPIEZA: {
    valor: 'LIMPIEZA',
    etiqueta: 'Limpieza',
    ejemplosVisuales: ['Basura', 'Desechos acumulados', 'Área contaminada']
  }
} as const satisfies Record<
  CategoriaReporte,
  {
    valor: CategoriaReporte;
    etiqueta: string;
    ejemplosVisuales: string[];
  }
>;