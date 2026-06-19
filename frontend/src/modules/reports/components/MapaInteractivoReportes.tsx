import { useEffect, useMemo, useState, type MouseEvent, type ReactNode } from 'react';
import L from 'leaflet';
import {
  Circle,
  CircleMarker,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  useMapEvents
} from 'react-leaflet';

import { EstadoVacio } from '../../../shared/components/data/EstadoVacio';
import { Boton } from '../../../shared/components/ui/Boton';
import { InsigniaEstado } from '../../../shared/components/ui/InsigniaEstado';
import { InsigniaPrioridad } from '../../../shared/components/ui/InsigniaPrioridad';
import {
  opcionesMapaInteractivo,
  opcionesTilesOpenStreetMap,
  urlTilesOpenStreetMap,
  zoomMapaPredeterminado
} from '../config/mapaConfig';
import type {
  CategoriaReporte,
  CoordenadasGeograficas,
  FiltrosBoundingBoxReportes,
  PuntoHeatmapReporte
} from '../types/reportesTipos';
import {
  convertirBoundsAFiltrosBoundingBox,
  crearLatLngDesdeCoordenadas,
  formatearCoordenadaMapa,
  formatearRadioMapa,
  obtenerCentroMapa,
  tieneUbicacionMapa
} from '../utils/mapaInteractivoUtils';
import type { ReporteMapaVisual } from './MarcadorReporte';
import './mapaInteractivoReportes.css';

type ReporteMapaConUbicacion = ReporteMapaVisual & CoordenadasGeograficas;

type PuntoHeatmapConUbicacion = PuntoHeatmapReporte & CoordenadasGeograficas;

type PropiedadesMapaInteractivoReportes = {
  reportes: ReporteMapaVisual[];
  puntosHeatmap?: PuntoHeatmapReporte[];
  reporteSeleccionadoId?: string;
  centro?: CoordenadasGeograficas;
  radioMetros?: number;
  mostrarHeatmap?: boolean;
  mostrarAccionAreaVisible?: boolean;
  bloqueadoConsultaArea?: boolean;
  acciones?: ReactNode;
  tituloVacio?: string;
  descripcionVacia?: string;
  alSeleccionarReporte?: (reporte: ReporteMapaVisual) => void;
  alVerDetalle?: (reporte: ReporteMapaVisual) => void;
  alBuscarEnAreaVisible?: (filtros: FiltrosBoundingBoxReportes) => void;
};

type PropiedadesSincronizadorVistaMapa = {
  centro?: CoordenadasGeograficas;
  reportes: ReporteMapaConUbicacion[];
  reporteSeleccionadoId?: string;
};

type PropiedadesRastreadorAreaVisible = {
  activo: boolean;
  alCambiarAreaVisible: (filtros: FiltrosBoundingBoxReportes, pendiente: boolean) => void;
};

type PropiedadesControlCentroConsulta = {
  centro?: CoordenadasGeograficas;
  radioMetros?: number;
};

const etiquetasCategoria: Record<CategoriaReporte, string> = {
  INFRAESTRUCTURA: 'Infraestructura',
  SEGURIDAD: 'Seguridad',
  LIMPIEZA: 'Limpieza'
};

const opcionesPrioridadMapa = {
  ALTA: {
    color: 'var(--color-prioridad-alta)',
    fillColor: 'var(--color-prioridad-alta)'
  },
  MEDIA: {
    color: 'var(--color-prioridad-media)',
    fillColor: 'var(--color-prioridad-media)'
  },
  BAJA: {
    color: 'var(--color-prioridad-baja)',
    fillColor: 'var(--color-prioridad-baja)'
  }
} as const;

function esReporteConUbicacion(reporte: ReporteMapaVisual): reporte is ReporteMapaConUbicacion {
  return tieneUbicacionMapa(reporte);
}

function esPuntoHeatmapConUbicacion(punto: PuntoHeatmapReporte): punto is PuntoHeatmapConUbicacion {
  return tieneUbicacionMapa(punto);
}

function obtenerClasePrioridad(prioridad: ReporteMapaVisual['priority']) {
  return prioridad.toLowerCase().replace('_', '-');
}

function obtenerEtiquetaCategoria(categoria: CategoriaReporte) {
  return etiquetasCategoria[categoria] ?? categoria;
}

function formatearFechaMapa(fecha: string | null | undefined) {
  if (!fecha) {
    return 'Fecha no disponible';
  }

  const fechaValida = new Date(fecha);

  if (Number.isNaN(fechaValida.getTime())) {
    return 'Fecha no disponible';
  }

  return new Intl.DateTimeFormat('es-GT', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(fechaValida);
}

function obtenerTextoUbicacion(reporte: ReporteMapaVisual) {
  if (reporte.address) {
    return reporte.address;
  }

  return `${formatearCoordenadaMapa(reporte.latitude)}, ${formatearCoordenadaMapa(reporte.longitude)}`;
}

function obtenerPesoVisualHeatmap(peso: number) {
  if (!Number.isFinite(peso)) {
    return 1;
  }

  return Math.min(Math.max(peso, 1), 5);
}

function crearIconoReporte(reporte: ReporteMapaVisual, indice: number, activo: boolean) {
  const clasePrioridad = obtenerClasePrioridad(reporte.priority);
  const contenido = indice + 1;

  return L.divIcon({
    className: 'mapaInteractivoReportes__iconoLeaflet',
    html: `<span class="mapaInteractivoReportes__marcador mapaInteractivoReportes__marcador--${clasePrioridad} ${
      activo ? 'mapaInteractivoReportes__marcador--activo' : ''
    }"><span>${contenido}</span></span>`,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    popupAnchor: [0, -18]
  });
}

function crearIconoCentroConsulta() {
  return L.divIcon({
    className: 'mapaInteractivoReportes__iconoLeaflet',
    html: '<span class="mapaInteractivoReportes__centroConsulta"><span></span></span>',
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -16]
  });
}

function SincronizadorVistaMapa({
  centro,
  reportes,
  reporteSeleccionadoId
}: PropiedadesSincronizadorVistaMapa) {
  const mapa = useMap();

  useEffect(() => {
    const reporteSeleccionado = reportes.find(
      (reporte) => reporte.id === reporteSeleccionadoId && tieneUbicacionMapa(reporte)
    );

    if (reporteSeleccionado) {
      mapa.flyTo(
        crearLatLngDesdeCoordenadas(reporteSeleccionado),
        Math.max(mapa.getZoom(), 15),
        { duration: 0.65 }
      );
      return;
    }

    if (centro && tieneUbicacionMapa(centro)) {
      mapa.setView(crearLatLngDesdeCoordenadas(centro), mapa.getZoom() || zoomMapaPredeterminado);
      return;
    }

    if (reportes.length === 1 && tieneUbicacionMapa(reportes[0])) {
      mapa.setView(crearLatLngDesdeCoordenadas(reportes[0]), zoomMapaPredeterminado);
      return;
    }

    if (reportes.length > 1) {
      const bounds = L.latLngBounds(
        reportes
          .filter(tieneUbicacionMapa)
          .map((reporte) => crearLatLngDesdeCoordenadas(reporte))
      );

      if (bounds.isValid()) {
        mapa.fitBounds(bounds, {
          maxZoom: 15,
          padding: [42, 42]
        });
      }
    }
  }, [centro, mapa, reporteSeleccionadoId, reportes]);

  return null;
}

function RastreadorAreaVisibleMapa({
  activo,
  alCambiarAreaVisible
}: PropiedadesRastreadorAreaVisible) {
  const actualizarAreaVisible = (mapa: L.Map, pendiente: boolean) => {
    if (!activo) {
      return;
    }

    const bounds = mapa.getBounds();
    const filtros = convertirBoundsAFiltrosBoundingBox(bounds);

    alCambiarAreaVisible(filtros, pendiente);
  };

  const mapa = useMapEvents({
    moveend: () => actualizarAreaVisible(mapa, true),
    zoomend: () => actualizarAreaVisible(mapa, true)
  });

  useEffect(() => {
    actualizarAreaVisible(mapa, false);
  }, [activo, mapa]);

  return null;
}

function ControlCentroConsultaMapa({ centro, radioMetros }: PropiedadesControlCentroConsulta) {
  const mapa = useMap();

  if (!centro || !tieneUbicacionMapa(centro)) {
    return null;
  }

  const centrarConsulta = (evento: MouseEvent<HTMLButtonElement>) => {
    evento.stopPropagation();

    mapa.flyTo(crearLatLngDesdeCoordenadas(centro), Math.max(mapa.getZoom(), 14), {
      duration: 0.65
    });
  };

  const detenerPropagacion = (evento: MouseEvent<HTMLButtonElement>) => {
    evento.stopPropagation();
  };

  return (
    <div className="leaflet-top leaflet-right mapaInteractivoReportes__controlCentro">
      <button
        type="button"
        className="mapaInteractivoReportes__botonCentro"
        aria-label="Centrar mapa en el punto de consulta"
        onClick={centrarConsulta}
        onMouseDown={detenerPropagacion}
        onDoubleClick={detenerPropagacion}
      >
        <span>Centrar consulta</span>
        {radioMetros ? <small>{formatearRadioMapa(radioMetros)}</small> : null}
      </button>
    </div>
  );
}

export function MapaInteractivoReportes({
  reportes,
  puntosHeatmap = [],
  reporteSeleccionadoId,
  centro,
  radioMetros,
  mostrarHeatmap = false,
  mostrarAccionAreaVisible = false,
  bloqueadoConsultaArea = false,
  acciones,
  tituloVacio = 'Sin reportes con ubicación',
  descripcionVacia = 'Ajusta los filtros o registra coordenadas para visualizar incidencias en el mapa.',
  alSeleccionarReporte,
  alVerDetalle,
  alBuscarEnAreaVisible
}: PropiedadesMapaInteractivoReportes) {
  const [filtrosAreaVisible, setFiltrosAreaVisible] = useState<
    FiltrosBoundingBoxReportes | undefined
  >();
  const [areaVisiblePendiente, setAreaVisiblePendiente] = useState(false);

  const reportesConUbicacion = useMemo(() => reportes.filter(esReporteConUbicacion), [reportes]);
  const puntosHeatmapConUbicacion = useMemo(
    () => puntosHeatmap.filter(esPuntoHeatmapConUbicacion),
    [puntosHeatmap]
  );

  const centroInicial = useMemo(
    () => centro ?? obtenerCentroMapa([...reportesConUbicacion, ...puntosHeatmapConUbicacion]),
    [centro, puntosHeatmapConUbicacion, reportesConUbicacion]
  );

  const radioVisible = radioMetros ? formatearRadioMapa(radioMetros) : null;
  const mostrarCentroConsulta = centro && tieneUbicacionMapa(centro);
  const mostrarEstadoVacio =
    reportesConUbicacion.length === 0 &&
    (!mostrarHeatmap || puntosHeatmapConUbicacion.length === 0);

  const puedeBuscarAreaVisible =
    mostrarAccionAreaVisible &&
    Boolean(alBuscarEnAreaVisible) &&
    Boolean(filtrosAreaVisible) &&
    areaVisiblePendiente &&
    !bloqueadoConsultaArea;

  const registrarAreaVisible = (filtros: FiltrosBoundingBoxReportes, pendiente: boolean) => {
    setFiltrosAreaVisible(filtros);
    setAreaVisiblePendiente(pendiente);
  };

  const buscarEnAreaVisible = () => {
    if (!filtrosAreaVisible || !alBuscarEnAreaVisible || bloqueadoConsultaArea) {
      return;
    }

    alBuscarEnAreaVisible(filtrosAreaVisible);
    setAreaVisiblePendiente(false);
  };

  return (
    <section className="mapaInteractivoReportes" aria-label="Mapa interactivo de reportes">
      <header className="mapaInteractivoReportes__encabezado">
        <div>
          <p className="mapaInteractivoReportes__eyebrow">Vista territorial</p>
          <h2 className="mapaInteractivoReportes__titulo">Reportes por ubicación</h2>
          <p className="mapaInteractivoReportes__descripcion">
            Explora incidencias urbanas sobre un mapa real, revisa su prioridad y abre el detalle
            para dar seguimiento operativo o ciudadano.
          </p>
        </div>

        {acciones ? <div className="mapaInteractivoReportes__acciones">{acciones}</div> : null}
      </header>

      <div className="mapaInteractivoReportes__contenedor">
        <MapContainer
          className="mapaInteractivoReportes__mapa"
          center={crearLatLngDesdeCoordenadas(centroInicial)}
          zoom={opcionesMapaInteractivo.zoom}
          minZoom={opcionesMapaInteractivo.minZoom}
          maxZoom={opcionesMapaInteractivo.maxZoom}
          scrollWheelZoom={opcionesMapaInteractivo.scrollWheelZoom}
        >
          <TileLayer url={urlTilesOpenStreetMap} {...opcionesTilesOpenStreetMap} />

          <SincronizadorVistaMapa
            centro={centro}
            reportes={reportesConUbicacion}
            reporteSeleccionadoId={reporteSeleccionadoId}
          />

          <RastreadorAreaVisibleMapa
            activo={mostrarAccionAreaVisible}
            alCambiarAreaVisible={registrarAreaVisible}
          />

          <ControlCentroConsultaMapa centro={centro} radioMetros={radioMetros} />

          {mostrarCentroConsulta ? (
            <>
              {radioMetros ? (
                <Circle
                  center={crearLatLngDesdeCoordenadas(centro)}
                  radius={radioMetros}
                  pathOptions={{
                    color: 'var(--color-principal)',
                    fillColor: 'var(--color-principal)',
                    fillOpacity: 0.08,
                    opacity: 0.36,
                    weight: 2
                  }}
                />
              ) : null}

              <Marker position={crearLatLngDesdeCoordenadas(centro)} icon={crearIconoCentroConsulta()}>
                <Popup>
                  <article className="mapaInteractivoReportes__popup mapaInteractivoReportes__popup--compacto">
                    <span className="mapaInteractivoReportes__popupCategoria">
                      Centro de consulta
                    </span>
                    <h3 className="mapaInteractivoReportes__popupTitulo">Punto de referencia</h3>
                    <p className="mapaInteractivoReportes__popupTexto">
                      {radioMetros
                        ? `El mapa muestra reportes cercanos dentro de un radio de ${formatearRadioMapa(
                            radioMetros
                          )}.`
                        : 'Punto utilizado como referencia territorial.'}
                    </p>
                    <dl className="mapaInteractivoReportes__popupDatos">
                      <div>
                        <dt>Latitud</dt>
                        <dd>{formatearCoordenadaMapa(centro.latitude)}</dd>
                      </div>
                      <div>
                        <dt>Longitud</dt>
                        <dd>{formatearCoordenadaMapa(centro.longitude)}</dd>
                      </div>
                    </dl>
                  </article>
                </Popup>
              </Marker>
            </>
          ) : null}

          {mostrarHeatmap
            ? puntosHeatmapConUbicacion.map((punto) => {
                const peso = obtenerPesoVisualHeatmap(punto.weight);
                const opcionesPrioridad = opcionesPrioridadMapa[punto.priority];

                return (
                  <CircleMarker
                    key={`intensidad-${punto.id}`}
                    center={crearLatLngDesdeCoordenadas(punto)}
                    radius={10 + peso * 4}
                    pathOptions={{
                      ...opcionesPrioridad,
                      fillOpacity: 0.18,
                      opacity: 0.28,
                      weight: 1
                    }}
                  >
                    <Popup>
                      <div className="mapaInteractivoReportes__popup mapaInteractivoReportes__popup--compacto">
                        <span className="mapaInteractivoReportes__popupCategoria">
                          Intensidad territorial
                        </span>
                        <p className="mapaInteractivoReportes__popupTexto">
                          Prioridad {punto.priority.toLowerCase()} · Estado {punto.status}
                        </p>
                      </div>
                    </Popup>
                  </CircleMarker>
                );
              })
            : null}

          {reportesConUbicacion.map((reporte, indice) => {
            const activo = reporte.id === reporteSeleccionadoId;

            return (
              <Marker
                key={reporte.id}
                position={crearLatLngDesdeCoordenadas(reporte)}
                icon={crearIconoReporte(reporte, indice, activo)}
                eventHandlers={{
                  click: () => alSeleccionarReporte?.(reporte)
                }}
              >
                <Popup>
                  <article className="mapaInteractivoReportes__popup">
                    <span className="mapaInteractivoReportes__popupCategoria">
                      {obtenerEtiquetaCategoria(reporte.category)}
                    </span>

                    <h3 className="mapaInteractivoReportes__popupTitulo">{reporte.title}</h3>

                    <p className="mapaInteractivoReportes__popupUbicacion">
                      {obtenerTextoUbicacion(reporte)}
                    </p>

                    <div className="mapaInteractivoReportes__popupInsignias">
                      <InsigniaEstado estado={reporte.status} />
                      <InsigniaPrioridad prioridad={reporte.priority} />
                    </div>

                    <dl className="mapaInteractivoReportes__popupDatos">
                      <div>
                        <dt>Creado</dt>
                        <dd>{formatearFechaMapa(reporte.createdAt)}</dd>
                      </div>
                      <div>
                        <dt>Latitud</dt>
                        <dd>{formatearCoordenadaMapa(reporte.latitude)}</dd>
                      </div>
                      <div>
                        <dt>Longitud</dt>
                        <dd>{formatearCoordenadaMapa(reporte.longitude)}</dd>
                      </div>
                    </dl>

                    {alVerDetalle ? (
                      <Boton tamano="sm" onClick={() => alVerDetalle(reporte)}>
                        Ver detalle
                      </Boton>
                    ) : null}
                  </article>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        {mostrarAccionAreaVisible ? (
          <div className="mapaInteractivoReportes__controlArea" aria-live="polite">
            <div>
              <span className="mapaInteractivoReportes__controlAreaTitulo">Área visible</span>
              <p className="mapaInteractivoReportes__controlAreaTexto">
                Mueve el mapa o ajusta el zoom para consultar reportes dentro de esa zona.
              </p>
            </div>

            <Boton
              tamano="sm"
              variante="secundario"
              disabled={!puedeBuscarAreaVisible}
              onClick={buscarEnAreaVisible}
            >
              Buscar en esta área
            </Boton>
          </div>
        ) : null}

        {mostrarEstadoVacio ? (
          <div className="mapaInteractivoReportes__estadoVacio">
            <EstadoVacio titulo={tituloVacio} descripcion={descripcionVacia} />
          </div>
        ) : null}

        <div className="mapaInteractivoReportes__leyenda" aria-label="Leyenda del mapa interactivo">
          <span>
            <i className="mapaInteractivoReportes__leyendaPunto mapaInteractivoReportes__leyendaPunto--alta" />
            Alta
          </span>
          <span>
            <i className="mapaInteractivoReportes__leyendaPunto mapaInteractivoReportes__leyendaPunto--media" />
            Media
          </span>
          <span>
            <i className="mapaInteractivoReportes__leyendaPunto mapaInteractivoReportes__leyendaPunto--baja" />
            Baja
          </span>
          {mostrarCentroConsulta ? (
            <span>
              <i className="mapaInteractivoReportes__leyendaPunto mapaInteractivoReportes__leyendaPunto--centro" />
              Centro
            </span>
          ) : null}
        </div>
      </div>

      <footer className="mapaInteractivoReportes__pie">
        <span>{reportesConUbicacion.length} reportes con ubicación</span>
        {mostrarHeatmap ? <span>{puntosHeatmapConUbicacion.length} puntos de intensidad</span> : null}
        {radioVisible ? <span>Radio: {radioVisible}</span> : null}
        {mostrarCentroConsulta ? <span>Centro activo</span> : null}
        <span>Mapa interactivo</span>
      </footer>
    </section>
  );
}