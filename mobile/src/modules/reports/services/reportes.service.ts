import { clienteReportes } from '../../../shared/services/clienteHttp';
import type {
  ContenedorReportes,
  CrearReportePayload,
  CrearReporteResponse,
  MisReportesNormalizados,
  MisReportesResponse,
  ReporteDetalleNormalizado,
  ReporteDetalleResponse,
  ReporteResumen
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

function esContenedorReportes(valor: unknown): valor is ContenedorReportes {
  return Boolean(valor && typeof valor === 'object');
}

function extraerReportes(respuesta: MisReportesResponse): ReporteResumen[] {
  if (Array.isArray(respuesta.data)) {
    return respuesta.data;
  }

  if (Array.isArray(respuesta.reports)) {
    return respuesta.reports;
  }

  if (esContenedorReportes(respuesta.data)) {
    if (Array.isArray(respuesta.data.reports)) {
      return respuesta.data.reports;
    }

    if (Array.isArray(respuesta.data.items)) {
      return respuesta.data.items;
    }

    if (Array.isArray(respuesta.data.rows)) {
      return respuesta.data.rows;
    }

    if (Array.isArray(respuesta.data.data)) {
      return respuesta.data.data;
    }
  }

  return [];
}

function extraerReporteDetalle(respuesta: ReporteDetalleResponse) {
  if (respuesta.data) {
    return respuesta.data;
  }

  if (respuesta.report) {
    return respuesta.report;
  }

  return null;
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
  },

  async obtenerMisReportes(): Promise<MisReportesNormalizados> {
    const respuesta = await clienteReportes.get<MisReportesResponse>('/reports/my-reports');
    const reportes = extraerReportes(respuesta.data);

    return {
      success: respuesta.data.success,
      message: respuesta.data.message,
      reportes
    };
  },

  async obtenerReporteDetalle(reporteId: string): Promise<ReporteDetalleNormalizado> {
    const respuesta = await clienteReportes.get<ReporteDetalleResponse>(
      `/reports/${encodeURIComponent(reporteId)}`
    );

    return {
      success: respuesta.data.success,
      message: respuesta.data.message,
      reporte: extraerReporteDetalle(respuesta.data)
    };
  }
};