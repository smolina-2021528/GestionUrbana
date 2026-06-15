import type { CSSProperties } from 'react';

import type { Reporte } from '../types/reportesTipos';
import './mapaReportes.css';

export type ReporteMapaVisual = Pick<
  Reporte,
  | 'id'
  | 'title'
  | 'category'
  | 'priority'
  | 'status'
  | 'address'
  | 'latitude'
  | 'longitude'
  | 'hasLocation'
  | 'createdAt'
>;

type PosicionMarcador = {
  x: number;
  y: number;
};

type PropiedadesMarcadorReporte = {
  reporte: ReporteMapaVisual;
  posicion: PosicionMarcador;
  activo?: boolean;
  indice?: number;
  alSeleccionar?: (reporte: ReporteMapaVisual) => void;
};

function obtenerClasePrioridad(prioridad: ReporteMapaVisual['priority']) {
  return prioridad.toLowerCase().replace('_', '-');
}

function formatearCoordenada(valor: number | null) {
  if (typeof valor !== 'number') {
    return null;
  }

  return new Intl.NumberFormat('es-GT', {
    maximumFractionDigits: 5
  }).format(valor);
}

function obtenerTextoUbicacion(reporte: ReporteMapaVisual) {
  if (reporte.address) {
    return reporte.address;
  }

  const latitud = formatearCoordenada(reporte.latitude);
  const longitud = formatearCoordenada(reporte.longitude);

  if (latitud && longitud) {
    return `${latitud}, ${longitud}`;
  }

  return 'Ubicación no disponible';
}

export function MarcadorReporte({
  reporte,
  posicion,
  activo = false,
  indice,
  alSeleccionar
}: PropiedadesMarcadorReporte) {
  const clasePrioridad = obtenerClasePrioridad(reporte.priority);
  const estiloPosicion = {
    '--mapa-reporte-x': `${posicion.x}%`,
    '--mapa-reporte-y': `${posicion.y}%`
  } as CSSProperties;

  return (
    <button
      type="button"
      className={[
        'marcadorReporteMapa',
        `marcadorReporteMapa--${clasePrioridad}`,
        activo ? 'marcadorReporteMapa--activo' : ''
      ]
        .filter(Boolean)
        .join(' ')}
      style={estiloPosicion}
      aria-label={`Seleccionar reporte ${reporte.title}`}
      title={`${reporte.title} · ${obtenerTextoUbicacion(reporte)}`}
      onClick={() => alSeleccionar?.(reporte)}
    >
      <span className="marcadorReporteMapa__punto" aria-hidden="true">
        {typeof indice === 'number' ? indice + 1 : ''}
      </span>
      <span className="marcadorReporteMapa__pulso" aria-hidden="true" />
    </button>
  );
}