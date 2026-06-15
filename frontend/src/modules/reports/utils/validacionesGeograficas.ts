import { limitesGeograficosReportes } from '../types/reportesGeograficosTipos';
import type {
  FiltrosBoundingBoxReportes,
  FiltrosReportesCercanos
} from '../types/reportesGeograficosTipos';

function esNumeroFinito(valor: number) {
  return Number.isFinite(valor);
}

export function esLatitudReporteValida(latitud: number) {
  return (
    esNumeroFinito(latitud) &&
    latitud >= limitesGeograficosReportes.latitudMinima &&
    latitud <= limitesGeograficosReportes.latitudMaxima
  );
}

export function esLongitudReporteValida(longitud: number) {
  return (
    esNumeroFinito(longitud) &&
    longitud >= limitesGeograficosReportes.longitudMinima &&
    longitud <= limitesGeograficosReportes.longitudMaxima
  );
}

export function esRadioReportesCercanosValido(radio?: number) {
  if (radio === undefined) {
    return true;
  }

  return (
    esNumeroFinito(radio) &&
    radio >= limitesGeograficosReportes.radioMinimoMetros &&
    radio <= limitesGeograficosReportes.radioMaximoMetros
  );
}

export function esLimiteConsultaReportesValido(limite?: number) {
  if (limite === undefined) {
    return true;
  }

  return (
    Number.isInteger(limite) &&
    limite >= 1 &&
    limite <= limitesGeograficosReportes.limiteMaximoConsulta
  );
}

export function esPaginaConsultaReportesValida(pagina?: number) {
  if (pagina === undefined) {
    return true;
  }

  return Number.isInteger(pagina) && pagina >= 1;
}

export function esTextoBusquedaReporteValido(texto: string) {
  return texto.trim().length >= limitesGeograficosReportes.minimoCaracteresBusqueda;
}

export function sonFiltrosReportesCercanosValidos(filtros: FiltrosReportesCercanos) {
  return (
    esLatitudReporteValida(filtros.lat) &&
    esLongitudReporteValida(filtros.lng) &&
    esRadioReportesCercanosValido(filtros.radius) &&
    esPaginaConsultaReportesValida(filtros.page) &&
    esLimiteConsultaReportesValido(filtros.limit)
  );
}

export function sonFiltrosBoundingBoxReportesValidos(filtros: FiltrosBoundingBoxReportes) {
  return (
    esLatitudReporteValida(filtros.swLat) &&
    esLatitudReporteValida(filtros.neLat) &&
    esLongitudReporteValida(filtros.swLng) &&
    esLongitudReporteValida(filtros.neLng) &&
    filtros.swLat < filtros.neLat &&
    filtros.swLng < filtros.neLng
  );
}