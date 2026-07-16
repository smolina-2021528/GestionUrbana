import { clienteReportes } from '../../../shared/services/clienteHttp';
import type {
  CrearReportePayload,
  CrearReporteResponse
} from '../types/reportes.types';

type ArchivoReactNative = {
  uri: string;
  name: string;
  type: string;
};

function obtenerNombreArchivo(uri: string, fileName?: string | null) {
  if (fileName) {
    return fileName;
  }

  const partes = uri.split('/');
  const ultimoSegmento = partes[partes.length - 1];

  if (ultimoSegmento && ultimoSegmento.includes('.')) {
    return ultimoSegmento;
  }

  return `reporte-${Date.now()}.jpg`;
}

function obtenerTipoMime(mimeType?: string | null) {
  return mimeType || 'image/jpeg';
}

function construirArchivoImagen(payload: CrearReportePayload): ArchivoReactNative {
  return {
    uri: payload.image.uri,
    name: obtenerNombreArchivo(payload.image.uri, payload.image.fileName),
    type: obtenerTipoMime(payload.image.mimeType)
  };
}

function construirFormData(payload: CrearReportePayload) {
  const formData = new FormData();

  formData.append('title', payload.title.trim());
  formData.append('description', payload.description.trim());
  formData.append('category', payload.category);

  if (payload.address?.trim()) {
    formData.append('address', payload.address.trim());
  }

  if (payload.coordinates) {
    formData.append('latitude', String(payload.coordinates.latitude));
    formData.append('longitude', String(payload.coordinates.longitude));
  }

  const archivoImagen = construirArchivoImagen(payload);

  formData.append('images', archivoImagen as unknown as Blob);

  return formData;
}

export const reportesService = {
  async crearReporte(payload: CrearReportePayload) {
    const formData = construirFormData(payload);

    const respuesta = await clienteReportes.post<CrearReporteResponse>(
      '/reports',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );

    return respuesta.data;
  }
};