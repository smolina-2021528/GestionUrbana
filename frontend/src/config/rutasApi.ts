import { entorno } from './entorno';

export const rutasApi = {
  autenticacion: {
    baseUrl: entorno.api.autenticacion,
    login: '/auth/login',
    registro: '/auth/register',
    logout: '/auth/logout',
    verificarCorreo: '/auth/verify-email',
    reenviarVerificacion: '/auth/resend-verification',
    solicitarRecuperacionPassword: '/auth/forgot-password',
    restablecerPassword: '/auth/reset-password',
    perfilAutenticado: '/auth/profile'
  },
  perfil: {
    actualizarPerfil: '/profile',
    cambiarPassword: '/profile/change-password'
  },
  usuarios: {
    listar: '/users',
    porRol: (nombreRol: string) => `/users/by-role/${encodeURIComponent(nombreRol)}`,
    rolesUsuario: (usuarioId: string) => `/users/${encodeURIComponent(usuarioId)}/roles`,
    cambiarRol: (usuarioId: string) => `/users/${encodeURIComponent(usuarioId)}/role`,
    cambiarEstado: (usuarioId: string) => `/users/${encodeURIComponent(usuarioId)}/status`
  },
  reportes: {
    baseUrl: entorno.api.reportes,
    listar: '/reports',
    crear: '/reports',
    misReportes: '/reports/my-reports',
    buscar: '/reports/search',
    cercanos: '/reports/nearby',
    heatmap: '/reports/heatmap',
    bbox: '/reports/bbox',
    analizarIA: '/reports/analyze',
    crearConIA: '/reports/ai-create',
    verificarDuplicados: '/reports/check-duplicates',
    similares: (reporteId: string) => `/reports/${encodeURIComponent(reporteId)}/similar`,
    detalle: (reporteId: string) => `/reports/${encodeURIComponent(reporteId)}`,
    actualizar: (reporteId: string) => `/reports/${encodeURIComponent(reporteId)}`,
    eliminar: (reporteId: string) => `/reports/${encodeURIComponent(reporteId)}`,
    cambiarEstado: (reporteId: string) => `/reports/${encodeURIComponent(reporteId)}/status`,
    asignar: (reporteId: string) => `/reports/${encodeURIComponent(reporteId)}/assign`,
    actualizarUbicacion: (reporteId: string) =>
      `/reports/${encodeURIComponent(reporteId)}/location`,
    eliminarUbicacion: (reporteId: string) =>
      `/reports/${encodeURIComponent(reporteId)}/location`,
    eliminarImagen: (reporteId: string, imagenId: string) =>
      `/reports/${encodeURIComponent(reporteId)}/images/${encodeURIComponent(imagenId)}`,
    historial: (reporteId: string) => `/reports/${encodeURIComponent(reporteId)}/history`,
    reprocesarIA: (reporteId: string) =>
      `/reports/${encodeURIComponent(reporteId)}/ai/reprocess`,
    comentarios: {
      listar: (reporteId: string) => `/reports/${encodeURIComponent(reporteId)}/comments`,
      crear: (reporteId: string) => `/reports/${encodeURIComponent(reporteId)}/comments`,
      eliminar: (reporteId: string, comentarioId: string) =>
        `/reports/${encodeURIComponent(reporteId)}/comments/${encodeURIComponent(comentarioId)}`
    },
    seguimiento: {
      seguir: (reporteId: string) => `/reports/${encodeURIComponent(reporteId)}/follow`,
      dejarDeSeguir: (reporteId: string) => `/reports/${encodeURIComponent(reporteId)}/follow`,
      seguidos: '/reports/followed'
    },
    estadisticas: {
      dashboard: '/stats/dashboard',
      tendencias: '/stats/trends',
      zonas: '/stats/zones',
      exportar: '/stats/export',
      transiciones: '/stats/transitions',
      heatmapGrid: '/stats/heatmap-grid'
    }
  },
  notificaciones: {
    baseUrl: entorno.api.reportes,
    listar: '/notifications',
    marcarTodasLeidas: '/notifications/read-all',
    marcarLeida: (notificacionId: string) =>
      `/notifications/${encodeURIComponent(notificacionId)}/read`,
    eliminar: (notificacionId: string) => `/notifications/${encodeURIComponent(notificacionId)}`
  }
} as const;