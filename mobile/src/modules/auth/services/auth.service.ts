import { clienteAuth } from '../../../shared/services/clienteHttp';
import type {
  ActualizarFotoPerfilPayload,
  ActualizarPerfilPayload,
  ActualizarPerfilResponse,
  CambiarPasswordPayload,
  CambiarPasswordResponse,
  LoginPayload,
  LoginResponse,
  PerfilResponse,
  RegistroPayload,
  RegistroResponse,
  VerificarCorreoPayload,
  VerificarCorreoResponse
} from '../types/auth.types';

type ArchivoReactNative = {
  uri: string;
  name: string;
  type: string;
};

function usuarioEsAdministrador(roles: string[]) {
  return roles.includes('ADMIN_ROLE');
}

function obtenerNombreArchivo(uri: string, fileName?: string | null) {
  if (fileName) {
    return fileName;
  }

  const partes = uri.split('/');
  const ultimoSegmento = partes[partes.length - 1];

  if (ultimoSegmento && ultimoSegmento.includes('.')) {
    return ultimoSegmento;
  }

  return `perfil-${Date.now()}.jpg`;
}

function obtenerTipoMime(mimeType?: string | null) {
  return mimeType || 'image/jpeg';
}

function construirArchivoPerfil(payload: ActualizarFotoPerfilPayload): ArchivoReactNative {
  return {
    uri: payload.uri,
    name: obtenerNombreArchivo(payload.uri, payload.fileName),
    type: obtenerTipoMime(payload.mimeType)
  };
}

function construirFormDataFotoPerfil(payload: ActualizarFotoPerfilPayload) {
  const formData = new FormData();
  const archivo = construirArchivoPerfil(payload);

  formData.append('profilePicture', archivo as unknown as Blob);

  return formData;
}

function validarUsuarioMovil(datos: PerfilResponse | ActualizarPerfilResponse | LoginResponse) {
  const usuario = 'user' in datos ? datos.user : datos.data;

  if (usuarioEsAdministrador(usuario.roles ?? [])) {
    throw {
      codigo: 'NO_AUTORIZADO',
      estadoHttp: 403,
      mensaje:
        'Esta aplicación móvil es exclusiva para ciudadanos. Los administradores deben usar la versión web.'
    };
  }

  return datos;
}

export const authService = {
  async iniciarSesion(payload: LoginPayload) {
    const respuesta = await clienteAuth.post<LoginResponse>('/auth/login', payload);
    const datos = validarUsuarioMovil(respuesta.data);

    return datos as LoginResponse;
  },

  async registrarUsuario(payload: RegistroPayload) {
    const respuesta = await clienteAuth.post<RegistroResponse>('/auth/register', payload);
    return respuesta.data;
  },

  async verificarCorreo(payload: VerificarCorreoPayload) {
    const respuesta = await clienteAuth.post<VerificarCorreoResponse>('/auth/verify-email', payload);
    return respuesta.data;
  },

  async obtenerPerfil() {
    const respuesta = await clienteAuth.get<PerfilResponse>('/auth/profile');
    const datos = validarUsuarioMovil(respuesta.data);

    return datos as PerfilResponse;
  },

  async actualizarPerfil(payload: ActualizarPerfilPayload) {
    const respuesta = await clienteAuth.patch<ActualizarPerfilResponse>('/profile', payload);
    const datos = validarUsuarioMovil(respuesta.data);

    return datos as ActualizarPerfilResponse;
  },

  async actualizarFotoPerfil(payload: ActualizarFotoPerfilPayload) {
    const respuesta = await clienteAuth.put<ActualizarPerfilResponse>(
      '/profile',
      construirFormDataFotoPerfil(payload),
      {
        timeout: 60000,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );

    const datos = validarUsuarioMovil(respuesta.data);

    return datos as ActualizarPerfilResponse;
  },

  async cambiarPassword(payload: CambiarPasswordPayload) {
    const respuesta = await clienteAuth.put<CambiarPasswordResponse>(
      '/profile/change-password',
      payload
    );

    return respuesta.data;
  },

  async cerrarSesion() {
    await clienteAuth.post('/auth/logout');
  }
};