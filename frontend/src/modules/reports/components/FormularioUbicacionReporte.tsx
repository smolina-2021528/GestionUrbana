import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';

import { Alerta } from '../../../shared/components/feedback/Alerta';
import { Boton } from '../../../shared/components/ui/Boton';
import type {
  ActualizarUbicacionReportePayload,
  CoordenadasGeograficas,
  Reporte
} from '../types/reportesTipos';
import {
  esLatitudReporteValida,
  esLongitudReporteValida
} from '../utils/validacionesGeograficas';
import { SelectorUbicacionMapa } from './SelectorUbicacionMapa';
import './ubicacionReporte.css';

type PropiedadesFormularioUbicacionReporte = {
  reporte: Reporte;
  bloqueado?: boolean;
  alGuardar: (datos: ActualizarUbicacionReportePayload) => Promise<void> | void;
  alCancelar: () => void;
};

function obtenerValorCoordenada(valor: number | null) {
  return typeof valor === 'number' && Number.isFinite(valor) ? String(valor) : '';
}

function obtenerNumeroFormulario(valor: string) {
  const numero = Number(valor);

  return Number.isFinite(numero) ? numero : null;
}

function obtenerMensajeValidacion(latitudTexto: string, longitudTexto: string) {
  const latitud = obtenerNumeroFormulario(latitudTexto);
  const longitud = obtenerNumeroFormulario(longitudTexto);

  if (latitud === null) {
    return 'Ingresa una latitud válida.';
  }

  if (longitud === null) {
    return 'Ingresa una longitud válida.';
  }

  if (!esLatitudReporteValida(latitud)) {
    return 'La latitud debe estar entre -90 y 90.';
  }

  if (!esLongitudReporteValida(longitud)) {
    return 'La longitud debe estar entre -180 y 180.';
  }

  return null;
}

function obtenerCoordenadasFormulario(latitudTexto: string, longitudTexto: string) {
  const latitud = obtenerNumeroFormulario(latitudTexto);
  const longitud = obtenerNumeroFormulario(longitudTexto);

  if (
    latitud === null ||
    longitud === null ||
    !esLatitudReporteValida(latitud) ||
    !esLongitudReporteValida(longitud)
  ) {
    return null;
  }

  return {
    latitude: latitud,
    longitude: longitud
  } satisfies CoordenadasGeograficas;
}

export function FormularioUbicacionReporte({
  reporte,
  bloqueado = false,
  alGuardar,
  alCancelar
}: PropiedadesFormularioUbicacionReporte) {
  const [latitud, setLatitud] = useState(() => obtenerValorCoordenada(reporte.latitude));
  const [longitud, setLongitud] = useState(() => obtenerValorCoordenada(reporte.longitude));
  const [direccion, setDireccion] = useState(reporte.address ?? '');
  const [mensajeValidacion, setMensajeValidacion] = useState<string | null>(null);
  const [mensajeMapa, setMensajeMapa] = useState<string | null>(null);

  useEffect(() => {
    setLatitud(obtenerValorCoordenada(reporte.latitude));
    setLongitud(obtenerValorCoordenada(reporte.longitude));
    setDireccion(reporte.address ?? '');
    setMensajeValidacion(null);
    setMensajeMapa(null);
  }, [reporte.address, reporte.latitude, reporte.longitude]);

  const coordenadasFormulario = useMemo(
    () => obtenerCoordenadasFormulario(latitud, longitud),
    [latitud, longitud]
  );

  const seleccionarCoordenadasMapa = (coordenadas: CoordenadasGeograficas) => {
    setLatitud(coordenadas.latitude.toFixed(6));
    setLongitud(coordenadas.longitude.toFixed(6));
    setMensajeValidacion(null);
    setMensajeMapa('Punto seleccionado en el mapa. Puedes ajustar los campos manualmente antes de guardar.');
  };

  const guardar = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();

    const mensaje = obtenerMensajeValidacion(latitud, longitud);

    if (mensaje) {
      setMensajeValidacion(mensaje);
      return;
    }

    const latitudNumero = Number(latitud);
    const longitudNumero = Number(longitud);
    const direccionLimpia = direccion.trim();

    setMensajeValidacion(null);

    await alGuardar({
      latitude: latitudNumero,
      longitude: longitudNumero,
      ...(direccionLimpia.length > 0 && { address: direccionLimpia })
    });
  };

  return (
    <form className="formularioUbicacionReporte" onSubmit={guardar}>
      {mensajeValidacion ? (
        <Alerta variante="advertencia" titulo="Revisa la ubicación">
          <p>{mensajeValidacion}</p>
        </Alerta>
      ) : null}

      {mensajeMapa ? (
        <Alerta variante="informacion" titulo="Mapa actualizado">
          <p>{mensajeMapa}</p>
        </Alerta>
      ) : null}

      <SelectorUbicacionMapa
        latitude={coordenadasFormulario?.latitude}
        longitude={coordenadasFormulario?.longitude}
        bloqueado={bloqueado}
        titulo="Seleccionar ubicación"
        descripcion="Haz clic sobre el mapa para ajustar el punto territorial del reporte."
        etiquetaPunto="Ubicación del reporte"
        altura="compacta"
        alCambiarCoordenadas={seleccionarCoordenadasMapa}
      />

      <div className="formularioUbicacionReporte__grid">
        <label className="formularioUbicacionReporte__campo">
          <span>Latitud</span>
          <input
            type="number"
            step="0.000001"
            min="-90"
            max="90"
            value={latitud}
            disabled={bloqueado}
            placeholder="14.634915"
            onChange={(evento) => {
              setLatitud(evento.target.value);
              setMensajeValidacion(null);
              setMensajeMapa(null);
            }}
          />
        </label>

        <label className="formularioUbicacionReporte__campo">
          <span>Longitud</span>
          <input
            type="number"
            step="0.000001"
            min="-180"
            max="180"
            value={longitud}
            disabled={bloqueado}
            placeholder="-90.506882"
            onChange={(evento) => {
              setLongitud(evento.target.value);
              setMensajeValidacion(null);
              setMensajeMapa(null);
            }}
          />
        </label>

        <label className="formularioUbicacionReporte__campo formularioUbicacionReporte__campo--ancho">
          <span>Dirección o referencia</span>
          <textarea
            value={direccion}
            disabled={bloqueado}
            rows={3}
            placeholder="Referencia visible para ubicar la incidencia"
            onChange={(evento) => setDireccion(evento.target.value)}
          />
        </label>
      </div>

      <div className="formularioUbicacionReporte__acciones">
        <Boton variante="secundario" disabled={bloqueado} onClick={alCancelar}>
          Cancelar
        </Boton>

        <Boton type="submit" disabled={bloqueado}>
          Guardar ubicación
        </Boton>
      </div>
    </form>
  );
}