export type RolUsuario = 'USER_ROLE' | 'ADMIN_ROLE';

export type UsuarioAutenticado = {
  id: string;
  name?: string;
  surname?: string;
  username: string;
  email: string;
  phone?: string;
  profilePicture?: string | null;
  role?: RolUsuario;
  roles: RolUsuario[];
  status?: boolean;
  isEmailVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type SolicitudLogin = {
  emailOrUsername: string;
  password: string;
};

export type RespuestaLogin = {
  success: true;
  message: string;
  token: string;
  user: UsuarioAutenticado;
};

export type SolicitudRegistro = {
  name: string;
  surname: string;
  username: string;
  email: string;
  password: string;
  phone: string;
  profilePicture?: File | null;
};

export type UsuarioRegistro = {
  username: string;
  email: string;
};

export type RespuestaRegistro = {
  success: true;
  message: string;
  user: UsuarioRegistro;
};

export type SolicitudVerificarCorreo = {
  token: string;
};

export type SolicitudReenviarVerificacion = {
  email: string;
};

export type SolicitudRecuperarPassword = {
  email: string;
};

export type SolicitudRestablecerPassword = {
  token: string;
  newPassword: string;
};

export type RespuestaMensajeAutenticacion = {
  success: true;
  message: string;
};

export type RespuestaRecuperarPassword = RespuestaMensajeAutenticacion & {
  debug_token?: string;
};

export type RespuestaPerfilAutenticado = {
  success: true;
  data: UsuarioAutenticado;
};

export type UsuarioBackend = {
  id: string;
  name?: string;
  surname?: string;
  username: string;
  email: string;
  phone?: string;
  profilePicture?: string | null;
  role?: string;
  roles?: string[];
  status?: boolean;
  isEmailVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

const rolesValidos: RolUsuario[] = ['USER_ROLE', 'ADMIN_ROLE'];

export function esRolUsuario(rol: unknown): rol is RolUsuario {
  return typeof rol === 'string' && rolesValidos.includes(rol as RolUsuario);
}

export function normalizarRolesUsuario(usuario: UsuarioBackend): RolUsuario[] {
  if (Array.isArray(usuario.roles)) {
    const roles = usuario.roles.filter(esRolUsuario);

    if (roles.length > 0) {
      return roles;
    }
  }

  if (esRolUsuario(usuario.role)) {
    return [usuario.role];
  }

  return ['USER_ROLE'];
}

export function normalizarUsuarioAutenticado(usuario: UsuarioBackend): UsuarioAutenticado {
  const roles = normalizarRolesUsuario(usuario);

  return {
    id: usuario.id,
    name: usuario.name,
    surname: usuario.surname,
    username: usuario.username,
    email: usuario.email,
    phone: usuario.phone,
    profilePicture: usuario.profilePicture ?? null,
    role: roles[0],
    roles,
    status: usuario.status,
    isEmailVerified: usuario.isEmailVerified,
    createdAt: usuario.createdAt,
    updatedAt: usuario.updatedAt
  };
}