import axios from 'axios';

import { esErrorApi } from '../types/errorApi';
import type { ErrorApi } from '../types/errorApi';

type DetalleErrorValidacion = {
  field?: string;
  message?: string;
  value?: unknown;
};

type RespuestaErrorBackend = {
  message?: string;
  error?: string;
  errors?: unknown;
};

function repararCaracteresEspeciales(texto: string) {
  return texto
    .replaceAll('Ã¡', 'á')
    .replaceAll('Ã©', 'é')
    .replaceAll('Ã­', 'í')
    .replaceAll('Ã³', 'ó')
    .replaceAll('Ãº', 'ú')
    .replaceAll('ÃÁ', 'Á')
    .replaceAll('Ã‰', 'É')
    .replaceAll('ÃÍ', 'Í')
    .replaceAll('Ã“', 'Ó')
    .replaceAll('Ãš', 'Ú')
    .replaceAll('Ã±', 'ñ')
    .replaceAll('Ã‘', 'Ñ')
    .replaceAll('Â¡', '¡')
    .replaceAll('Â¿', '¿');
}

function normalizarMensaje(mensaje?: string) {
  if (!mensaje || mensaje.trim().length === 0) {
    return undefined;
  }

  return repararCaracteresEspeciales(mensaje.trim());
}

function obtenerMensajeDesdeRespuesta(data: unknown) {
  if (!data || typeof data !== 'object') {
    return undefined;
  }

  const respuesta = data as RespuestaErrorBackend;

  if (Array.isArray(respuesta.errors) && respuesta.errors.length > 0) {
    const primerError = respuesta.errors[0] as DetalleErrorValidacion;
    const mensajeDetalle = normalizarMensaje(primerError.message);

    if (mensajeDetalle) {
      return mensajeDetalle;
    }
  }

  const mensajeRespuesta = normalizarMensaje(respuesta.message);

  if (mensajeRespuesta) {
    return mensajeRespuesta;
  }

  const errorRespuesta = normalizarMensaje(respuesta.error);

  if (errorRespuesta) {
    return errorRespuesta;
  }

  return undefined;
}

function obtenerDetallesDesdeRespuesta(data: unknown) {
  if (!data || typeof data !== 'object') {
    return undefined;
  }

  const respuesta = data as RespuestaErrorBackend;
  return respuesta.errors;
}

function construirErrorPorEstado(
  estadoHttp: number,
  mensajeBackend?: string,
  detalles?: unknown
): ErrorApi {
  if (estadoHttp === 400) {
    return {
      codigo: 'ERROR_VALIDACION',
      estadoHttp,
      mensaje: mensajeBackend ?? 'Revisa la información ingresada e intenta nuevamente.',
      detalles
    };
  }

  if (estadoHttp === 401) {
    return {
      codigo: 'NO_AUTENTICADO',
      estadoHttp,
      mensaje: mensajeBackend ?? 'Tu sesión no es válida o ha expirado.',
      detalles
    };
  }

  if (estadoHttp === 403) {
    return {
      codigo: 'NO_AUTORIZADO',
      estadoHttp,
      mensaje: mensajeBackend ?? 'No tienes permisos para realizar esta acción.',
      detalles
    };
  }

  if (estadoHttp === 423) {
    return {
      codigo: 'CUENTA_DESACTIVADA',
      estadoHttp,
      mensaje: mensajeBackend ?? 'Tu cuenta está desactivada. Contacta al administrador.',
      detalles
    };
  }

  if (estadoHttp === 404) {
    return {
      codigo: 'RECURSO_NO_ENCONTRADO',
      estadoHttp,
      mensaje: mensajeBackend ?? 'No se encontró la información solicitada.',
      detalles
    };
  }

  if (estadoHttp === 409) {
    return {
      codigo: 'CONFLICTO',
      estadoHttp,
      mensaje: mensajeBackend ?? 'Ya existe un registro con esta información.',
      detalles
    };
  }

  if (estadoHttp >= 500) {
    return {
      codigo: 'ERROR_SERVIDOR',
      estadoHttp,
      mensaje: mensajeBackend ?? 'Ocurrió un problema en el servidor. Intenta nuevamente.',
      detalles
    };
  }

  return {
    codigo: 'ERROR_DESCONOCIDO',
    estadoHttp,
    mensaje: mensajeBackend ?? 'Ocurrió un error inesperado. Intenta nuevamente.',
    detalles
  };
}

export function normalizarErrorApi(error: unknown): ErrorApi {
  if (esErrorApi(error)) {
    return {
      ...error,
      mensaje: repararCaracteresEspeciales(error.mensaje)
    };
  }

  if (!axios.isAxiosError(error)) {
    return {
      codigo: 'ERROR_DESCONOCIDO',
      mensaje: 'Ocurrió un error inesperado. Intenta nuevamente.',
      detalles: error
    };
  }

  if (!error.response) {
    return {
      codigo: 'ERROR_RED',
      mensaje: 'No fue posible conectar con el servidor. Revisa tu conexión e intenta nuevamente.',
      detalles: error.message
    };
  }

  const estadoHttp = error.response.status;
  const mensajeBackend = obtenerMensajeDesdeRespuesta(error.response.data);
  const detalles = obtenerDetallesDesdeRespuesta(error.response.data);

  return construirErrorPorEstado(estadoHttp, mensajeBackend, detalles);
}

export function obtenerMensajeError(error: unknown) {
  return normalizarErrorApi(error).mensaje;
}