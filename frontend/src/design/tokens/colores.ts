export const colores = {
  azulCivico: {
    50: '#eef6ff',
    100: '#d9ebff',
    200: '#b6d8ff',
    300: '#86bcff',
    400: '#4f97f3',
    500: '#2474d6',
    600: '#165daf',
    700: '#144d8d',
    800: '#164274',
    900: '#173961'
  },
  verdeOperativo: {
    50: '#edfdf4',
    100: '#d3f8e3',
    200: '#abefca',
    300: '#74dfa8',
    400: '#3cc77f',
    500: '#19a963',
    600: '#0d884f',
    700: '#0b6d41',
    800: '#0c5736',
    900: '#0b482f'
  },
  amarilloAlerta: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fbd34d',
    400: '#f9bd20',
    500: '#f09d0b',
    600: '#d97906',
    700: '#b45609',
    800: '#92420e',
    900: '#78370f'
  },
  rojoCritico: {
    50: '#fff1f2',
    100: '#ffe4e6',
    200: '#fecdd3',
    300: '#fda4af',
    400: '#fb7185',
    500: '#f43f5e',
    600: '#e11d48',
    700: '#be123c',
    800: '#9f1239',
    900: '#881337'
  },
  grisUrbano: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a'
  },
  blanco: '#ffffff',
  grafito: '#172033',
  negroSuave: '#0b1120'
} as const;

export const coloresSemanticos = {
  principal: colores.azulCivico[600],
  principalHover: colores.azulCivico[700],
  principalSuave: colores.azulCivico[50],
  exito: colores.verdeOperativo[600],
  exitoSuave: colores.verdeOperativo[50],
  advertencia: colores.amarilloAlerta[600],
  advertenciaSuave: colores.amarilloAlerta[50],
  error: colores.rojoCritico[600],
  errorSuave: colores.rojoCritico[50],
  fondo: colores.grisUrbano[100],
  superficie: colores.blanco,
  superficieSecundaria: colores.grisUrbano[50],
  borde: colores.grisUrbano[200],
  texto: colores.grafito,
  textoSecundario: colores.grisUrbano[600],
  textoSuave: colores.grisUrbano[500],
  textoInvertido: colores.blanco
} as const;

export const coloresPrioridad = {
  BAJA: {
    texto: colores.verdeOperativo[700],
    fondo: colores.verdeOperativo[50],
    borde: colores.verdeOperativo[200]
  },
  MEDIA: {
    texto: colores.amarilloAlerta[700],
    fondo: colores.amarilloAlerta[50],
    borde: colores.amarilloAlerta[200]
  },
  ALTA: {
    texto: colores.rojoCritico[700],
    fondo: colores.rojoCritico[50],
    borde: colores.rojoCritico[200]
  }
} as const;

export const coloresEstado = {
  PENDIENTE: {
    texto: colores.amarilloAlerta[700],
    fondo: colores.amarilloAlerta[50],
    borde: colores.amarilloAlerta[200]
  },
  EN_PROCESO: {
    texto: colores.azulCivico[700],
    fondo: colores.azulCivico[50],
    borde: colores.azulCivico[200]
  },
  RESUELTO: {
    texto: colores.verdeOperativo[700],
    fondo: colores.verdeOperativo[50],
    borde: colores.verdeOperativo[200]
  },
  RECHAZADO: {
    texto: colores.rojoCritico[700],
    fondo: colores.rojoCritico[50],
    borde: colores.rojoCritico[200]
  }
} as const;