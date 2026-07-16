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

export type LoginResponse = {
  success: boolean;
  message?: string;
  token: string;
  user: UsuarioAutenticado;
};

export type PerfilResponse = {
  success: boolean;
  data: UsuarioAutenticado;
};

export type RegistroResponse = {
  success: boolean;
  message: string;
};