import { rutasApi } from '../../../config/rutasApi';
import { clienteAuth, obtenerDatosRespuesta } from '../../../shared/services/clienteHttp';
import type {
  RespuestaLogin,
  RespuestaMensajeAutenticacion,
  RespuestaPerfilAutenticado,
  RespuestaRecuperarPassword,
  RespuestaRegistro,
  SolicitudLogin,
  SolicitudRecuperarPassword,
  SolicitudReenviarVerificacion,
  SolicitudRegistro,
  SolicitudRestablecerPassword,
  SolicitudVerificarCorreo,
  UsuarioBackend
} from '../types/autenticacionTipos';
import { normalizarUsuarioAutenticado } from '../types/autenticacionTipos';

type RespuestaLoginBackend = {
  success: true;
  message: string;
  token: string;
  user: UsuarioBackend;
};

type RespuestaPerfilBackend = {
  success: true;
  data: UsuarioBackend;
};

function construirFormularioRegistro(datos: SolicitudRegistro) {
  const formulario = new FormData();

  formulario.append('name', datos.name);
  formulario.append('surname', datos.surname);
  formulario.append('username', datos.username);
  formulario.append('email', datos.email);
  formulario.append('password', datos.password);
  formulario.append('phone', datos.phone);

  if (datos.profilePicture) {
    formulario.append('profilePicture', datos.profilePicture);
  }

  return formulario;
}

function tieneImagenPerfil(datos: SolicitudRegistro) {
  return Boolean(datos.profilePicture);
}

export const autenticacionServicio = {
  async iniciarSesion(datos: SolicitudLogin): Promise<RespuestaLogin> {
    const respuesta = await obtenerDatosRespuesta<RespuestaLoginBackend>(
      clienteAuth.post(rutasApi.autenticacion.login, {
        emailOrUsername: datos.emailOrUsername.trim(),
        password: datos.password
      })
    );

    return {
      success: true,
      message: respuesta.message,
      token: respuesta.token,
      user: normalizarUsuarioAutenticado(respuesta.user)
    };
  },

  async registrarUsuario(datos: SolicitudRegistro): Promise<RespuestaRegistro> {
    if (tieneImagenPerfil(datos)) {
      return obtenerDatosRespuesta<RespuestaRegistro>(
        clienteAuth.post(rutasApi.autenticacion.registro, construirFormularioRegistro(datos), {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
      );
    }

    return obtenerDatosRespuesta<RespuestaRegistro>(
      clienteAuth.post(rutasApi.autenticacion.registro, {
        name: datos.name.trim(),
        surname: datos.surname.trim(),
        username: datos.username.trim(),
        email: datos.email.trim().toLowerCase(),
        password: datos.password,
        phone: datos.phone.trim()
      })
    );
  },

  async cerrarSesion(): Promise<RespuestaMensajeAutenticacion> {
    return obtenerDatosRespuesta<RespuestaMensajeAutenticacion>(
      clienteAuth.post(rutasApi.autenticacion.logout)
    );
  },

  async obtenerPerfilAutenticado(): Promise<RespuestaPerfilAutenticado> {
    const respuesta = await obtenerDatosRespuesta<RespuestaPerfilBackend>(
      clienteAuth.get(rutasApi.autenticacion.perfilAutenticado)
    );

    return {
      success: true,
      data: normalizarUsuarioAutenticado(respuesta.data)
    };
  },

  async verificarCorreo(
    datos: SolicitudVerificarCorreo
  ): Promise<RespuestaMensajeAutenticacion> {
    return obtenerDatosRespuesta<RespuestaMensajeAutenticacion>(
      clienteAuth.post(rutasApi.autenticacion.verificarCorreo, {
        token: datos.token.trim()
      })
    );
  },

  async reenviarVerificacion(
    datos: SolicitudReenviarVerificacion
  ): Promise<RespuestaMensajeAutenticacion> {
    return obtenerDatosRespuesta<RespuestaMensajeAutenticacion>(
      clienteAuth.post(rutasApi.autenticacion.reenviarVerificacion, {
        email: datos.email.trim().toLowerCase()
      })
    );
  },

  async solicitarRecuperacionPassword(
    datos: SolicitudRecuperarPassword
  ): Promise<RespuestaRecuperarPassword> {
    return obtenerDatosRespuesta<RespuestaRecuperarPassword>(
      clienteAuth.post(rutasApi.autenticacion.solicitarRecuperacionPassword, {
        email: datos.email.trim().toLowerCase()
      })
    );
  },

  async restablecerPassword(
    datos: SolicitudRestablecerPassword
  ): Promise<RespuestaMensajeAutenticacion> {
    return obtenerDatosRespuesta<RespuestaMensajeAutenticacion>(
      clienteAuth.post(rutasApi.autenticacion.restablecerPassword, {
        token: datos.token.trim(),
        newPassword: datos.newPassword
      })
    );
  }
};