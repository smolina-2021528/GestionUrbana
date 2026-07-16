import axios from 'axios';

export type ErrorApi = {
  mensaje: string;
  estadoHttp?: number;
  codigo:
    | 'ERROR_VALIDACION'
    | 'NO_AUTENTICADO'
    | 'CUENTA_DESACTIVADA'
    | 'NO_AUTORIZADO'
    | 'ERROR_RED'
    | 'ERROR_SERVIDOR'
    | 'ERROR_DESCONOCIDO';
};

type RespuestaErrorBackend = {
  message?: string;
  error?: string;
};

function obtenerMensaje(data: unknown) {
  if (!data || typeof data !== 'object') {
    return undefined;
  }

  const respuesta = data as RespuestaErrorBackend;
  return respuesta.message || respuesta.error;
}

export function normalizarErrorApi(error: unknown): ErrorApi {
  if (!axios.isAxiosError(error)) {
    return {
      codigo: 'ERROR_DESCONOCIDO',
      mensaje: 'Ocurrió un error inesperado.'
    };
  }

  if (!error.response) {
    return {
      codigo: 'ERROR_RED',
      mensaje: 'No fue posible conectar con el servidor. Revisa tu conexión.'
    };
  }

  const estadoHttp = error.response.status;
  const mensajeBackend = obtenerMensaje(error.response.data);

  if (estadoHttp === 400 || estadoHttp === 422) {
    return {
      codigo: 'ERROR_VALIDACION',
      estadoHttp,
      mensaje: mensajeBackend ?? 'Revisa la información ingresada.'
    };
  }

  if (estadoHttp === 401) {
    return {
      codigo: 'NO_AUTENTICADO',
      estadoHttp,
      mensaje: mensajeBackend ?? 'Tu sesión no es válida o ha expirado.'
    };
  }

  if (estadoHttp === 403) {
    return {
      codigo: 'NO_AUTORIZADO',
      estadoHttp,
      mensaje: mensajeBackend ?? 'No tienes permisos para realizar esta acción.'
    };
  }

  if (estadoHttp === 423) {
    return {
      codigo: 'CUENTA_DESACTIVADA',
      estadoHttp,
      mensaje: mensajeBackend ?? 'Tu cuenta está desactivada. Contacta al administrador.'
    };
  }

  if (estadoHttp >= 500) {
    return {
      codigo: 'ERROR_SERVIDOR',
      estadoHttp,
      mensaje: mensajeBackend ?? 'Ocurrió un problema en el servidor.'
    };
  }

  return {
    codigo: 'ERROR_DESCONOCIDO',
    estadoHttp,
    mensaje: mensajeBackend ?? 'Ocurrió un error inesperado.'
  };
}