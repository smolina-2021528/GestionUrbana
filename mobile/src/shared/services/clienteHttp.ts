import axios, {
  AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig
} from 'axios';

import { env } from '../../config/env';
import { almacenamientoSesion } from './almacenamientoSesion';
import { normalizarErrorApi } from './manejadorErroresApi';

function asignarHeaderAutorizacion(
  config: InternalAxiosRequestConfig,
  token: string
) {
  if (!config.headers) {
    return;
  }

  const headers = config.headers as unknown as {
    set?: (key: string, value: string) => void;
    Authorization?: string;
  };

  if (typeof headers.set === 'function') {
    headers.set('Authorization', `Bearer ${token}`);
    return;
  }

  headers.Authorization = `Bearer ${token}`;
}

function crearCliente(baseURL: string, nombreServicio: string) {
  const cliente = axios.create({
    baseURL,
    timeout: env.timeoutMs
  });

  cliente.interceptors.request.use(async (config) => {
    const token = await almacenamientoSesion.obtenerToken();

    if (token) {
      asignarHeaderAutorizacion(config, token);
    }

    if (env.esDesarrollo) {
      console.log(
        `[API:${nombreServicio}] ${config.method?.toUpperCase() ?? 'GET'} ${baseURL}${config.url ?? ''}`
      );
    }

    return config;
  });

  cliente.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const errorNormalizado = normalizarErrorApi(error);

      if (env.esDesarrollo) {
        console.log(`[API:${nombreServicio}] Error`, {
          codigo: errorNormalizado.codigo,
          estadoHttp: errorNormalizado.estadoHttp,
          mensaje: errorNormalizado.mensaje
        });
      }

      if (
        errorNormalizado.estadoHttp === 401 ||
        errorNormalizado.estadoHttp === 423
      ) {
        await almacenamientoSesion.eliminarToken();
      }

      return Promise.reject(errorNormalizado);
    }
  );

  return cliente;
}

export const clienteAuth: AxiosInstance = crearCliente(
  env.authApiUrl,
  'AUTH'
);

export const clienteReportes: AxiosInstance = crearCliente(
  env.reportApiUrl,
  'REPORT'
);