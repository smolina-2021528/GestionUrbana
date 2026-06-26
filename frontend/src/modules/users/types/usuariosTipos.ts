import type { RolUsuario } from '../../authentication/types/autenticacionTipos';

export type UsuarioSistema = {
  id: string;
  name?: string;
  surname?: string;
  username: string;
  email: string;
  phone?: string;
  profilePicture?: string | null;
  role?: RolUsuario | string;
  status?: boolean;
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

export type RespuestaUsuariosExitosa<TDatos = UsuarioSistema[]> = {
  success: true;
  message?: string;
  data?: TDatos;
  pagination?: PaginacionUsuarios;
};

export type RespuestaUsuariosFallida = {
  success: false;
  message?: string;
  error?: string;
  errors?: unknown;
};

export type RespuestaUsuarios<TDatos = UsuarioSistema[]> =
  | RespuestaUsuariosExitosa<TDatos>
  | RespuestaUsuariosFallida;

export type FiltrosUsuarios = {
  page?: number;
  limit?: number;
  search?: string;
};

export type UsuarioAsignableReporte = UsuarioSistema & {
  role: 'ADMIN_ROLE' | string;
};