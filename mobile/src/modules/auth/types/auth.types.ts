export type RolUsuario = 'USER_ROLE' | 'ADMIN_ROLE' | string;

export type UsuarioAutenticado = {
  id: string;
  name: string;
  surname?: string;
  username: string;
  email: string;
  phone?: string;
  profilePicture?: string | null;
  role?: RolUsuario;
  roles: RolUsuario[];
  status: boolean;
  isEmailVerified?: boolean;
};

export type LoginPayload = {
  emailOrUsername: string;
  password: string;
};

export type RegistroPayload = {
  name: string;
  surname: string;
  username: string;
  email: string;
  password: string;
  phone: string;
};

export type VerificarCorreoPayload = {
  token: string;
};

export type ActualizarPerfilPayload = {
  name: string;
  surname: string;
  phone?: string;
};

export type ActualizarFotoPerfilPayload = {
  uri: string;
  fileName?: string | null;
  mimeType?: string | null;
};

export type CambiarPasswordPayload = {
  currentPassword: string;
  newPassword: string;
};

export type LoginResponse = {
  success: boolean;
  message?: string;
  token: string;
  user: UsuarioAutenticado;
};

export type PerfilResponse = {
  success: boolean;
  message?: string;
  data: UsuarioAutenticado;
};

export type RegistroResponse = {
  success: boolean;
  message: string;
};

export type VerificarCorreoResponse = {
  success: boolean;
  message: string;
};

export type ActualizarPerfilResponse = {
  success: boolean;
  message: string;
  data: UsuarioAutenticado;
};

export type CambiarPasswordResponse = {
  success: boolean;
  message: string;
};