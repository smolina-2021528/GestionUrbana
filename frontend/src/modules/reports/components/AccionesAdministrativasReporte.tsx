import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';

import { Alerta } from '../../../shared/components/feedback/Alerta';
import { Boton } from '../../../shared/components/ui/Boton';
import { Tarjeta } from '../../../shared/components/ui/Tarjeta';
import { esErrorApi } from '../../../shared/types/errorApi';
import { SelectorResponsableReporte } from './SelectorResponsableReporte';
import { usarAsignarReporte } from '../hooks/usarAsignarReporte';
import { usarCambiarEstadoReporte } from '../hooks/usarCambiarEstadoReporte';
import { usarEliminarReporte } from '../hooks/usarEliminarReporte';
import {
  estadosReporte,
  type EstadoReporte,
  type Reporte
} from '../types/reportesTipos';
import './accionesReporte.css';

type PropiedadesAccionesAdministrativasReporte = {
  reporte: Reporte;
  alCambioRealizado?: () => void;
  alReporteEliminado?: () => void;
};

const etiquetasEstado: Record<EstadoReporte, string> = {
  PENDIENTE: 'Pendiente',
  EN_PROCESO: 'En proceso',
  RESUELTO: 'Resuelto',
  RECHAZADO: 'Rechazado'
};

function obtenerMensajeError(error: unknown) {
  if (esErrorApi(error)) {
    return error.mensaje;
  }

  return 'No fue posible completar la acción. Intenta nuevamente.';
}

function limpiarTexto(valor: string) {
  return valor.trim();
}

function obtenerNombreResponsable(reporte: Reporte) {
  if (!reporte.assignedTo) {
    return 'Sin responsable asignado';
  }

  const nombreCompleto = [reporte.assignedTo.name, reporte.assignedTo.surname]
    .filter(Boolean)
    .join(' ')
    .trim();

  return nombreCompleto || reporte.assignedTo.username || 'Usuario asignado';
}

export function AccionesAdministrativasReporte({
  reporte,
  alCambioRealizado,
  alReporteEliminado
}: PropiedadesAccionesAdministrativasReporte) {
  const cambiarEstado = usarCambiarEstadoReporte();
  const asignarReporte = usarAsignarReporte();
  const eliminarReporte = usarEliminarReporte();

  const [estadoSeleccionado, setEstadoSeleccionado] = useState<EstadoReporte>(reporte.status);
  const [notasEstado, setNotasEstado] = useState('');
  const [responsableId, setResponsableId] = useState(reporte.assignedTo?.id ?? '');
  const [confirmacionEliminacion, setConfirmacionEliminacion] = useState('');
  const [mensajeError, setMensajeError] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  const accionEnProceso =
    cambiarEstado.isPending || asignarReporte.isPending || eliminarReporte.isPending;

  const responsableActualId = reporte.assignedTo?.id ?? '';
  const responsableSinCambios = limpiarTexto(responsableId) === responsableActualId;

  useEffect(() => {
    setEstadoSeleccionado(reporte.status);
  }, [reporte.status]);

  useEffect(() => {
    setResponsableId(reporte.assignedTo?.id ?? '');
  }, [reporte.assignedTo?.id]);

  const limpiarMensajes = () => {
    setMensajeError(null);
    setMensajeExito(null);
  };

  const manejarCambioEstado = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    limpiarMensajes();

    try {
      const respuesta = await cambiarEstado.mutateAsync({
        reporteId: reporte.id,
        datos: {
          status: estadoSeleccionado,
          notes: limpiarTexto(notasEstado) || undefined
        }
      });

      if (respuesta.success === false) {
        setMensajeError(
          respuesta.message ?? respuesta.error ?? 'No fue posible actualizar el estado.'
        );
        return;
      }

      setMensajeExito(respuesta.message ?? 'Estado actualizado correctamente.');
      setNotasEstado('');
      alCambioRealizado?.();
    } catch (error) {
      setMensajeError(obtenerMensajeError(error));
    }
  };

  const manejarAsignacion = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    limpiarMensajes();

    const responsable = limpiarTexto(responsableId);

    if (!responsable) {
      setMensajeError('Selecciona un responsable municipal para asignar el reporte.');
      return;
    }

    if (responsableSinCambios) {
      setMensajeError('Selecciona un responsable diferente antes de guardar la asignación.');
      return;
    }

    try {
      const respuesta = await asignarReporte.mutateAsync({
        reporteId: reporte.id,
        datos: {
          assignedTo: responsable
        }
      });

      if (respuesta.success === false) {
        setMensajeError(
          respuesta.message ?? respuesta.error ?? 'No fue posible asignar el reporte.'
        );
        return;
      }

      setMensajeExito(respuesta.message ?? 'Responsable asignado correctamente.');
      alCambioRealizado?.();
    } catch (error) {
      setMensajeError(obtenerMensajeError(error));
    }
  };

  const manejarEliminacion = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    limpiarMensajes();

    if (confirmacionEliminacion !== 'ELIMINAR') {
      setMensajeError('Escribe ELIMINAR para confirmar la eliminación del reporte.');
      return;
    }

    try {
      const respuesta = await eliminarReporte.mutateAsync(reporte.id);

      if (respuesta.success === false) {
        setMensajeError(
          respuesta.message ?? respuesta.error ?? 'No fue posible eliminar el reporte.'
        );
        return;
      }

      setMensajeExito(respuesta.message ?? 'Reporte eliminado correctamente.');
      alReporteEliminado?.();
    } catch (error) {
      setMensajeError(obtenerMensajeError(error));
    }
  };

  return (
    <Tarjeta
      titulo="Acciones administrativas"
      descripcion="Actualiza el estado, asigna responsable o elimina el reporte cuando corresponda."
    >
      <section className="accionesReporte" aria-label="Acciones administrativas del reporte">
        {mensajeError ? (
          <Alerta variante="error" titulo="No se pudo completar la acción">
            <p>{mensajeError}</p>
          </Alerta>
        ) : null}

        {mensajeExito ? (
          <Alerta variante="exito" titulo="Acción completada">
            <p>{mensajeExito}</p>
          </Alerta>
        ) : null}

        <div className="accionesReporte__grid">
          <form className="accionesReporte__bloque" onSubmit={manejarCambioEstado}>
            <div>
              <span className="accionesReporte__etiqueta">Estado del reporte</span>
              <h3>Cambiar estado</h3>
              <p>Actualiza el avance operativo del caso.</p>
            </div>

            <label className="accionesReporte__campo">
              <span>Nuevo estado</span>
              <select
                value={estadoSeleccionado}
                disabled={accionEnProceso}
                onChange={(evento) => setEstadoSeleccionado(evento.target.value as EstadoReporte)}
              >
                {estadosReporte.map((estado) => (
                  <option key={estado} value={estado}>
                    {etiquetasEstado[estado]}
                  </option>
                ))}
              </select>
            </label>

            <label className="accionesReporte__campo">
              <span>Notas internas</span>
              <textarea
                value={notasEstado}
                placeholder="Agrega una nota breve sobre el cambio realizado."
                disabled={accionEnProceso}
                onChange={(evento) => setNotasEstado(evento.target.value)}
              />
            </label>

            <Boton type="submit" disabled={accionEnProceso}>
              {cambiarEstado.isPending ? 'Actualizando...' : 'Actualizar estado'}
            </Boton>
          </form>

          <form className="accionesReporte__bloque" onSubmit={manejarAsignacion}>
            <div>
              <span className="accionesReporte__etiqueta">Responsable</span>
              <h3>Asignar reporte</h3>
              <p>Selecciona personal municipal con permisos administrativos para dar seguimiento.</p>
            </div>

            <div className="accionesReporte__responsableActual">
              <span>Responsable actual</span>
              <strong>{obtenerNombreResponsable(reporte)}</strong>
            </div>

            <SelectorResponsableReporte
              responsableId={responsableId}
              responsableActual={reporte.assignedTo}
              bloqueado={accionEnProceso}
              alCambiarResponsable={(nuevoResponsableId) => {
                setResponsableId(nuevoResponsableId);
                limpiarMensajes();
              }}
            />

            <Boton
              type="submit"
              variante="secundario"
              disabled={accionEnProceso || responsableSinCambios}
            >
              {asignarReporte.isPending ? 'Asignando...' : 'Asignar responsable'}
            </Boton>
          </form>

          <form
            className="accionesReporte__bloque accionesReporte__bloque--peligro"
            onSubmit={manejarEliminacion}
          >
            <div>
              <span className="accionesReporte__etiqueta">Eliminación</span>
              <h3>Eliminar reporte</h3>
              <p>Esta acción retira el reporte del sistema y no debe usarse para cierres normales.</p>
            </div>

            <label className="accionesReporte__campo">
              <span>Confirmación</span>
              <input
                type="text"
                value={confirmacionEliminacion}
                placeholder="Escribe ELIMINAR"
                disabled={accionEnProceso}
                onChange={(evento) => setConfirmacionEliminacion(evento.target.value)}
              />
            </label>

            <Boton type="submit" variante="peligro" disabled={accionEnProceso}>
              {eliminarReporte.isPending ? 'Eliminando...' : 'Eliminar reporte'}
            </Boton>
          </form>
        </div>
      </section>
    </Tarjeta>
  );
}