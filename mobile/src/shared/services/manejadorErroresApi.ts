import axios, { AxiosError } from 'axios';

export type ErrorApi = {
  codigo: string;
  estadoHttp?: number;
  mensaje: string;
  detalle?: unknown;
};

type RespuestaErrorBackend = {
  success?: boolean;
  message?: string;
  error?: string;
  errors?: unknown;
  code?: string;
};

function obtenerMensajeBackend(data: unknown) {
  if (!data || typeof data !== 'object') {
    return null;
  }

  const respuesta = data as RespuestaErrorBackend;

  return respuesta.message ?? respuesta.error ?? null;
}

function obtenerCodigoBackend(data: unknown) {
  if (!data || typeof data !== 'object') {
    return null;
  }

  const respuesta = data as RespuestaErrorBackend;

  return respuesta.code ?? null;
}

function obtenerMensajePorEstado(estado?: number) {
  if (estado === 400) {
    return 'La información enviada no es válida. Revisa los campos e intenta nuevamente.';
  }

  if (estado === 401) {
    return 'Tu sesión venció o no es válida. Inicia sesión nuevamente.';
  }

  if (estado === 403) {
    return 'No tienes permiso para realizar esta acción.';
  }

  if (estado === 404) {
    return 'No encontramos la información solicitada.';
  }

  if (estado === 409) {
    return 'La solicitud no pudo completarse porque existe un conflicto con la información actual.';
  }

  if (estado === 423) {
    return 'Tu cuenta no está activa o necesita verificación.';
  }

  if (estado === 429) {
    return 'Has realizado muchas solicitudes en poco tiempo. Espera un momento e intenta nuevamente.';
  }

  if (estado && estado >= 500) {
    return 'El servidor tuvo un problema temporal. Intenta nuevamente en unos minutos.';
  }

  return 'No fue posible completar la solicitud. Intenta nuevamente.';
}

function obtenerMensajeConexion(error: AxiosError) {
  if (error.code === 'ECONNABORTED') {
    return 'La solicitud tardó demasiado. Verifica que el backend esté encendido y que la IP local sea correcta.';
  }

  if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
    return 'No se pudo conectar con el backend. Revisa la IPv4 en mobile/.env, que el backend esté encendido y que el firewall permita la conexión.';
  }

  if (!error.response) {
    return 'No hubo respuesta del backend. Verifica tu conexión, la IP local y que los servicios estén corriendo.';
  }

  return null;
}

export function normalizarErrorApi(error: unknown): ErrorApi {
  if (!axios.isAxiosError(error)) {
    const posibleError = error as Partial<ErrorApi>;

    return {
      codigo: posibleError.codigo ?? 'ERROR_DESCONOCIDO',
      estadoHttp: posibleError.estadoHttp,
      mensaje:
        posibleError.mensaje ??
        'Ocurrió un error inesperado. Intenta nuevamente.',
      detalle: error
    };
  }

  const estadoHttp = error.response?.status;
  const data = error.response?.data;
  const mensajeConexion = obtenerMensajeConexion(error);
  const mensajeBackend = obtenerMensajeBackend(data);
  const codigoBackend = obtenerCodigoBackend(data);

  return {
    codigo: codigoBackend ?? error.code ?? 'ERROR_API',
    estadoHttp,
    mensaje:
      mensajeBackend ??
      mensajeConexion ??
      obtenerMensajePorEstado(estadoHttp),
    detalle: data ?? error.message
  };
}

export function obtenerMensajeErrorApi(error: unknown) {
  return normalizarErrorApi(error).mensaje;
}