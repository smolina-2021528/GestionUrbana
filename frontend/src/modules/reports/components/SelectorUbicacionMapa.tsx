import { useEffect, useMemo } from 'react';
import L from 'leaflet';
import { MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from 'react-leaflet';

import { Boton } from '../../../shared/components/ui/Boton';
import {
  centroMapaPredeterminado,
  opcionesTilesOpenStreetMap,
  urlTilesOpenStreetMap,
  zoomMapaMaximo,
  zoomMapaMinimo,
  zoomMapaPredeterminado
} from '../config/mapaConfig';
import type { CoordenadasGeograficas } from '../types/reportesTipos';
import {
  esLatitudReporteValida,
  esLongitudReporteValida
} from '../utils/validacionesGeograficas';
import './selectorUbicacionMapa.css';

type PropiedadesSelectorUbicacionMapa = {
  latitude?: number | null;
  longitude?: number | null;
  bloqueado?: boolean;
  soloLectura?: boolean;
  titulo?: string;
  descripcion?: string;
  etiquetaPunto?: string;
  textoSinPunto?: string;
  altura?: 'compacta' | 'normal' | 'amplia';
  alCambiarCoordenadas?: (coordenadas: CoordenadasGeograficas) => void;
};

type PropiedadesEventosSelectorMapa = {
  bloqueado: boolean;
  alCambiarCoordenadas?: (coordenadas: CoordenadasGeograficas) => void;
};

type PropiedadesSincronizadorSelectorMapa = {
  coordenadas: CoordenadasGeograficas;
  acercar?: boolean;
};

function tieneCoordenadasValidas(latitude?: number | null, longitude?: number | null) {
  return (
    typeof latitude === 'number' &&
    Number.isFinite(latitude) &&
    typeof longitude === 'number' &&
    Number.isFinite(longitude) &&
    esLatitudReporteValida(latitude) &&
    esLongitudReporteValida(longitude)
  );
}

function normalizarCoordenadas(latitude?: number | null, longitude?: number | null) {
  if (!tieneCoordenadasValidas(latitude, longitude)) {
    return null;
  }

  return {
    latitude: Number(latitude),
    longitude: Number(longitude)
  } satisfies CoordenadasGeograficas;
}

function crearLatLng(coordenadas: CoordenadasGeograficas): L.LatLngTuple {
  return [coordenadas.latitude, coordenadas.longitude];
}

function formatearCoordenada(valor: number) {
  return new Intl.NumberFormat('es-GT', {
    maximumFractionDigits: 6,
    minimumFractionDigits: 3
  }).format(valor);
}

function crearIconoSelectorUbicacion() {
  return L.divIcon({
    className: 'selectorUbicacionMapa__iconoLeaflet',
    html: '<span class="selectorUbicacionMapa__marcador"><span></span></span>',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -18]
  });
}

function EventosSelectorMapa({
  bloqueado,
  alCambiarCoordenadas
}: PropiedadesEventosSelectorMapa) {
  useMapEvents({
    click: (evento) => {
      if (bloqueado || !alCambiarCoordenadas) {
        return;
      }

      alCambiarCoordenadas({
        latitude: Number(evento.latlng.lat.toFixed(6)),
        longitude: Number(evento.latlng.lng.toFixed(6))
      });
    }
  });

  return null;
}

function SincronizadorSelectorMapa({
  coordenadas,
  acercar = false
}: PropiedadesSincronizadorSelectorMapa) {
  const mapa = useMap();

  useEffect(() => {
    mapa.setView(
      crearLatLng(coordenadas),
      acercar ? Math.max(mapa.getZoom(), 15) : mapa.getZoom()
    );
  }, [acercar, coordenadas.latitude, coordenadas.longitude, mapa]);

  return null;
}

function ControlCentrarSelectorMapa({
  tieneCoordenadas,
  alCentrar
}: {
  tieneCoordenadas: boolean;
  alCentrar: (mapa: L.Map) => void;
}) {
  const mapa = useMap();

  return (
    <div className="leaflet-top leaflet-right selectorUbicacionMapa__controlCentrar">
      <div className="leaflet-control">
        <Boton
          tamano="sm"
          variante="secundario"
          aria-label={
            tieneCoordenadas
              ? 'Centrar mapa en el punto seleccionado'
              : 'Centrar mapa en el área inicial'
          }
          onClick={(evento) => {
            evento.stopPropagation();
            alCentrar(mapa);
          }}
          onMouseDown={(evento) => evento.stopPropagation()}
          onDoubleClick={(evento) => evento.stopPropagation()}
        >
          {tieneCoordenadas ? 'Centrar punto' : 'Centrar mapa'}
        </Boton>
      </div>
    </div>
  );
}

export function SelectorUbicacionMapa({
  latitude,
  longitude,
  bloqueado = false,
  soloLectura = false,
  titulo = 'Selector visual de ubicación',
  descripcion = 'Haz clic sobre el mapa para seleccionar el punto exacto de la incidencia.',
  etiquetaPunto = 'Punto seleccionado',
  textoSinPunto = 'Selecciona un punto en el mapa o ingresa las coordenadas manualmente.',
  altura = 'normal',
  alCambiarCoordenadas
}: PropiedadesSelectorUbicacionMapa) {
  const coordenadas = useMemo(
    () => normalizarCoordenadas(latitude, longitude),
    [latitude, longitude]
  );

  const centroInicial = coordenadas ?? centroMapaPredeterminado;
  const seleccionBloqueada = bloqueado || soloLectura || !alCambiarCoordenadas;
  const iconoSelector = useMemo(() => crearIconoSelectorUbicacion(), []);

  const centrarMapaEnPunto = (mapa: L.Map) => {
    if (!coordenadas) {
      mapa.flyTo(crearLatLng(centroMapaPredeterminado), zoomMapaPredeterminado, {
        duration: 0.55
      });
      return;
    }

    mapa.flyTo(crearLatLng(coordenadas), Math.max(mapa.getZoom(), 15), {
      duration: 0.55
    });
  };

  return (
    <section
      className={[
        'selectorUbicacionMapa',
        `selectorUbicacionMapa--${altura}`,
        seleccionBloqueada ? 'selectorUbicacionMapa--bloqueado' : ''
      ]
        .filter(Boolean)
        .join(' ')}
      aria-label={titulo}
    >
      <div className="selectorUbicacionMapa__encabezado">
        <div>
          <strong>{titulo}</strong>
          <p>{soloLectura ? 'Vista territorial registrada para este reporte.' : descripcion}</p>
        </div>

        <span className="selectorUbicacionMapa__estado" aria-live="polite">
          {coordenadas ? 'Con punto' : 'Sin punto'}
        </span>
      </div>

      {!soloLectura ? (
        <p className="selectorUbicacionMapa__ayuda">
          Puedes mover el mapa, acercarte con zoom y hacer clic para fijar el punto. Los campos
          manuales siguen disponibles como respaldo.
        </p>
      ) : null}

      <div className="selectorUbicacionMapa__contenedor">
        <MapContainer
          className="selectorUbicacionMapa__mapa"
          center={crearLatLng(centroInicial)}
          zoom={coordenadas ? 15 : zoomMapaPredeterminado}
          minZoom={zoomMapaMinimo}
          maxZoom={zoomMapaMaximo}
          scrollWheelZoom={!seleccionBloqueada}
          dragging={!bloqueado}
        >
          <TileLayer url={urlTilesOpenStreetMap} {...opcionesTilesOpenStreetMap} />

          <EventosSelectorMapa
            bloqueado={seleccionBloqueada}
            alCambiarCoordenadas={alCambiarCoordenadas}
          />

          <SincronizadorSelectorMapa coordenadas={centroInicial} acercar={Boolean(coordenadas)} />

          {coordenadas ? (
            <Marker position={crearLatLng(coordenadas)} icon={iconoSelector}>
              <Popup>
                <article className="selectorUbicacionMapa__popup">
                  <span>{etiquetaPunto}</span>
                  <strong>
                    {formatearCoordenada(coordenadas.latitude)},{' '}
                    {formatearCoordenada(coordenadas.longitude)}
                  </strong>
                </article>
              </Popup>
            </Marker>
          ) : null}

          <ControlCentrarSelectorMapa
            tieneCoordenadas={Boolean(coordenadas)}
            alCentrar={centrarMapaEnPunto}
          />
        </MapContainer>

        {!coordenadas ? (
          <div className="selectorUbicacionMapa__sinPunto">
            <strong>Sin punto seleccionado</strong>
            <span>{textoSinPunto}</span>
          </div>
        ) : null}
      </div>

      <footer className="selectorUbicacionMapa__pie" aria-live="polite">
        {coordenadas ? (
          <>
            <span>Latitud: {formatearCoordenada(coordenadas.latitude)}</span>
            <span>Longitud: {formatearCoordenada(coordenadas.longitude)}</span>
          </>
        ) : (
          <span>El mapa se centra inicialmente en Ciudad de Guatemala.</span>
        )}
      </footer>
    </section>
  );
}