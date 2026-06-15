import { EstadoVacio } from '../../../shared/components/data/EstadoVacio';
import { Alerta } from '../../../shared/components/feedback/Alerta';
import { Cargando } from '../../../shared/components/feedback/Cargando';
import { Boton } from '../../../shared/components/ui/Boton';
import type { NotificacionReporte } from '../types/notificacionesTipos';
import {
  TarjetaNotificacion,
  type TipoAccionNotificacion
} from './TarjetaNotificacion';
import './notificacionesComponentes.css';

type PropiedadesListadoNotificaciones = {
  notificaciones: NotificacionReporte[];
  cargando: boolean;
  actualizando: boolean;
  mensajeError?: string;
  accionesBloqueadas?: boolean;
  accionEnProcesoId?: string | null;
  tipoAccionEnProceso?: TipoAccionNotificacion | null;
  alReintentar: () => void;
  alVerReporte: (reporteId: string) => void;
  alMarcarLeida: (notificacion: NotificacionReporte) => void;
  alEliminar: (notificacion: NotificacionReporte) => void;
};

export function ListadoNotificaciones({
  notificaciones,
  cargando,
  actualizando,
  mensajeError,
  accionesBloqueadas = false,
  accionEnProcesoId,
  tipoAccionEnProceso,
  alReintentar,
  alVerReporte,
  alMarcarLeida,
  alEliminar
}: PropiedadesListadoNotificaciones) {
  if (cargando) {
    return (
      <div className="listadoNotificaciones__estado">
        <Cargando texto="Cargando notificaciones..." />
      </div>
    );
  }

  if (mensajeError) {
    return (
      <Alerta variante="error" titulo="No se pudieron cargar las notificaciones">
        <div className="listadoNotificaciones__alerta">
          <p>{mensajeError}</p>

          <Boton variante="secundario" tamano="sm" onClick={alReintentar}>
            Reintentar
          </Boton>
        </div>
      </Alerta>
    );
  }

  if (notificaciones.length === 0) {
    return (
      <EstadoVacio
        titulo="Sin notificaciones"
        descripcion="Cuando existan avisos nuevos, aparecerán ordenados por fecha en esta sección."
      />
    );
  }

  return (
    <section className="listadoNotificaciones" aria-label="Listado de notificaciones">
      {actualizando ? (
        <div className="listadoNotificaciones__actualizando">
          Actualizando información...
        </div>
      ) : null}

      <div className="listadoNotificaciones__lista">
        {notificaciones.map((notificacion) => (
          <TarjetaNotificacion
            key={notificacion.id}
            notificacion={notificacion}
            accionesBloqueadas={accionesBloqueadas}
            accionEnProcesoId={accionEnProcesoId}
            tipoAccionEnProceso={tipoAccionEnProceso}
            alVerReporte={alVerReporte}
            alMarcarLeida={alMarcarLeida}
            alEliminar={alEliminar}
          />
        ))}
      </div>
    </section>
  );
}