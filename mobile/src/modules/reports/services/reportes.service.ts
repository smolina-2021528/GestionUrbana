import { clienteReportes } from '../../../shared/services/clienteHttp';
import {
  normalizarImagenesReporte
} from '../utils/imagenesReporte';
import type {
  AnalizarReporteConIaPayload,
  ContenedorReportes,
  CrearReportePayload,
  CrearReporteResponse,
  MisReportesNormalizados,
  MisReportesResponse,
  ReporteDetalleNormalizado,
  ReporteDetalleResponse,
  ReporteResumen,
  RespuestaAnalisisReporte
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

  return 'reporte-' + Date.now() + '.jpg';
}

function obtenerTipoMime(mimeType?: string | null) {
  return mimeType || 'image/jpeg';
}

function limpiarTexto(valor: string | undefined) {
  return valor?.trim() ?? '';
}

function construirArchivoImagen(payload: CrearReportePayload | AnalizarReporteConIaPayload): ArchivoReactNative {
  return {
    uri: payload.image.uri,
    name: obtenerNombreArchivo(payload.image.uri, payload.image.fileName),
    type: obtenerTipoMime(payload.image.mimeType)
  };
}

function agregarCampoTexto(formData: FormData, nombre: string, valor: string | undefined) {
  const texto = limpiarTexto(valor);

  if (texto) {
    formData.append(nombre, texto);
  }
}

function construirFormData(payload: CrearReportePayload) {
  const formData = new FormData();

  agregarCampoTexto(formData, 'title', payload.title);
  agregarCampoTexto(formData, 'description', payload.description);
  formData.append('category', payload.category);
  agregarCampoTexto(formData, 'address', payload.address);

  if (payload.coordinates) {
    formData.append('latitude', String(payload.coordinates.latitude));
    formData.append('longitude', String(payload.coordinates.longitude));
  }

  const archivoImagen = construirArchivoImagen(payload);

  formData.append('images', archivoImagen as unknown as Blob);

  return formData;
}

function construirFormDataAnalisis(payload: AnalizarReporteConIaPayload) {
  const formData = new FormData();

  agregarCampoTexto(formData, 'title', payload.title);
  agregarCampoTexto(formData, 'description', payload.description);
  formData.append('category', payload.category);
  agregarCampoTexto(formData, 'address', payload.address);

  const archivoImagen = construirArchivoImagen(payload);

  formData.append('image', archivoImagen as unknown as Blob);

  return formData;
}

function esContenedorReportes(valor: unknown): valor is ContenedorReportes {
  return Boolean(valor && typeof valor === 'object');
}

function normalizarReporte(reporte: ReporteResumen): ReporteResumen {
  return {
    ...reporte,
    images: normalizarImagenesReporte(reporte.images)
  };
}

function extraerReportes(respuesta: MisReportesResponse): ReporteResumen[] {
  if (Array.isArray(respuesta.data)) {
    return respuesta.data.map(normalizarReporte);
  }

  if (Array.isArray(respuesta.reports)) {
    return respuesta.reports.map(normalizarReporte);
  }

  if (esContenedorReportes(respuesta.data)) {
    if (Array.isArray(respuesta.data.reports)) {
      return respuesta.data.reports.map(normalizarReporte);
    }

    if (Array.isArray(respuesta.data.items)) {
      return respuesta.data.items.map(normalizarReporte);
    }

    if (Array.isArray(respuesta.data.rows)) {
      return respuesta.data.rows.map(normalizarReporte);
    }

    if (Array.isArray(respuesta.data.data)) {
      return respuesta.data.data.map(normalizarReporte);
    }
  }

  return [];
}

function extraerReporteDetalle(respuesta: ReporteDetalleResponse) {
  if (respuesta.data) {
    return normalizarReporte(respuesta.data);
  }

  if (respuesta.report) {
    return normalizarReporte(respuesta.report);
  }

  return null;
}

export const reportesService = {
  async analizarReporteConIa(payload: AnalizarReporteConIaPayload) {
    const formData = construirFormDataAnalisis(payload);

    const respuesta = await clienteReportes.post<RespuestaAnalisisReporte>(
      '/reports/analyze',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );

    return respuesta.data;
  },

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
      '/reports/' + encodeURIComponent(reporteId)
    );

    return {
      success: respuesta.data.success,
      message: respuesta.data.message,
      reporte: extraerReporteDetalle(respuesta.data)
    };
  }
};
