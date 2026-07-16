import { clienteAuth } from '../../../shared/services/clienteHttp';
import type {
  LoginPayload,
  LoginResponse,
  PerfilResponse,
  RegistroPayload,
  RegistroResponse
} from '../types/auth.types';

function usuarioEsAdministrador(roles: string[]) {
  return roles.includes('ADMIN_ROLE');
}

export const authService = {
  async iniciarSesion(payload: LoginPayload) {
    const respuesta = await clienteAuth.post<LoginResponse>('/auth/login', payload);
    const datos = respuesta.data;

    if (usuarioEsAdministrador(datos.user.roles ?? [])) {
      throw {
        codigo: 'NO_AUTORIZADO',
        estadoHttp: 403,
        mensaje:
          'Esta aplicación móvil es exclusiva para ciudadanos. Los administradores deben usar la versión web.'
      };
    }

    return datos;
  },

  async registrarUsuario(payload: RegistroPayload) {
    const respuesta = await clienteAuth.post<RegistroResponse>('/auth/register', payload);
    return respuesta.data;
  },

  async obtenerPerfil() {
    const respuesta = await clienteAuth.get<PerfilResponse>('/auth/profile');

    if (usuarioEsAdministrador(respuesta.data.data.roles ?? [])) {
      throw {
        codigo: 'NO_AUTORIZADO',
        estadoHttp: 403,
        mensaje:
          'Esta aplicación móvil es exclusiva para ciudadanos. Los administradores deben usar la versión web.'
      };
    }

    return respuesta.data;
  },

  async cerrarSesion() {
    await clienteAuth.post('/auth/logout');
  }
};