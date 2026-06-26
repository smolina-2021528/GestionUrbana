import type { EstadoReporte } from '../types/reportesTipos';
import {
  obtenerEtiquetaEstadoOperativo,
  obtenerEstadosPermitidosReporte,
  puedeCambiarEstadoReporte
} from '../utils/reportesOperativosUtils';
import './transicionesEstadoReporte.css';

type PropiedadesTransicionesEstadoReporte = {
  estadoActual: EstadoReporte;
  estadoSeleccionado: EstadoReporte;
  bloqueado?: boolean;
  alCambiarEstado: (estado: EstadoReporte) => void;
};

const estadosOperativos: EstadoReporte[] = ['PENDIENTE', 'EN_PROCESO', 'RESUELTO', 'RECHAZADO'];

const descripcionesEstado: Record<EstadoReporte, string> = {
  PENDIENTE: 'Caso recibido, pendiente de iniciar atención.',
  EN_PROCESO: 'Caso asignado o en seguimiento operativo.',
  RESUELTO: 'Caso cerrado por atención completada.',
  RECHAZADO: 'Caso descartado por no proceder o no corresponder.'
};

const recomendacionesTransicion: Record<EstadoReporte, string> = {
  PENDIENTE: 'Desde pendiente puedes iniciar atención o rechazar si no corresponde.',
  EN_PROCESO: 'Desde en proceso puedes resolver, rechazar o regresar a pendiente.',
  RESUELTO: 'Un caso resuelto no tiene transiciones directas disponibles.',
  RECHAZADO: 'Desde rechazado puedes regresar el caso a pendiente si debe revisarse nuevamente.'
};

function obtenerClaseEstado(
  estado: EstadoReporte,
  estadoActual: EstadoReporte,
  estadoSeleccionado: EstadoReporte,
  disponible: boolean
) {
  const clases = ['transicionesEstadoReporte__opcion'];

  if (estado === estadoActual) {
    clases.push('transicionesEstadoReporte__opcion--actual');
  }

  if (estado === estadoSeleccionado && estado !== estadoActual) {
    clases.push('transicionesEstadoReporte__opcion--seleccionada');
  }

  if (!disponible && estado !== estadoActual) {
    clases.push('transicionesEstadoReporte__opcion--bloqueada');
  }

  return clases.join(' ');
}

export function TransicionesEstadoReporte({
  estadoActual,
  estadoSeleccionado,
  bloqueado = false,
  alCambiarEstado
}: PropiedadesTransicionesEstadoReporte) {
  const estadosPermitidos = obtenerEstadosPermitidosReporte(estadoActual);
  const tieneTransiciones = estadosPermitidos.length > 0;

  return (
    <div className="transicionesEstadoReporte">
      <div className="transicionesEstadoReporte__actual">
        <span>Estado actual</span>
        <strong>{obtenerEtiquetaEstadoOperativo(estadoActual)}</strong>
        <p>{recomendacionesTransicion[estadoActual]}</p>
      </div>

      <div className="transicionesEstadoReporte__lista" role="list">
        {estadosOperativos.map((estado) => {
          const esActual = estado === estadoActual;
          const disponible = puedeCambiarEstadoReporte(estadoActual, estado);
          const seleccionable = disponible && !esActual && !bloqueado;

          return (
            <button
              type="button"
              key={estado}
              className={obtenerClaseEstado(
                estado,
                estadoActual,
                estadoSeleccionado,
                disponible
              )}
              disabled={!seleccionable}
              onClick={() => alCambiarEstado(estado)}
            >
              <span>{obtenerEtiquetaEstadoOperativo(estado)}</span>
              <strong>
                {esActual
                  ? 'Estado actual'
                  : disponible
                    ? 'Cambio permitido'
                    : 'Cambio no directo'}
              </strong>
              <small>{descripcionesEstado[estado]}</small>
            </button>
          );
        })}
      </div>

      {!tieneTransiciones ? (
        <div className="transicionesEstadoReporte__sinTransiciones">
          <strong>Sin cambios directos disponibles</strong>
          <p>Este estado no permite una transición operativa inmediata desde esta pantalla.</p>
        </div>
      ) : null}
    </div>
  );
}