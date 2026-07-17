import { textosSistema } from '../design/identity/textosSistema';

export const rutasAplicacion = {
  login: '/login',
  registro: '/registro',
  verificarCorreo: '/verificar-correo',
  recuperarPassword: '/recuperar-password',
  restablecerPassword: '/restablecer-password',
  dashboard: '/dashboard',
  reportes: '/reportes',
  misReportes: '/mis-reportes',
  crearReporte: '/reportes/crear',
  notificaciones: '/notificaciones',
  usuarios: '/usuarios',
  perfil: '/perfil'
} as const;

export const rolesSistema = {
  ciudadano: 'USER_ROLE',
  administrador: 'ADMIN_ROLE'
} as const;

export type RolSistema = (typeof rolesSistema)[keyof typeof rolesSistema];

export type IconoNavegacion =
  | 'dashboard'
  | 'reportes'
  | 'misReportes'
  | 'crearReporte'
  | 'notificaciones'
  | 'usuarios'
  | 'perfil';

export type RutaNavegacionPrincipal = {
  ruta: string;
  etiqueta: string;
  descripcion: string;
  iconoId: IconoNavegacion;
  roles: readonly RolSistema[];
};

export const rutasNavegacionPrincipal: RutaNavegacionPrincipal[] = [
  {
    ruta: rutasAplicacion.dashboard,
    etiqueta: textosSistema.navegacion.dashboard,
    descripcion: 'Vista general de indicadores urbanos.',
    iconoId: 'dashboard',
    roles: [rolesSistema.administrador]
  },
  {
    ruta: rutasAplicacion.reportes,
    etiqueta: textosSistema.navegacion.reportes,
    descripcion: 'Mapa y gestión de incidencias.',
    iconoId: 'reportes',
    roles: [rolesSistema.administrador]
  },
  {
    ruta: rutasAplicacion.misReportes,
    etiqueta: textosSistema.navegacion.misReportes,
    descripcion: 'Seguimiento de reportes propios.',
    iconoId: 'misReportes',
    roles: [rolesSistema.administrador, rolesSistema.ciudadano]
  },
  {
    ruta: rutasAplicacion.crearReporte,
    etiqueta: textosSistema.navegacion.crearReporte,
    descripcion: 'Registro guiado de incidencias.',
    iconoId: 'crearReporte',
    roles: [rolesSistema.administrador, rolesSistema.ciudadano]
  },
  {
    ruta: rutasAplicacion.notificaciones,
    etiqueta: textosSistema.navegacion.notificaciones,
    descripcion: 'Avisos y actualizaciones.',
    iconoId: 'notificaciones',
    roles: [rolesSistema.administrador, rolesSistema.ciudadano]
  },
  {
    ruta: rutasAplicacion.usuarios,
    etiqueta: textosSistema.navegacion.usuarios,
    descripcion: 'Administración de usuarios.',
    iconoId: 'usuarios',
    roles: [rolesSistema.administrador]
  },
  {
    ruta: rutasAplicacion.perfil,
    etiqueta: textosSistema.navegacion.perfil,
    descripcion: 'Datos y seguridad de la cuenta.',
    iconoId: 'perfil',
    roles: [rolesSistema.administrador, rolesSistema.ciudadano]
  }
] as const;

export type InformacionRuta = {
  ruta: string;
  titulo: string;
  descripcion: string;
};

export const informacionRutaPorDefecto: InformacionRuta = {
  ruta: rutasAplicacion.dashboard,
  titulo: textosSistema.dashboard.titulo,
  descripcion: textosSistema.dashboard.descripcion
};

export const informacionRutas: InformacionRuta[] = [
  informacionRutaPorDefecto,
  {
    ruta: rutasAplicacion.reportes,
    titulo: textosSistema.reportes.tituloMapa,
    descripcion: textosSistema.reportes.descripcionMapa
  },
  {
    ruta: rutasAplicacion.misReportes,
    titulo: textosSistema.reportes.tituloMisReportes,
    descripcion: textosSistema.reportes.descripcionMisReportes
  },
  {
    ruta: rutasAplicacion.crearReporte,
    titulo: textosSistema.reportes.tituloCrear,
    descripcion: textosSistema.reportes.descripcionCrear
  },
  {
    ruta: rutasAplicacion.notificaciones,
    titulo: textosSistema.navegacion.notificaciones,
    descripcion: 'Consulta actualizaciones sobre reportes, asignaciones y cambios de estado.'
  },
  {
    ruta: rutasAplicacion.usuarios,
    titulo: textosSistema.navegacion.usuarios,
    descripcion: 'Gestión de usuarios, roles y estado de las cuentas.'
  },
  {
    ruta: rutasAplicacion.perfil,
    titulo: textosSistema.navegacion.perfil,
    descripcion: 'Consulta y actualiza la información de tu cuenta.'
  }
] as const;

export function obtenerInformacionRuta(rutaActual: string): InformacionRuta {
  return informacionRutas.find((ruta) => ruta.ruta === rutaActual) ?? informacionRutaPorDefecto;
}

export function obtenerRutaInicioPorRoles(roles: readonly string[]) {
  if (roles.includes(rolesSistema.administrador)) {
    return rutasAplicacion.dashboard;
  }

  if (roles.includes(rolesSistema.ciudadano)) {
    return rutasAplicacion.misReportes;
  }

  return rutasAplicacion.login;
}