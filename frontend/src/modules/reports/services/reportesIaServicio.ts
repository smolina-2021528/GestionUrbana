import { rutasApi } from '../../../config/rutasApi';
import { clienteReportes, obtenerDatosRespuesta } from '../../../shared/services/clienteHttp';
import type {
  AnalizarReporteConIaPayload,
  CrearReporteConIaPayload,
  FiltrosDuplicadosReporte,
  FiltrosReportesSimilares,
  RespuestaAnalisisReporte,
  RespuestaCrearReporteConIa,
  RespuestaDuplicadosReporte,
  RespuestaReprocesarIaReporte,
  RespuestaReportesSimilares,
  VerificarDuplicadosReportePayload
} from '../types/reportesIaTipos';

import type { CategoriaReporte } from '../types/reportesTipos';

type ParametrosConsultaIa = Record<string, unknown>;

function limpiarTexto(valor: string | undefined | null) {
  return String(valor ?? '').trim();
}

function limpiarParametros(parametros?: ParametrosConsultaIa) {
  if (!parametros) {
    return undefined;
  }

  const parametrosLimpios = Object.entries(parametros).reduce<ParametrosConsultaIa>(
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
  valor: string | File | CategoriaReporte | undefined | null
) {
  if (valor === undefined || valor === null) {
    return;
  }

  if (valor instanceof File) {
    formulario.append(nombre, valor);
    return;
  }

  const texto = limpiarTexto(valor);

  if (!texto) {
    return;
  }

  formulario.append(nombre, texto);
}

function construirFormularioIa(datos: AnalizarReporteConIaPayload | CrearReporteConIaPayload) {
  const formulario = new FormData();

  agregarCampoFormulario(formulario, 'image', datos.image);
  agregarCampoFormulario(formulario, 'address', datos.address);

  if ('title' in datos) {
    agregarCampoFormulario(formulario, 'title', datos.title);
    agregarCampoFormulario(formulario, 'description', datos.description);
    agregarCampoFormulario(formulario, 'category', datos.category || undefined);
  }

  return formulario;
}

function construirPayloadDuplicados(datos: VerificarDuplicadosReportePayload) {
  return {
    title: limpiarTexto(datos.title),
    description: limpiarTexto(datos.description),
    category: datos.category,
    ...(datos.latitude !== undefined &&
      datos.latitude !== null && {
        latitude: datos.latitude
      }),
    ...(datos.longitude !== undefined &&
      datos.longitude !== null && {
        longitude: datos.longitude
      })
  };
}

export const reportesIaServicio = {
  async analizarReporteConIa(
    datos: AnalizarReporteConIaPayload
  ): Promise<RespuestaAnalisisReporte> {
    return obtenerDatosRespuesta<RespuestaAnalisisReporte>(
      clienteReportes.post(rutasApi.reportes.analizarIA, construirFormularioIa(datos), {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
    );
  },

  async crearReporteConIa(
    datos: CrearReporteConIaPayload
  ): Promise<RespuestaCrearReporteConIa> {
    return obtenerDatosRespuesta<RespuestaCrearReporteConIa>(
      clienteReportes.post(rutasApi.reportes.crearConIA, construirFormularioIa(datos), {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
    );
  },

  async verificarDuplicadosReporte(
    datos: VerificarDuplicadosReportePayload,
    filtros?: FiltrosDuplicadosReporte
  ): Promise<RespuestaDuplicadosReporte> {
    return obtenerDatosRespuesta<RespuestaDuplicadosReporte>(
      clienteReportes.post(
        rutasApi.reportes.verificarDuplicados,
        construirPayloadDuplicados(datos),
        {
          params: limpiarParametros(filtros)
        }
      )
    );
  },

  async obtenerReportesSimilares(
    reporteId: string,
    filtros?: FiltrosReportesSimilares
  ): Promise<RespuestaReportesSimilares> {
    return obtenerDatosRespuesta<RespuestaReportesSimilares>(
      clienteReportes.get(rutasApi.reportes.similares(reporteId), {
        params: limpiarParametros(filtros)
      })
    );
  },

  async reprocesarIaReporte(reporteId: string): Promise<RespuestaReprocesarIaReporte> {
    return obtenerDatosRespuesta<RespuestaReprocesarIaReporte>(
      clienteReportes.post(rutasApi.reportes.reprocesarIA(reporteId))
    );
  }
};
