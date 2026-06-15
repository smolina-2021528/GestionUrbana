import { Boton } from '../../../shared/components/ui/Boton';
import type { NotificacionReporte } from '../types/notificacionesTipos';
import './notificacionesComponentes.css';

export type TipoAccionNotificacion = 'leer' | 'eliminar';

type PropiedadesTarjetaNotificacion = {
  notificacion: NotificacionReporte;
  accionesBloqueadas?: boolean;
  accionEnProcesoId?: string | null;
  tipoAccionEnProceso?: TipoAccionNotificacion | null;
  alVerReporte: (reporteId: string) => void;
  alMarcarLeida: (notificacion: NotificacionReporte) => void;
  alEliminar: (notificacion: NotificacionReporte) => void;
};

const etiquetasTipoNotificacion: Record<string, string> = {
  STATUS_CHANGED: 'Cambio de estado',
  NEW_COMMENT: 'Nuevo comentario',
  REPORT_ASSIGNED: 'Asignación'
};

function formatearFecha(fecha: string | null | undefined) {
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

function obtenerEtiquetaTipo(tipo: string) {
  return etiquetasTipoNotificacion[tipo] ?? 'Actualización';
}

export function TarjetaNotificacion({
  notificacion,
  accionesBloqueadas = false,
  accionEnProcesoId,
  tipoAccionEnProceso,
  alVerReporte,
  alMarcarLeida,
  alEliminar
}: PropiedadesTarjetaNotificacion) {
  const reporteId = notificacion.report?.id;
  const estaMarcandoLeida =
    accionEnProcesoId === notificacion.id && tipoAccionEnProceso === 'leer';
  const estaEliminando =
    accionEnProcesoId === notificacion.id && tipoAccionEnProceso === 'eliminar';

  return (
    <article
      className={
        notificacion.isRead
          ? 'tarjetaNotificacion tarjetaNotificacion--leida'
          : 'tarjetaNotificacion'
      }
    >
      <div className="tarjetaNotificacion__contenido">
        <div className="tarjetaNotificacion__encabezado">
          <div>
            <span className="tarjetaNotificacion__tipo">
              {obtenerEtiquetaTipo(notificacion.type)}
            </span>
            <h3>{notificacion.message}</h3>
          </div>

          <span
            className={
              notificacion.isRead
                ? 'tarjetaNotificacion__estado tarjetaNotificacion__estado--leida'
                : 'tarjetaNotificacion__estado'
            }
          >
            {notificacion.isRead ? 'Leída' : 'No leída'}
          </span>
        </div>

        <div className="tarjetaNotificacion__meta">
          <time dateTime={notificacion.createdAt}>{formatearFecha(notificacion.createdAt)}</time>

          {notificacion.report ? (
            <span>Reporte: {notificacion.report.title}</span>
          ) : (
            <span>Sin reporte asociado</span>
          )}
        </div>
      </div>

      <div className="tarjetaNotificacion__acciones">
        {reporteId ? (
          <Boton
            variante="secundario"
            tamano="sm"
            disabled={accionesBloqueadas}
            onClick={() => alVerReporte(reporteId)}
          >
            Ver reporte
          </Boton>
        ) : null}

        {!notificacion.isRead ? (
          <Boton
            variante="fantasma"
            tamano="sm"
            disabled={accionesBloqueadas || estaMarcandoLeida}
            onClick={() => alMarcarLeida(notificacion)}
          >
            {estaMarcandoLeida ? 'Marcando...' : 'Marcar leída'}
          </Boton>
        ) : null}

        <Boton
          variante="peligro"
          tamano="sm"
          disabled={accionesBloqueadas || estaEliminando}
          onClick={() => alEliminar(notificacion)}
        >
          {estaEliminando ? 'Eliminando...' : 'Eliminar'}
        </Boton>
      </div>
    </article>
  );
}