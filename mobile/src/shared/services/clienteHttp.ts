import axios from 'axios';

import { env } from '../../config/env';
import { almacenamientoSesion } from './almacenamientoSesion';
import { normalizarErrorApi } from './manejadorErroresApi';

function crearClienteHttp(baseURL: string) {
  const cliente = axios.create({
    baseURL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json'
    }
  });

  cliente.interceptors.request.use(async (configuracion) => {
    const token = await almacenamientoSesion.obtenerToken();

    if (token) {
      configuracion.headers.Authorization = `Bearer ${token}`;
    }

    return configuracion;
  });

  cliente.interceptors.response.use(
    (respuesta) => respuesta,
    async (error) => {
      const errorNormalizado = normalizarErrorApi(error);

      if (
        errorNormalizado.codigo === 'NO_AUTENTICADO' ||
        errorNormalizado.codigo === 'CUENTA_DESACTIVADA'
      ) {
        await almacenamientoSesion.eliminarToken();
      }

      return Promise.reject(errorNormalizado);
    }
  );

  return cliente;
}

export const clienteAuth = crearClienteHttp(env.authApiUrl);
export const clienteReportes = crearClienteHttp(env.reportApiUrl);