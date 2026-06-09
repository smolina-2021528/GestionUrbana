import axios from 'axios';
import type { AxiosInstance } from 'axios';

import { rutasApi } from '../../config/rutasApi';
import { almacenamientoToken } from './almacenamientoToken';
import { normalizarErrorApi } from './manejadorErroresApi';

type CrearClienteHttpOpciones = {
  baseURL: string;
};

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
    (error) => Promise.reject(normalizarErrorApi(error))
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