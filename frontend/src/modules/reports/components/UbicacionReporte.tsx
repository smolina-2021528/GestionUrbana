import { useState } from 'react';

import { Alerta } from '../../../shared/components/feedback/Alerta';
import { Boton } from '../../../shared/components/ui/Boton';
import { Tarjeta } from '../../../shared/components/ui/Tarjeta';
import { esErrorApi } from '../../../shared/types/errorApi';
import {
  usarActualizarUbicacionReporte,
  usarEliminarUbicacionReporte
} from '../hooks/usarUbicacionReporte';
import type { ActualizarUbicacionReportePayload, Reporte } from '../types/reportesTipos';
import { FormularioUbicacionReporte } from './FormularioUbicacionReporte';
import './ubicacionReporte.css';

type PropiedadesUbicacionReporte = {
  reporte: Reporte;
  puedeGestionar?: boolean;
  alCambioRealizado?: () => void;
};

function formatearCoordenada(valor: number | null) {
  if (typeof valor !== 'number' || !Number.isFinite(valor)) {
    return 'No disponible';
  }

  return new Intl.NumberFormat('es-GT', {
    maximumFractionDigits: 6
  }).format(valor);
}

function tieneCoordenadas(reporte: Reporte) {
  return (
    typeof reporte.latitude === 'number' &&
    Number.isFinite(reporte.latitude) &&
    typeof reporte.longitude === 'number' &&
    Number.isFinite(reporte.longitude)
  );
}

function obtenerDireccion(reporte: Reporte) {
  if (reporte.address && reporte.address.trim().length > 0) {
    return reporte.address;
  }

  return 'Sin dirección o referencia registrada';
}

function obtenerMensajeError(error: unknown) {
  if (esErrorApi(error)) {
    return error.mensaje;
  }

  return 'No fue posible procesar la ubicación. Intenta nuevamente.';
}

function obtenerMensajeRespuestaFallida(mensaje?: string, error?: string) {
  return mensaje ?? error ?? 'No fue posible procesar la ubicación. Intenta nuevamente.';
}

function obtenerUrlMapa(reporte: Reporte) {
  if (!tieneCoordenadas(reporte)) {
    return null;
  }

  return `https://www.google.com/maps/search/?api=1&query=${reporte.latitude},${reporte.longitude}`;
}

export function UbicacionReporte({
  reporte,
  puedeGestionar = false,
  alCambioRealizado
}: PropiedadesUbicacionReporte) {
  const [editando, setEditando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [mensajeError, setMensajeError] = useState<string | null>(null);

  const actualizarUbicacion = usarActualizarUbicacionReporte();
  const eliminarUbicacion = usarEliminarUbicacionReporte();

  const ubicacionRegistrada = tieneCoordenadas(reporte);
  const puedeModificarUbicacion = puedeGestionar && reporte.status === 'PENDIENTE';
  const urlMapa = obtenerUrlMapa(reporte);

  const procesando = actualizarUbicacion.isPending || eliminarUbicacion.isPending;

  const iniciarEdicion = () => {
    setEditando(true);
    setMensajeExito(null);
    setMensajeError(null);
  };

  const cancelarEdicion = () => {
    setEditando(false);
    setMensajeError(null);
  };

  const guardarUbicacion = async (datos: ActualizarUbicacionReportePayload) => {
    setMensajeError(null);
    setMensajeExito(null);

    try {
      const respuesta = await actualizarUbicacion.mutateAsync({
        reporteId: reporte.id,
        datos
      });

      if (respuesta.success === false) {
        setMensajeError(obtenerMensajeRespuestaFallida(respuesta.message, respuesta.error));
        return;
      }

      setMensajeExito(respuesta.message ?? 'Ubicación actualizada correctamente.');
      setEditando(false);
      alCambioRealizado?.();
    } catch (error) {
      setMensajeError(obtenerMensajeError(error));
    }
  };

  const confirmarEliminarUbicacion = async () => {
    if (!ubicacionRegistrada) {
      return;
    }

    const confirmado = window.confirm(
      '¿Deseas eliminar la ubicación registrada para este reporte?'
    );

    if (!confirmado) {
      return;
    }

    setMensajeError(null);
    setMensajeExito(null);

    try {
      const respuesta = await eliminarUbicacion.mutateAsync(reporte.id);

      if (respuesta.success === false) {
        setMensajeError(obtenerMensajeRespuestaFallida(respuesta.message, respuesta.error));
        return;
      }

      setMensajeExito(respuesta.message ?? 'Ubicación eliminada correctamente.');
      setEditando(false);
      alCambioRealizado?.();
    } catch (error) {
      setMensajeError(obtenerMensajeError(error));
    }
  };

  return (
    <Tarjeta
      className="ubicacionReporte"
      titulo="Ubicación del reporte"
      descripcion="Referencia territorial registrada para ubicar la incidencia urbana."
      acciones={
        puedeModificarUbicacion ? (
          <div className="ubicacionReporte__accionesEncabezado">
            {ubicacionRegistrada ? (
              <Boton
                variante="peligro"
                tamano="sm"
                disabled={procesando}
                onClick={confirmarEliminarUbicacion}
              >
                Eliminar ubicación
              </Boton>
            ) : null}

            <Boton
              variante={editando ? 'secundario' : 'primario'}
              tamano="sm"
              disabled={procesando}
              onClick={editando ? cancelarEdicion : iniciarEdicion}
            >
              {editando ? 'Cancelar edición' : ubicacionRegistrada ? 'Editar ubicación' : 'Agregar ubicación'}
            </Boton>
          </div>
        ) : null
      }
    >
      <div className="ubicacionReporte__contenido">
        {mensajeExito ? (
          <Alerta variante="exito" titulo="Ubicación actualizada">
            <p>{mensajeExito}</p>
          </Alerta>
        ) : null}

        {mensajeError ? (
          <Alerta variante="error" titulo="No se pudo procesar la ubicación">
            <p>{mensajeError}</p>
          </Alerta>
        ) : null}

        {!puedeModificarUbicacion && puedeGestionar ? (
          <Alerta variante="informacion" titulo="Ubicación bloqueada">
            <p>
              La ubicación solo puede modificarse cuando el reporte está en estado pendiente.
            </p>
          </Alerta>
        ) : null}

        <div className="ubicacionReporte__grid">
          <div className="ubicacionReporte__resumen">
            <span className={ubicacionRegistrada ? 'ubicacionReporte__estado ubicacionReporte__estado--registrada' : 'ubicacionReporte__estado'}>
              {ubicacionRegistrada ? 'Ubicación registrada' : 'Sin ubicación registrada'}
            </span>

            <div className="ubicacionReporte__datos">
              <div className="ubicacionReporte__dato ubicacionReporte__dato--ancho">
                <span>Dirección o referencia</span>
                <strong>{obtenerDireccion(reporte)}</strong>
              </div>

              <div className="ubicacionReporte__dato">
                <span>Latitud</span>
                <strong>{formatearCoordenada(reporte.latitude)}</strong>
              </div>

              <div className="ubicacionReporte__dato">
                <span>Longitud</span>
                <strong>{formatearCoordenada(reporte.longitude)}</strong>
              </div>

              <div className="ubicacionReporte__dato">
                <span>Estado geográfico</span>
                <strong>{reporte.hasLocation || ubicacionRegistrada ? 'Registrado' : 'No registrado'}</strong>
              </div>
            </div>

            {urlMapa ? (
              <a className="ubicacionReporte__enlaceMapa" href={urlMapa} target="_blank" rel="noreferrer">
                Abrir ubicación en mapa
              </a>
            ) : null}
          </div>

          <div className="ubicacionReporte__vista" aria-label="Referencia visual de ubicación">
            <div className="ubicacionReporte__rejilla" aria-hidden="true" />
            <div className="ubicacionReporte__via ubicacionReporte__via--horizontal" aria-hidden="true" />
            <div className="ubicacionReporte__via ubicacionReporte__via--vertical" aria-hidden="true" />

            {ubicacionRegistrada ? (
              <span className="ubicacionReporte__marcador" title="Ubicación registrada">
                <span aria-hidden="true" />
              </span>
            ) : (
              <div className="ubicacionReporte__sinVista">
                <strong>Sin punto territorial</strong>
                <span>Agrega coordenadas para ubicar este reporte.</span>
              </div>
            )}
          </div>
        </div>

        {editando ? (
          <FormularioUbicacionReporte
            reporte={reporte}
            bloqueado={procesando}
            alGuardar={guardarUbicacion}
            alCancelar={cancelarEdicion}
          />
        ) : null}
      </div>
    </Tarjeta>
  );
}