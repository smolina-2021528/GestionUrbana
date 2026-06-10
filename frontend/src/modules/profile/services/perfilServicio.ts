import { rutasApi } from '../../../config/rutasApi';
import { clienteAuth, obtenerDatosRespuesta } from '../../../shared/services/clienteHttp';
import { normalizarUsuarioAutenticado } from '../../authentication/types/autenticacionTipos';
import type { UsuarioBackend } from '../../authentication/types/autenticacionTipos';
import type {
  RespuestaActualizarPerfil,
  RespuestaCambiarPassword,
  SolicitudActualizarPerfil,
  SolicitudCambiarPassword
} from '../types/perfilTipos';

type RespuestaActualizarPerfilBackend = {
  success: true;
  message: string;
  data: UsuarioBackend;
};

function tieneImagenPerfil(datos: SolicitudActualizarPerfil) {
  return Boolean(datos.profilePicture);
}

function construirFormularioPerfil(datos: SolicitudActualizarPerfil) {
  const formulario = new FormData();

  if (datos.name !== undefined) {
    formulario.append('name', datos.name);
  }

  if (datos.surname !== undefined) {
    formulario.append('surname', datos.surname);
  }

  if (datos.username !== undefined) {
    formulario.append('username', datos.username);
  }

  if (datos.phone !== undefined) {
    formulario.append('phone', datos.phone);
  }

  if (datos.profilePicture) {
    formulario.append('profilePicture', datos.profilePicture);
  }

  return formulario;
}

function limpiarDatosPerfil(datos: SolicitudActualizarPerfil) {
  return {
    ...(datos.name !== undefined && { name: datos.name.trim() }),
    ...(datos.surname !== undefined && { surname: datos.surname.trim() }),
    ...(datos.username !== undefined && { username: datos.username.trim() }),
    ...(datos.phone !== undefined && { phone: datos.phone.trim() })
  };
}

export const perfilServicio = {
  async actualizarPerfil(datos: SolicitudActualizarPerfil): Promise<RespuestaActualizarPerfil> {
    const respuesta = await obtenerDatosRespuesta<RespuestaActualizarPerfilBackend>(
      tieneImagenPerfil(datos)
        ? clienteAuth.put(rutasApi.perfil.actualizarPerfil, construirFormularioPerfil(datos), {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          })
        : clienteAuth.put(rutasApi.perfil.actualizarPerfil, limpiarDatosPerfil(datos))
    );

    return {
      success: true,
      message: respuesta.message,
      data: normalizarUsuarioAutenticado(respuesta.data)
    };
  },

  async cambiarPassword(datos: SolicitudCambiarPassword): Promise<RespuestaCambiarPassword> {
    return obtenerDatosRespuesta<RespuestaCambiarPassword>(
      clienteAuth.put(rutasApi.perfil.cambiarPassword, {
        currentPassword: datos.currentPassword,
        newPassword: datos.newPassword
      })
    );
  }
};