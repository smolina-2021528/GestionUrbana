import { EstadoVacio } from '../../../shared/components/data/EstadoVacio';
import { Alerta } from '../../../shared/components/feedback/Alerta';
import { Cargando } from '../../../shared/components/feedback/Cargando';
import { Boton } from '../../../shared/components/ui/Boton';
import { Tarjeta } from '../../../shared/components/ui/Tarjeta';
import { esErrorApi } from '../../../shared/types/errorApi';
import { usarHistorialReporte } from '../hooks/usarHistorialReporte';
import type { HistorialEstadoReporte, UsuarioResumenReporte } from '../types/reportesTipos';
import './interaccionesReporte.css';

type PropiedadesHistorialReporte = {
  reporteId: string;
};

const etiquetasEstado: Record<string, string> = {
  PENDIENTE: 'Pendiente',
  EN_PROCESO: 'En proceso',
  RESUELTO: 'Resuelto',
  RECHAZADO: 'Rechazado'
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

function obtenerEtiquetaEstado(estado: string | null | undefined) {
  if (!estado) {
    return 'Sin estado previo';
  }

  return etiquetasEstado[estado] ?? estado.replaceAll('_', ' ').toLowerCase();
}

function obtenerNombreUsuario(usuario: UsuarioResumenReporte | null) {
  if (!usuario) {
    return 'Sistema';
  }

  const nombreCompleto = [usuario.name, usuario.surname].filter(Boolean).join(' ').trim();

  return nombreCompleto || usuario.username || 'Usuario';
}

function obtenerMensajeError(error: unknown) {
  if (esErrorApi(error)) {
    return error.mensaje;
  }

  return 'No fue posible cargar el historial del reporte. Intenta nuevamente.';
}

function obtenerMensajeRespuestaFallida(mensaje?: string, error?: string) {
  return mensaje ?? error ?? 'No fue posible cargar el historial del reporte.';
}

function ordenarHistorial(historial: HistorialEstadoReporte[]) {
  return [...historial].sort((a, b) => {
    const fechaA = new Date(a.createdAt).getTime();
    const fechaB = new Date(b.createdAt).getTime();

    return fechaB - fechaA;
  });
}

export function HistorialReporte({ reporteId }: PropiedadesHistorialReporte) {
  const consultaHistorial = usarHistorialReporte(reporteId);

  const respuestaHistorial = consultaHistorial.data;
  const historial =
    respuestaHistorial?.success === true ? ordenarHistorial(respuestaHistorial.data ?? []) : [];

  const mensajeRespuestaFallida =
    respuestaHistorial?.success === false
      ? obtenerMensajeRespuestaFallida(respuestaHistorial.message, respuestaHistorial.error)
      : undefined;

  const mensajeError =
    consultaHistorial.error !== null
      ? obtenerMensajeError(consultaHistorial.error)
      : mensajeRespuestaFallida;

  const refrescarHistorial = () => {
    void consultaHistorial.refetch();
  };

  return (
    <Tarjeta
      titulo="Historial"
      descripcion="Cambios registrados durante la atención del reporte."
      acciones={
        <Boton
          variante="fantasma"
          tamano="sm"
          disabled={consultaHistorial.isFetching}
          onClick={refrescarHistorial}
        >
          {consultaHistorial.isFetching ? 'Actualizando...' : 'Actualizar'}
        </Boton>
      }
    >
      <section className="historialReporte" aria-label="Historial del reporte">
        {mensajeError ? (
          <Alerta variante="error" titulo="No se pudo cargar el historial">
            <div className="historialReporte__alerta">
              <p>{mensajeError}</p>

              <Boton variante="secundario" tamano="sm" onClick={refrescarHistorial}>
                Reintentar
              </Boton>
            </div>
          </Alerta>
        ) : null}

        {consultaHistorial.isLoading ? (
          <div className="historialReporte__estado">
            <Cargando texto="Cargando historial..." compacto />
          </div>
        ) : null}

        {!consultaHistorial.isLoading && !mensajeError && historial.length === 0 ? (
          <EstadoVacio
            titulo="Sin cambios registrados"
            descripcion="Este reporte aún no tiene movimientos operativos en su historial."
          />
        ) : null}

        {!consultaHistorial.isLoading && historial.length > 0 ? (
          <ol className="historialReporte__lista">
            {historial.map((evento) => (
              <li key={evento.id} className="historialReporte__item">
                <span className="historialReporte__marca" aria-hidden="true" />

                <div className="historialReporte__contenido">
                  <div className="historialReporte__encabezado">
                    <div>
                      <strong>
                        {obtenerEtiquetaEstado(evento.previousStatus)} →{' '}
                        {obtenerEtiquetaEstado(evento.newStatus)}
                      </strong>
                      <span>Registrado por {obtenerNombreUsuario(evento.changedBy)}</span>
                    </div>

                    <time dateTime={evento.createdAt}>{formatearFecha(evento.createdAt)}</time>
                  </div>

                  {evento.notes ? <p>{evento.notes}</p> : null}
                </div>
              </li>
            ))}
          </ol>
        ) : null}
      </section>
    </Tarjeta>
  );
}