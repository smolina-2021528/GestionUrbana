import { rutasApi } from '../../../config/rutasApi';
import { clienteReportes, obtenerDatosRespuesta } from '../../../shared/services/clienteHttp';
import type {
  CeldaHeatmapGridEstadisticas,
  EstadisticasDashboard,
  FiltrosDashboardAplicados,
  FiltrosDashboardEstadisticas,
  FiltrosExportacionEstadisticas,
  FiltrosHeatmapGridAplicados,
  FiltrosHeatmapGridEstadisticas,
  FiltrosRangoFechaEstadisticas,
  FiltrosTendenciasAplicados,
  FiltrosTendenciasEstadisticas,
  FiltrosTransicionesAplicados,
  FiltrosZonasAplicados,
  FiltrosZonasEstadisticas,
  RankingZonasEstadisticas,
  RespuestaApiEstadisticas,
  RespuestaDashboardEstadisticas,
  RespuestaHeatmapGridEstadisticas,
  RespuestaTendenciasEstadisticas,
  RespuestaTransicionesEstadisticas,
  RespuestaZonasEstadisticas,
  TendenciasDashboard,
  TransicionEstadoEstadisticas
} from '../types/estadisticasTipos';

type RegistroDesconocido = Record<string, unknown>;

function esObjeto(valor: unknown): valor is RegistroDesconocido {
  return typeof valor === 'object' && valor !== null && !Array.isArray(valor);
}

function obtenerMensajeRespuestaFallida(respuesta: RegistroDesconocido) {
  return typeof respuesta.message === 'string'
    ? respuesta.message
    : 'No fue posible obtener la información solicitada.';
}

function limpiarParametros(parametros?: object) {
  if (!parametros) {
    return undefined;
  }

  const parametrosLimpios = Object.entries(parametros).reduce<RegistroDesconocido>(
    (acumulador, [llave, valor]) => {
      if (valor === undefined || valor === null || valor === '') {
        return acumulador;
      }

      acumulador[llave] = valor;
      return acumulador;
    },
    {}
  );

  return Object.keys(parametrosLimpios).length > 0 ? parametrosLimpios : undefined;
}

function extraerDatosRespuesta<TDatos>(respuesta: RegistroDesconocido) {
  if ('data' in respuesta) {
    return respuesta.data as TDatos;
  }

  if ('stats' in respuesta) {
    return respuesta.stats as TDatos;
  }

  return respuesta as TDatos;
}

function normalizarRespuestaEstadisticas<TDatos, TFiltros = RegistroDesconocido>(
  respuesta: unknown
): RespuestaApiEstadisticas<TDatos, TFiltros> {
  if (!esObjeto(respuesta)) {
    return {
      success: true,
      data: respuesta as TDatos
    };
  }

  if (respuesta.success === false) {
    return {
      success: false,
      message: obtenerMensajeRespuestaFallida(respuesta)
    };
  }

  const respuestaNormalizada: RespuestaApiEstadisticas<TDatos, TFiltros> = {
    success: true,
    data: extraerDatosRespuesta<TDatos>(respuesta)
  };

  if ('filters' in respuesta) {
    respuestaNormalizada.filters = respuesta.filters as TFiltros;
  }

  if (typeof respuesta.message === 'string') {
    respuestaNormalizada.message = respuesta.message;
  }

  return respuestaNormalizada;
}

function normalizarRespuestaConTotal<TDatos, TFiltros = RegistroDesconocido>(
  respuesta: unknown
): RespuestaApiEstadisticas<TDatos, TFiltros> & { total?: number } {
  const respuestaNormalizada = normalizarRespuestaEstadisticas<TDatos, TFiltros>(respuesta);

  if (respuestaNormalizada.success && esObjeto(respuesta) && typeof respuesta.total === 'number') {
    return {
      ...respuestaNormalizada,
      total: respuesta.total
    };
  }

  return respuestaNormalizada;
}

async function obtenerRespuestaEstadisticas<TDatos, TFiltros = RegistroDesconocido>(
  ruta: string,
  parametros?: object
): Promise<RespuestaApiEstadisticas<TDatos, TFiltros>> {
  const respuesta = await obtenerDatosRespuesta<unknown>(
    clienteReportes.get(ruta, {
      params: limpiarParametros(parametros)
    })
  );

  return normalizarRespuestaEstadisticas<TDatos, TFiltros>(respuesta);
}

export const estadisticasServicio = {
  async obtenerEstadisticasDashboard(
    filtros?: FiltrosDashboardEstadisticas
  ): Promise<RespuestaDashboardEstadisticas> {
    return obtenerRespuestaEstadisticas<EstadisticasDashboard, FiltrosDashboardAplicados>(
      rutasApi.reportes.estadisticas.dashboard,
      filtros
    );
  },

  async obtenerTendenciasDashboard(
    filtros?: FiltrosTendenciasEstadisticas
  ): Promise<RespuestaTendenciasEstadisticas> {
    return obtenerRespuestaEstadisticas<TendenciasDashboard, FiltrosTendenciasAplicados>(
      rutasApi.reportes.estadisticas.tendencias,
      filtros
    );
  },

  async obtenerZonasDashboard(
    filtros?: FiltrosZonasEstadisticas
  ): Promise<RespuestaZonasEstadisticas> {
    return obtenerRespuestaEstadisticas<RankingZonasEstadisticas, FiltrosZonasAplicados>(
      rutasApi.reportes.estadisticas.zonas,
      filtros
    );
  },

  async obtenerTransicionesDashboard(
    filtros?: FiltrosRangoFechaEstadisticas
  ): Promise<RespuestaTransicionesEstadisticas> {
    return obtenerRespuestaEstadisticas<
      TransicionEstadoEstadisticas[],
      FiltrosTransicionesAplicados
    >(rutasApi.reportes.estadisticas.transiciones, filtros);
  },

  async obtenerHeatmapGrid(
    filtros?: FiltrosHeatmapGridEstadisticas
  ): Promise<RespuestaHeatmapGridEstadisticas> {
    const respuesta = await obtenerDatosRespuesta<unknown>(
      clienteReportes.get(rutasApi.reportes.estadisticas.heatmapGrid, {
        params: limpiarParametros(filtros)
      })
    );

    return normalizarRespuestaConTotal<
      CeldaHeatmapGridEstadisticas[],
      FiltrosHeatmapGridAplicados
    >(respuesta);
  },

  async exportarEstadisticas(filtros?: FiltrosExportacionEstadisticas): Promise<Blob> {
    const respuesta = await clienteReportes.get<Blob>(rutasApi.reportes.estadisticas.exportar, {
      params: limpiarParametros(filtros),
      responseType: 'blob'
    });

    return respuesta.data;
  }
};