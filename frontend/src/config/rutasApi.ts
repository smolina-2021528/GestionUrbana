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
    baseUrl: entorno.api.reportes
  }
} as const;