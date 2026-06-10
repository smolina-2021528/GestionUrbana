import type { UsuarioAutenticado } from '../../authentication/types/autenticacionTipos';

export type PerfilUsuario = UsuarioAutenticado;

export type SolicitudActualizarPerfil = {
  name?: string;
  surname?: string;
  username?: string;
  phone?: string;
  profilePicture?: File | null;
};

export type RespuestaActualizarPerfil = {
  success: true;
  message: string;
  data: PerfilUsuario;
};

export type SolicitudCambiarPassword = {
  currentPassword: string;
  newPassword: string;
};

export type RespuestaCambiarPassword = {
  success: true;
  message: string;
};