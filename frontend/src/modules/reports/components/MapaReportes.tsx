import type { CSSProperties, ReactNode } from 'react';

import { EstadoVacio } from '../../../shared/components/data/EstadoVacio';
import type { CoordenadasGeograficas, PuntoHeatmapReporte } from '../types/reportesTipos';
import { MarcadorReporte, type ReporteMapaVisual } from './MarcadorReporte';
import './mapaReportes.css';

type PuntoUbicable = {
  latitude: number | null;
  longitude: number | null;
};

type PuntoConUbicacion = {
  latitude: number;
  longitude: number;
};

type PosicionMapa = {
  x: number;
  y: number;
};

type LimitesMapa = {
  latitudMinima: number;
  latitudMaxima: number;
  longitudMinima: number;
  longitudMaxima: number;
};

type PropiedadesMapaReportes = {
  reportes: ReporteMapaVisual[];
  puntosHeatmap?: PuntoHeatmapReporte[];
  reporteSeleccionadoId?: string;
  centro?: CoordenadasGeograficas;
  radioMetros?: number;
  mostrarHeatmap?: boolean;
  acciones?: ReactNode;
  tituloVacio?: string;
  descripcionVacia?: string;
  alSeleccionarReporte?: (reporte: ReporteMapaVisual) => void;
};

function esPuntoConUbicacion<TPunto extends PuntoUbicable>(
  punto: TPunto
): punto is TPunto & PuntoConUbicacion {
  return (
    typeof punto.latitude === 'number' &&
    typeof punto.longitude === 'number' &&
    Number.isFinite(punto.latitude) &&
    Number.isFinite(punto.longitude)
  );
}

function limitarPorcentaje(valor: number) {
  return Math.min(Math.max(valor, 6), 94);
}

function obtenerLimitesMapa(puntos: PuntoUbicable[], centro?: CoordenadasGeograficas): LimitesMapa {
  const puntosValidos = puntos.filter(esPuntoConUbicacion);

  if (centro) {
    puntosValidos.push({
      latitude: centro.latitude,
      longitude: centro.longitude
    });
  }

  if (puntosValidos.length === 0) {
    return {
      latitudMinima: 14.45,
      latitudMaxima: 14.75,
      longitudMinima: -90.65,
      longitudMaxima: -90.35
    };
  }

  const latitudes = puntosValidos.map((punto) => punto.latitude);
  const longitudes = puntosValidos.map((punto) => punto.longitude);

  const latitudMinima = Math.min(...latitudes);
  const latitudMaxima = Math.max(...latitudes);
  const longitudMinima = Math.min(...longitudes);
  const longitudMaxima = Math.max(...longitudes);

  const margenLatitud = Math.max((latitudMaxima - latitudMinima) * 0.18, 0.01);
  const margenLongitud = Math.max((longitudMaxima - longitudMinima) * 0.18, 0.01);

  return {
    latitudMinima: latitudMinima - margenLatitud,
    latitudMaxima: latitudMaxima + margenLatitud,
    longitudMinima: longitudMinima - margenLongitud,
    longitudMaxima: longitudMaxima + margenLongitud
  };
}

function calcularPosicionMapa(punto: PuntoUbicable, limites: LimitesMapa): PosicionMapa {
  if (!esPuntoConUbicacion(punto)) {
    return {
      x: 50,
      y: 50
    };
  }

  const rangoLatitud = limites.latitudMaxima - limites.latitudMinima;
  const rangoLongitud = limites.longitudMaxima - limites.longitudMinima;

  const posicionX =
    rangoLongitud === 0
      ? 50
      : ((punto.longitude - limites.longitudMinima) / rangoLongitud) * 100;

  const posicionY =
    rangoLatitud === 0
      ? 50
      : 100 - ((punto.latitude - limites.latitudMinima) / rangoLatitud) * 100;

  return {
    x: limitarPorcentaje(posicionX),
    y: limitarPorcentaje(posicionY)
  };
}

function obtenerPuntosBase(
  reportes: ReporteMapaVisual[],
  puntosHeatmap: PuntoHeatmapReporte[] | undefined,
  mostrarHeatmap: boolean
) {
  const puntosReportes = reportes.map((reporte) => ({
    latitude: reporte.latitude,
    longitude: reporte.longitude
  }));

  const puntosIntensidad =
    mostrarHeatmap && puntosHeatmap
      ? puntosHeatmap.map((punto) => ({
          latitude: punto.latitude,
          longitude: punto.longitude
        }))
      : [];

  return [...puntosReportes, ...puntosIntensidad];
}

function obtenerClasePrioridad(prioridad: PuntoHeatmapReporte['priority']) {
  return prioridad.toLowerCase().replace('_', '-');
}

function obtenerPesoHeatmap(peso: number) {
  if (!Number.isFinite(peso)) {
    return 1;
  }

  return Math.min(Math.max(peso, 1), 5);
}

function formatearRadio(radioMetros?: number) {
  if (!radioMetros) {
    return null;
  }

  if (radioMetros >= 1000) {
    return `${new Intl.NumberFormat('es-GT', {
      maximumFractionDigits: 1
    }).format(radioMetros / 1000)} km`;
  }

  return `${new Intl.NumberFormat('es-GT').format(radioMetros)} m`;
}

export function MapaReportes({
  reportes,
  puntosHeatmap = [],
  reporteSeleccionadoId,
  centro,
  radioMetros,
  mostrarHeatmap = false,
  acciones,
  tituloVacio = 'Sin reportes con ubicación',
  descripcionVacia = 'Ajusta los filtros o registra coordenadas para visualizar incidencias en el mapa.',
  alSeleccionarReporte
}: PropiedadesMapaReportes) {
  const reportesConUbicacion = reportes.filter(esPuntoConUbicacion);
  const puntosHeatmapConUbicacion = puntosHeatmap.filter(esPuntoConUbicacion);
  const puntosBase = obtenerPuntosBase(
    reportesConUbicacion,
    puntosHeatmapConUbicacion,
    mostrarHeatmap
  );
  const limitesMapa = obtenerLimitesMapa(puntosBase, centro);
  const radioVisible = formatearRadio(radioMetros);

  const mostrarEstadoVacio =
    reportesConUbicacion.length === 0 &&
    (!mostrarHeatmap || puntosHeatmapConUbicacion.length === 0);

  const posicionCentro = centro
    ? calcularPosicionMapa(
        {
          latitude: centro.latitude,
          longitude: centro.longitude
        },
        limitesMapa
      )
    : null;

  const estiloCentro = posicionCentro
    ? ({
        '--mapa-reporte-x': `${posicionCentro.x}%`,
        '--mapa-reporte-y': `${posicionCentro.y}%`
      } as CSSProperties)
    : undefined;

  return (
    <section className="mapaReportes" aria-label="Mapa territorial de reportes">
      <header className="mapaReportes__encabezado">
        <div>
          <p className="mapaReportes__eyebrow">Vista territorial</p>
          <h2 className="mapaReportes__titulo">Reportes por ubicación</h2>
          <p className="mapaReportes__descripcion">
            Visualiza incidencias urbanas con coordenadas registradas y prioriza la atención por
            zona, estado y nivel de urgencia.
          </p>
        </div>

        {acciones ? <div className="mapaReportes__acciones">{acciones}</div> : null}
      </header>

      <div className="mapaReportes__superficie">
        <div className="mapaReportes__rejilla" aria-hidden="true" />
        <div className="mapaReportes__via mapaReportes__via--principal" aria-hidden="true" />
        <div className="mapaReportes__via mapaReportes__via--secundaria" aria-hidden="true" />
        <div className="mapaReportes__zona mapaReportes__zona--norte" aria-hidden="true" />
        <div className="mapaReportes__zona mapaReportes__zona--sur" aria-hidden="true" />

        {mostrarHeatmap
          ? puntosHeatmapConUbicacion.map((punto) => {
              const posicion = calcularPosicionMapa(punto, limitesMapa);
              const peso = obtenerPesoHeatmap(punto.weight);
              const estiloPunto = {
                '--mapa-reporte-x': `${posicion.x}%`,
                '--mapa-reporte-y': `${posicion.y}%`,
                '--mapa-punto-heatmap-peso': peso
              } as CSSProperties;

              return (
                <span
                  key={`heatmap-${punto.id}`}
                  className={[
                    'mapaReportes__heatmapPunto',
                    `mapaReportes__heatmapPunto--${obtenerClasePrioridad(punto.priority)}`
                  ].join(' ')}
                  style={estiloPunto}
                  title={`Intensidad ${punto.priority.toLowerCase()} · ${punto.status}`}
                  aria-hidden="true"
                />
              );
            })
          : null}

        {centro && estiloCentro ? (
          <span
            className="mapaReportes__centroConsulta"
            style={estiloCentro}
            title={radioVisible ? `Centro de consulta · radio ${radioVisible}` : 'Centro de consulta'}
            aria-label={
              radioVisible ? `Centro de consulta con radio ${radioVisible}` : 'Centro de consulta'
            }
          >
            <span aria-hidden="true" />
          </span>
        ) : null}

        {reportesConUbicacion.map((reporte, indice) => (
          <MarcadorReporte
            key={reporte.id}
            reporte={reporte}
            indice={indice}
            posicion={calcularPosicionMapa(reporte, limitesMapa)}
            activo={reporte.id === reporteSeleccionadoId}
            alSeleccionar={alSeleccionarReporte}
          />
        ))}

        {mostrarEstadoVacio ? (
          <div className="mapaReportes__estadoVacio">
            <EstadoVacio titulo={tituloVacio} descripcion={descripcionVacia} />
          </div>
        ) : null}

        <div className="mapaReportes__leyenda" aria-label="Leyenda del mapa">
          <span>
            <i className="mapaReportes__leyendaPunto mapaReportes__leyendaPunto--alta" />
            Alta
          </span>
          <span>
            <i className="mapaReportes__leyendaPunto mapaReportes__leyendaPunto--media" />
            Media
          </span>
          <span>
            <i className="mapaReportes__leyendaPunto mapaReportes__leyendaPunto--baja" />
            Baja
          </span>
        </div>
      </div>

      <footer className="mapaReportes__pie">
        <span>{reportesConUbicacion.length} reportes con ubicación</span>
        {mostrarHeatmap ? <span>{puntosHeatmapConUbicacion.length} puntos de intensidad</span> : null}
        {radioVisible ? <span>Radio: {radioVisible}</span> : null}
        <span>Vista referencial</span>
      </footer>
    </section>
  );
}