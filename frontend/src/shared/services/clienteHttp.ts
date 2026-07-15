import axios from 'axios';
import type { AxiosInstance } from 'axios';

import { rutasApi } from '../../config/rutasApi';
import { almacenamientoToken } from './almacenamientoToken';
import { normalizarErrorApi } from './manejadorErroresApi';
import type { ErrorApi } from '../types/errorApi';

export const eventoSesionInvalida = 'ciudadActiva:sesionInvalida';

export type DetalleSesionInvalida = {
  codigo: ErrorApi['codigo'];
  mensaje: string;
  estadoHttp?: number;
};

type CrearClienteHttpOpciones = {
  baseURL: string;
};

function notificarSesionInvalida(errorNormalizado: ErrorApi) {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(
    new CustomEvent<DetalleSesionInvalida>(eventoSesionInvalida, {
      detail: {
        codigo: errorNormalizado.codigo,
        mensaje: errorNormalizado.mensaje,
        estadoHttp: errorNormalizado.estadoHttp
      }
    })
  );
}

function requiereCerrarSesionLocal(errorNormalizado: ErrorApi) {
  return (
    errorNormalizado.codigo === 'NO_AUTENTICADO' ||
    errorNormalizado.codigo === 'CUENTA_DESACTIVADA'
  );
}

function crearClienteHttp({ baseURL }: CrearClienteHttpOpciones): AxiosInstance {
  const cliente = axios.create({
    baseURL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json'
    }
  });

  cliente.interceptors.request.use((configuracion) => {
    const token = almacenamientoToken.obtenerToken();

    if (token) {
      configuracion.headers.Authorization = `Bearer ${token}`;
    }

    return configuracion;
  });

  cliente.interceptors.response.use(
    (respuesta) => respuesta,
    (error) => {
      const errorNormalizado = normalizarErrorApi(error);
      const tokenActual = almacenamientoToken.obtenerToken();

      if (tokenActual && requiereCerrarSesionLocal(errorNormalizado)) {
        almacenamientoToken.eliminarToken();
        notificarSesionInvalida(errorNormalizado);
      }

      return Promise.reject(errorNormalizado);
    }
  );

  return cliente;
}

export const clienteAuth = crearClienteHttp({
  baseURL: rutasApi.autenticacion.baseUrl
});

export const clienteReportes = crearClienteHttp({
  baseURL: rutasApi.reportes.baseUrl
});

export async function obtenerDatosRespuesta<TDatos>(peticion: Promise<{ data: TDatos }>) {
  const respuesta = await peticion;
  return respuesta.data;
}