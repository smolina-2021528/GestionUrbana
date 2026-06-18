import L from 'leaflet';

import marcadorRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import marcadorUrl from 'leaflet/dist/images/marker-icon.png';
import sombraMarcadorUrl from 'leaflet/dist/images/marker-shadow.png';

import type { CoordenadasGeograficas } from '../types/reportesTipos';

type IconoLeafletConUrlInterna = L.Icon.Default & {
  _getIconUrl?: () => string;
};

export const centroMapaPredeterminado: CoordenadasGeograficas = {
  latitude: 14.634915,
  longitude: -90.506882
};

export const zoomMapaPredeterminado = 12;
export const zoomMapaMinimo = 5;
export const zoomMapaMaximo = 19;
export const radioConsultaPredeterminadoMetros = 3000;
export const limiteReportesMapaInteractivo = 50;

export const atribucionOpenStreetMap =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

export const urlTilesOpenStreetMap = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

export const opcionesTilesOpenStreetMap = {
  attribution: atribucionOpenStreetMap,
  maxZoom: zoomMapaMaximo
} as const;

export const opcionesMapaInteractivo = {
  center: [centroMapaPredeterminado.latitude, centroMapaPredeterminado.longitude] as L.LatLngTuple,
  zoom: zoomMapaPredeterminado,
  minZoom: zoomMapaMinimo,
  maxZoom: zoomMapaMaximo,
  scrollWheelZoom: true
} as const;

export function configurarIconosLeaflet() {
  const iconoDefault = L.Icon.Default.prototype as IconoLeafletConUrlInterna;

  delete iconoDefault._getIconUrl;

  L.Icon.Default.mergeOptions({
    iconRetinaUrl: marcadorRetinaUrl,
    iconUrl: marcadorUrl,
    shadowUrl: sombraMarcadorUrl
  });
}

configurarIconosLeaflet();