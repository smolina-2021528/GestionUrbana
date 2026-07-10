import type {
  RolUsuario
} from '../../authentication/types/autenticacionTipos';

export const rolesAdministrablesUsuario: RolUsuario[] = [
  'USER_ROLE',
  'ADMIN_ROLE'
];

export type UsuarioSistema = {
  id: string;
  name?: string;
  surname?: string;
  username: string;
  email: string;
  phone?: string;
  profilePicture?: string | null;
  role: RolUsuario;
  status: boolean;
  isEmailVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type PaginacionUsuarios = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type FiltrosUsuarios = {
  page?: number;
  limit?: number;
  search?: string;
};

export type CambiarRolUsuarioPayload = {
  roleName: RolUsuario;
};

export type RespuestaUsuariosFallida = {
  success: false;
  message?: string;
  error?: string;
  errors?: unknown;
};

export type RespuestaUsuariosExitosa<TDatos> = {
  success: true;
  message?: string;
  data: TDatos;
};

export type RespuestaUsuarios<TDatos> =
  | RespuestaUsuariosExitosa<TDatos>
  | RespuestaUsuariosFallida;

export type RespuestaListadoUsuariosExitosa = {
  success: true;
  message?: string;
  data: UsuarioSistema[];
  pagination: PaginacionUsuarios;
};

export type RespuestaListadoUsuarios =
  | RespuestaListadoUsuariosExitosa
  | RespuestaUsuariosFallida;

export type RespuestaUsuariosPorRol = RespuestaUsuarios<
  UsuarioSistema[]
>;

export type RespuestaRolesUsuario = RespuestaUsuarios<
  RolUsuario[]
>;

export type RespuestaActualizarUsuario = RespuestaUsuarios<
  UsuarioSistema
>;

export type ParametrosCambiarRolUsuario = {
  usuarioId: string;
  datos: CambiarRolUsuarioPayload;
};

export type UsuarioAsignableReporte = UsuarioSistema & {
  role: 'ADMIN_ROLE';
};

export function esRolAdministrableUsuario(
  valor: unknown
): valor is RolUsuario {
  return (
    typeof valor === 'string' &&
    rolesAdministrablesUsuario.includes(valor as RolUsuario)
  );
}

export function obtenerNombreCompletoUsuario(
  usuario: Pick<
    UsuarioSistema,
    'name' | 'surname' | 'username'
  >
) {
  const nombreCompleto = [
    usuario.name,
    usuario.surname
  ]
    .filter(Boolean)
    .join(' ')
    .trim();

  return nombreCompleto || usuario.username;
}