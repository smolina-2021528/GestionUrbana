import { rutasApi } from '../../../config/rutasApi';
import { clienteReportes, obtenerDatosRespuesta } from '../../../shared/services/clienteHttp';
import type {
  ActualizarReportePayload,
  ActualizarUbicacionReportePayload,
  AsignarReportePayload,
  CambiarEstadoReportePayload,
  CrearReportePayload,
  FiltrosBoundingBoxReportes,
  FiltrosBusquedaReportes,
  FiltrosHeatmapReportes,
  FiltrosListadoReportes,
  FiltrosMisReportes,
  FiltrosReportesCercanos,
  RespuestaActualizarReporte,
  RespuestaActualizarUbicacionReporte,
  RespuestaAsignarReporte,
  RespuestaBoundingBoxReportes,
  RespuestaCambiarEstadoReporte,
  RespuestaCrearReporte,
  RespuestaDetalleReporte,
  RespuestaEliminarImagenReporte,
  RespuestaEliminarReporte,
  RespuestaHeatmapReportes,
  RespuestaHistorialReporte,
  RespuestaListadoReportes,
  RespuestaReportesCercanos
} from '../types/reportesTipos';

type ParametrosConsulta = Record<string, unknown>;

function limpiarTexto(valor: string) {
  return valor.trim();
}

function limpiarParametros(parametros?: ParametrosConsulta) {
  if (!parametros) {
    return undefined;
  }

  const parametrosLimpios = Object.entries(parametros).reduce<ParametrosConsulta>(
    (acumulador, [llave, valor]) => {
      if (valor === undefined || valor === null) {
        return acumulador;
      }

      if (typeof valor === 'string') {
        const textoLimpio = limpiarTexto(valor);

        if (textoLimpio.length === 0) {
          return acumulador;
        }

        acumulador[llave] = textoLimpio;
        return acumulador;
      }

      acumulador[llave] = valor;
      return acumulador;
    },
    {}
  );

  return Object.keys(parametrosLimpios).length > 0 ? parametrosLimpios : undefined;
}

function agregarCampoFormulario(
  formulario: FormData,
  nombre: string,
  valor: string | number | undefined
) {
  if (valor === undefined || valor === null || valor === '') {
    return;
  }

  formulario.append(nombre, typeof valor === 'number' ? String(valor) : limpiarTexto(valor));
}

function tieneImagenes(datos: { images?: File[] }) {
  return Array.isArray(datos.images) && datos.images.length > 0;
}

function construirFormularioReporte(datos: CrearReportePayload | ActualizarReportePayload) {
  const formulario = new FormData();

  agregarCampoFormulario(formulario, 'title', datos.title);
  agregarCampoFormulario(formulario, 'description', datos.description);
  agregarCampoFormulario(formulario, 'category', datos.category);
  agregarCampoFormulario(formulario, 'latitude', datos.latitude);
  agregarCampoFormulario(formulario, 'longitude', datos.longitude);
  agregarCampoFormulario(formulario, 'address', datos.address);

  datos.images?.forEach((imagen) => {
    formulario.append('images', imagen);
  });

  return formulario;
}

function construirPayloadReporte(datos: CrearReportePayload | ActualizarReportePayload) {
  return {
    ...(datos.title !== undefined && { title: limpiarTexto(datos.title) }),
    ...(datos.description !== undefined && { description: limpiarTexto(datos.description) }),
    ...(datos.category !== undefined && { category: datos.category }),
    ...(datos.latitude !== undefined && { latitude: datos.latitude }),
    ...(datos.longitude !== undefined && { longitude: datos.longitude }),
    ...(datos.address !== undefined && { address: limpiarTexto(datos.address) })
  };
}

function construirPayloadUbicacion(datos: ActualizarUbicacionReportePayload) {
  return {
    latitude: datos.latitude,
    longitude: datos.longitude,
    ...(datos.address !== undefined && { address: limpiarTexto(datos.address) })
  };
}

export const reportesServicio = {
  async obtenerReportes(filtros?: FiltrosListadoReportes): Promise<RespuestaListadoReportes> {
    return obtenerDatosRespuesta<RespuestaListadoReportes>(
      clienteReportes.get(rutasApi.reportes.listar, {
        params: limpiarParametros(filtros)
      })
    );
  },

  async obtenerMisReportes(filtros?: FiltrosMisReportes): Promise<RespuestaListadoReportes> {
    return obtenerDatosRespuesta<RespuestaListadoReportes>(
      clienteReportes.get(rutasApi.reportes.misReportes, {
        params: limpiarParametros(filtros)
      })
    );
  },

  async buscarReportes(filtros: FiltrosBusquedaReportes): Promise<RespuestaListadoReportes> {
    return obtenerDatosRespuesta<RespuestaListadoReportes>(
      clienteReportes.get(rutasApi.reportes.buscar, {
        params: limpiarParametros(filtros)
      })
    );
  },

  async obtenerReportesCercanos(
    filtros: FiltrosReportesCercanos
  ): Promise<RespuestaReportesCercanos> {
    return obtenerDatosRespuesta<RespuestaReportesCercanos>(
      clienteReportes.get(rutasApi.reportes.cercanos, {
        params: limpiarParametros(filtros)
      })
    );
  },

  async obtenerHeatmapReportes(
    filtros?: FiltrosHeatmapReportes
  ): Promise<RespuestaHeatmapReportes> {
    return obtenerDatosRespuesta<RespuestaHeatmapReportes>(
      clienteReportes.get(rutasApi.reportes.heatmap, {
        params: limpiarParametros(filtros)
      })
    );
  },

  async obtenerReportesBoundingBox(
    filtros: FiltrosBoundingBoxReportes
  ): Promise<RespuestaBoundingBoxReportes> {
    return obtenerDatosRespuesta<RespuestaBoundingBoxReportes>(
      clienteReportes.get(rutasApi.reportes.bbox, {
        params: limpiarParametros(filtros)
      })
    );
  },

  async obtenerReportePorId(reporteId: string): Promise<RespuestaDetalleReporte> {
    return obtenerDatosRespuesta<RespuestaDetalleReporte>(
      clienteReportes.get(rutasApi.reportes.detalle(reporteId))
    );
  },

  async crearReporte(datos: CrearReportePayload): Promise<RespuestaCrearReporte> {
    if (tieneImagenes(datos)) {
      return obtenerDatosRespuesta<RespuestaCrearReporte>(
        clienteReportes.post(rutasApi.reportes.crear, construirFormularioReporte(datos), {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
      );
    }

    return obtenerDatosRespuesta<RespuestaCrearReporte>(
      clienteReportes.post(rutasApi.reportes.crear, construirPayloadReporte(datos))
    );
  },

  async actualizarReporte(
    reporteId: string,
    datos: ActualizarReportePayload
  ): Promise<RespuestaActualizarReporte> {
    if (tieneImagenes(datos)) {
      return obtenerDatosRespuesta<RespuestaActualizarReporte>(
        clienteReportes.put(
          rutasApi.reportes.actualizar(reporteId),
          construirFormularioReporte(datos),
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        )
      );
    }

    return obtenerDatosRespuesta<RespuestaActualizarReporte>(
      clienteReportes.put(rutasApi.reportes.actualizar(reporteId), construirPayloadReporte(datos))
    );
  },

  async eliminarReporte(reporteId: string): Promise<RespuestaEliminarReporte> {
    return obtenerDatosRespuesta<RespuestaEliminarReporte>(
      clienteReportes.delete(rutasApi.reportes.eliminar(reporteId))
    );
  },

  async cambiarEstadoReporte(
    reporteId: string,
    datos: CambiarEstadoReportePayload
  ): Promise<RespuestaCambiarEstadoReporte> {
    return obtenerDatosRespuesta<RespuestaCambiarEstadoReporte>(
      clienteReportes.patch(rutasApi.reportes.cambiarEstado(reporteId), {
        status: datos.status,
        ...(datos.notes !== undefined && { notes: limpiarTexto(datos.notes) })
      })
    );
  },

  async asignarReporte(
    reporteId: string,
    datos: AsignarReportePayload
  ): Promise<RespuestaAsignarReporte> {
    return obtenerDatosRespuesta<RespuestaAsignarReporte>(
      clienteReportes.patch(rutasApi.reportes.asignar(reporteId), {
        assignedTo: limpiarTexto(datos.assignedTo)
      })
    );
  },

  async actualizarUbicacionReporte(
    reporteId: string,
    datos: ActualizarUbicacionReportePayload
  ): Promise<RespuestaActualizarUbicacionReporte> {
    return obtenerDatosRespuesta<RespuestaActualizarUbicacionReporte>(
      clienteReportes.patch(
        rutasApi.reportes.actualizarUbicacion(reporteId),
        construirPayloadUbicacion(datos)
      )
    );
  },

  async eliminarUbicacionReporte(reporteId: string): Promise<RespuestaActualizarUbicacionReporte> {
    return obtenerDatosRespuesta<RespuestaActualizarUbicacionReporte>(
      clienteReportes.delete(rutasApi.reportes.eliminarUbicacion(reporteId))
    );
  },

  async eliminarImagenReporte(
    reporteId: string,
    imagenId: string
  ): Promise<RespuestaEliminarImagenReporte> {
    return obtenerDatosRespuesta<RespuestaEliminarImagenReporte>(
      clienteReportes.delete(rutasApi.reportes.eliminarImagen(reporteId, imagenId))
    );
  },

  async obtenerHistorialReporte(reporteId: string): Promise<RespuestaHistorialReporte> {
    return obtenerDatosRespuesta<RespuestaHistorialReporte>(
      clienteReportes.get(rutasApi.reportes.historial(reporteId))
    );
  },

  async reprocesarIAReporte(reporteId: string): Promise<RespuestaActualizarReporte> {
    return obtenerDatosRespuesta<RespuestaActualizarReporte>(
      clienteReportes.post(rutasApi.reportes.reprocesarIA(reporteId))
    );
  }
};