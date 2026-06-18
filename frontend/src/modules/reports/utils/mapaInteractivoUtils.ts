import type L from 'leaflet';

import {
  centroMapaPredeterminado,
  limiteReportesMapaInteractivo,
  radioConsultaPredeterminadoMetros
} from '../config/mapaConfig';
import type {
  BoundingBoxReportes,
  CoordenadasGeograficas,
  FiltrosBoundingBoxReportes,
  FiltrosReportesCercanos,
  PuntoHeatmapReporte,
  ReporteResumenMapa
} from '../types/reportesTipos';
import { limitesGeograficosReportes } from '../types/reportesTipos';
import {
  esLatitudReporteValida,
  esLongitudReporteValida,
  esRadioReportesCercanosValido
} from './validacionesGeograficas';

type PuntoConUbicacion = {
  latitude: number | null;
  longitude: number | null;
};

export type PuntoMapaInteractivo = ReporteResumenMapa | PuntoHeatmapReporte;

export function esCoordenadaMapaValida(coordenadas: CoordenadasGeograficas) {
  return (
    esLatitudReporteValida(coordenadas.latitude) &&
    esLongitudReporteValida(coordenadas.longitude)
  );
}

export function tieneUbicacionMapa<TPunto extends PuntoConUbicacion>(
  punto: TPunto
): punto is TPunto & CoordenadasGeograficas {
  return (
    typeof punto.latitude === 'number' &&
    typeof punto.longitude === 'number' &&
    esCoordenadaMapaValida({
      latitude: punto.latitude,
      longitude: punto.longitude
    })
  );
}

export function crearLatLngDesdeCoordenadas(coordenadas: CoordenadasGeograficas): L.LatLngTuple {
  return [coordenadas.latitude, coordenadas.longitude];
}

export function obtenerCentroMapa(reportes: PuntoMapaInteractivo[] = []) {
  const primerPuntoConUbicacion = reportes.find(tieneUbicacionMapa);

  if (!primerPuntoConUbicacion) {
    return centroMapaPredeterminado;
  }

  return {
    latitude: primerPuntoConUbicacion.latitude,
    longitude: primerPuntoConUbicacion.longitude
  };
}

export function normalizarRadioMapa(radio?: number) {
  if (esRadioReportesCercanosValido(radio)) {
    return radio ?? radioConsultaPredeterminadoMetros;
  }

  return radioConsultaPredeterminadoMetros;
}

export function crearFiltrosReportesCercanos(
  centro: CoordenadasGeograficas,
  opciones?: {
    radio?: number;
    status?: FiltrosReportesCercanos['status'];
    category?: FiltrosReportesCercanos['category'];
  }
): FiltrosReportesCercanos {
  return {
    lat: centro.latitude,
    lng: centro.longitude,
    radius: normalizarRadioMapa(opciones?.radio),
    limit: limiteReportesMapaInteractivo,
    page: 1,
    status: opciones?.status,
    category: opciones?.category
  };
}

export function convertirBoundsAFiltrosBoundingBox(
  bounds: L.LatLngBounds,
  opciones?: {
    status?: FiltrosBoundingBoxReportes['status'];
    category?: FiltrosBoundingBoxReportes['category'];
  }
): FiltrosBoundingBoxReportes {
  const suroeste = bounds.getSouthWest();
  const noreste = bounds.getNorthEast();

  return {
    swLat: suroeste.lat,
    swLng: suroeste.lng,
    neLat: noreste.lat,
    neLng: noreste.lng,
    status: opciones?.status,
    category: opciones?.category
  };
}

export function convertirBoundsABoundingBox(bounds: L.LatLngBounds): BoundingBoxReportes {
  const suroeste = bounds.getSouthWest();
  const noreste = bounds.getNorthEast();

  return {
    sw: {
      latitude: suroeste.lat,
      longitude: suroeste.lng
    },
    ne: {
      latitude: noreste.lat,
      longitude: noreste.lng
    }
  };
}

export function limitarCoordenadaMapa(coordenadas: CoordenadasGeograficas) {
  const latitude = Math.min(
    Math.max(coordenadas.latitude, limitesGeograficosReportes.latitudMinima),
    limitesGeograficosReportes.latitudMaxima
  );
  const longitude = Math.min(
    Math.max(coordenadas.longitude, limitesGeograficosReportes.longitudMinima),
    limitesGeograficosReportes.longitudMaxima
  );

  return {
    latitude,
    longitude
  };
}

export function formatearCoordenadaMapa(valor: number | null | undefined) {
  if (typeof valor !== 'number' || !Number.isFinite(valor)) {
    return 'Sin coordenada';
  }

  return new Intl.NumberFormat('es-GT', {
    maximumFractionDigits: 6,
    minimumFractionDigits: 3
  }).format(valor);
}

export function formatearRadioMapa(radioMetros?: number) {
  const radioNormalizado = normalizarRadioMapa(radioMetros);

  if (radioNormalizado >= 1000) {
    return `${new Intl.NumberFormat('es-GT', {
      maximumFractionDigits: 1
    }).format(radioNormalizado / 1000)} km`;
  }

  return `${new Intl.NumberFormat('es-GT').format(radioNormalizado)} m`;
}