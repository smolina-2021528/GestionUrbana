import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { rutasAplicacion } from '../../../config/constantesSistema';
import { textosSistema } from '../../../design/identity/textosSistema';
import { Alerta } from '../../../shared/components/feedback/Alerta';
import { Boton } from '../../../shared/components/ui/Boton';
import { Tarjeta } from '../../../shared/components/ui/Tarjeta';
import { esErrorApi } from '../../../shared/types/errorApi';
import { ListadoNotificaciones } from '../components/ListadoNotificaciones';
import type { TipoAccionNotificacion } from '../components/TarjetaNotificacion';
import { usarEliminarNotificacion } from '../hooks/usarEliminarNotificacion';
import { usarMarcarNotificacionLeida } from '../hooks/usarMarcarNotificacionLeida';
import { usarMarcarTodasNotificacionesLeidas } from '../hooks/usarMarcarTodasNotificacionesLeidas';
import { usarNotificaciones } from '../hooks/usarNotificaciones';
import type { FiltrosNotificaciones, NotificacionReporte } from '../types/notificacionesTipos';
import './notificacionesPagina.css';

const filtrosIniciales: FiltrosNotificaciones = {
  page: 1,
  limit: 10
};

type AccionEnProceso = {
  id: string;
  tipo: TipoAccionNotificacion;
};

function obtenerMensajeError(error: unknown) {
  if (esErrorApi(error)) {
    return error.mensaje;
  }

  return 'No fue posible completar la acción. Intenta nuevamente.';
}

function obtenerMensajeRespuestaFallida(mensaje?: string, error?: string) {
  return mensaje ?? error ?? 'No fue posible cargar las notificaciones. Intenta nuevamente.';
}

export function NotificacionesPagina() {
  const navigate = useNavigate();

  const [filtros, setFiltros] = useState<FiltrosNotificaciones>(filtrosIniciales);
  const [accionEnProceso, setAccionEnProceso] = useState<AccionEnProceso | null>(null);
  const [mensajeErrorAccion, setMensajeErrorAccion] = useState<string | null>(null);
  const [mensajeExitoAccion, setMensajeExitoAccion] = useState<string | null>(null);

  const consultaNotificaciones = usarNotificaciones(filtros);
  const marcarNotificacionLeida = usarMarcarNotificacionLeida();
  const marcarTodasLeidas = usarMarcarTodasNotificacionesLeidas();
  const eliminarNotificacion = usarEliminarNotificacion();

  const respuestaNotificaciones = consultaNotificaciones.data;
  const notificaciones =
    respuestaNotificaciones?.success === true ? respuestaNotificaciones.data ?? [] : [];
  const paginacion =
    respuestaNotificaciones?.success === true ? respuestaNotificaciones.pagination : undefined;
  const totalNoLeidas =
    respuestaNotificaciones?.success === true
      ? respuestaNotificaciones.unreadCount ?? notificaciones.filter((item) => !item.isRead).length
      : 0;

  const mensajeRespuestaFallida =
    respuestaNotificaciones?.success === false
      ? obtenerMensajeRespuestaFallida(
          respuestaNotificaciones.message,
          respuestaNotificaciones.error
        )
      : undefined;

  const mensajeErrorConsulta =
    consultaNotificaciones.error !== null
      ? obtenerMensajeError(consultaNotificaciones.error)
      : mensajeRespuestaFallida;

  const estaCargando = consultaNotificaciones.isLoading;
  const estaActualizando = consultaNotificaciones.isFetching && !consultaNotificaciones.isLoading;
  const accionesBloqueadas =
    Boolean(accionEnProceso) ||
    marcarNotificacionLeida.isPending ||
    marcarTodasLeidas.isPending ||
    eliminarNotificacion.isPending;

  const paginaActual = paginacion?.page ?? filtros.page ?? 1;
  const totalPaginas = paginacion?.totalPages ?? 1;
  const totalRegistros = paginacion?.total ?? notificaciones.length;
  const puedeIrAnterior = paginaActual > 1;
  const puedeIrSiguiente = paginaActual < totalPaginas;
  const mostrandoSoloNoLeidas = filtros.onlyUnread === true;

  const limpiarMensajesAccion = () => {
    setMensajeErrorAccion(null);
    setMensajeExitoAccion(null);
  };

  const actualizarNotificaciones = () => {
    limpiarMensajesAccion();
    void consultaNotificaciones.refetch();
  };

  const mostrarTodas = () => {
    limpiarMensajesAccion();
    setFiltros({
      ...filtrosIniciales,
      page: 1
    });
  };

  const mostrarNoLeidas = () => {
    limpiarMensajesAccion();
    setFiltros({
      ...filtrosIniciales,
      page: 1,
      onlyUnread: true
    });
  };

  const irPaginaAnterior = () => {
    if (!puedeIrAnterior) {
      return;
    }

    limpiarMensajesAccion();
    setFiltros((filtrosActuales) => ({
      ...filtrosActuales,
      page: Math.max((filtrosActuales.page ?? 1) - 1, 1)
    }));
  };

  const irPaginaSiguiente = () => {
    if (!puedeIrSiguiente) {
      return;
    }

    limpiarMensajesAccion();
    setFiltros((filtrosActuales) => ({
      ...filtrosActuales,
      page: (filtrosActuales.page ?? 1) + 1
    }));
  };

  const irAReporte = (reporteId: string) => {
    limpiarMensajesAccion();
    navigate(`${rutasAplicacion.reportes}/${encodeURIComponent(reporteId)}`);
  };

  const manejarMarcarLeida = async (notificacion: NotificacionReporte) => {
    if (notificacion.isRead) {
      return;
    }

    limpiarMensajesAccion();
    setAccionEnProceso({
      id: notificacion.id,
      tipo: 'leer'
    });

    try {
      const respuesta = await marcarNotificacionLeida.mutateAsync(notificacion.id);

      if (respuesta.success === false) {
        setMensajeErrorAccion(
          respuesta.message ?? respuesta.error ?? 'No fue posible marcar la notificación como leída.'
        );
        return;
      }

      setMensajeExitoAccion(respuesta.message ?? 'Notificación marcada como leída.');
    } catch (error) {
      setMensajeErrorAccion(obtenerMensajeError(error));
    } finally {
      setAccionEnProceso(null);
    }
  };

  const manejarMarcarTodasLeidas = async () => {
    if (totalNoLeidas === 0) {
      return;
    }

    limpiarMensajesAccion();

    try {
      const respuesta = await marcarTodasLeidas.mutateAsync();

      if (respuesta.success === false) {
        setMensajeErrorAccion(
          respuesta.message ?? respuesta.error ?? 'No fue posible marcar todas como leídas.'
        );
        return;
      }

      setFiltros((filtrosActuales) => ({
        ...filtrosActuales,
        page: 1
      }));

      setMensajeExitoAccion(
        respuesta.message ?? 'Todas las notificaciones fueron marcadas como leídas.'
      );
    } catch (error) {
      setMensajeErrorAccion(obtenerMensajeError(error));
    }
  };

  const manejarEliminar = async (notificacion: NotificacionReporte) => {
    limpiarMensajesAccion();

    const confirmado = window.confirm('¿Deseas eliminar esta notificación?');

    if (!confirmado) {
      return;
    }

    setAccionEnProceso({
      id: notificacion.id,
      tipo: 'eliminar'
    });

    try {
      const respuesta = await eliminarNotificacion.mutateAsync(notificacion.id);

      if (respuesta.success === false) {
        setMensajeErrorAccion(
          respuesta.message ?? respuesta.error ?? 'No fue posible eliminar la notificación.'
        );
        return;
      }

      setMensajeExitoAccion(respuesta.message ?? 'Notificación eliminada correctamente.');
    } catch (error) {
      setMensajeErrorAccion(obtenerMensajeError(error));
    } finally {
      setAccionEnProceso(null);
    }
  };

  return (
    <main className="paginaTemporal notificacionesPagina">
      <section className="notificacionesPagina__encabezado">
        <div>
          <span className="etiquetaInicial">Centro de avisos</span>
          <h1>{textosSistema.navegacion.notificaciones}</h1>
          <p>Consulta actualizaciones sobre reportes, asignaciones y cambios de estado.</p>
        </div>

        <div className="notificacionesPagina__accionesEncabezado">
          <Boton
            variante="fantasma"
            disabled={consultaNotificaciones.isFetching}
            onClick={actualizarNotificaciones}
          >
            {consultaNotificaciones.isFetching ? 'Actualizando...' : 'Actualizar'}
          </Boton>

          <Boton
            variante="primario"
            disabled={totalNoLeidas === 0 || accionesBloqueadas}
            onClick={manejarMarcarTodasLeidas}
          >
            {marcarTodasLeidas.isPending ? 'Marcando...' : 'Marcar todas como leídas'}
          </Boton>
        </div>
      </section>

      <section className="notificacionesPagina__resumen">
        <Tarjeta>
          <div className="notificacionesPagina__indicador">
            <span>No leídas</span>
            <strong>{totalNoLeidas}</strong>
          </div>
        </Tarjeta>

        <Tarjeta>
          <div className="notificacionesPagina__indicador">
            <span>Total mostrado</span>
            <strong>{notificaciones.length}</strong>
          </div>
        </Tarjeta>

        <Tarjeta>
          <div className="notificacionesPagina__indicador">
            <span>Registros</span>
            <strong>{totalRegistros}</strong>
          </div>
        </Tarjeta>
      </section>

      <Tarjeta titulo="Filtros" descripcion="Selecciona qué avisos deseas revisar.">
        <div className="notificacionesPagina__filtros">
          <div className="notificacionesPagina__grupoFiltros">
            <Boton
              variante={mostrandoSoloNoLeidas ? 'secundario' : 'primario'}
              disabled={consultaNotificaciones.isFetching}
              onClick={mostrarTodas}
            >
              Todas
            </Boton>

            <Boton
              variante={mostrandoSoloNoLeidas ? 'primario' : 'secundario'}
              disabled={consultaNotificaciones.isFetching}
              onClick={mostrarNoLeidas}
            >
              No leídas
            </Boton>
          </div>

          <p className="notificacionesPagina__descripcionFiltro">
            {mostrandoSoloNoLeidas
              ? 'Mostrando únicamente avisos que aún no han sido leídos.'
              : 'Mostrando todos los avisos disponibles para tu usuario.'}
          </p>
        </div>
      </Tarjeta>

      {mensajeErrorAccion ? (
        <Alerta variante="error" titulo="No se pudo completar la acción">
          <p>{mensajeErrorAccion}</p>
        </Alerta>
      ) : null}

      {mensajeExitoAccion ? (
        <Alerta variante="exito" titulo="Acción completada">
          <p>{mensajeExitoAccion}</p>
        </Alerta>
      ) : null}

      <Tarjeta
        titulo="Notificaciones"
        descripcion="Avisos relacionados con actividad y seguimiento de reportes."
      >
        <ListadoNotificaciones
          notificaciones={notificaciones}
          cargando={estaCargando}
          actualizando={estaActualizando}
          mensajeError={mensajeErrorConsulta}
          accionesBloqueadas={accionesBloqueadas}
          accionEnProcesoId={accionEnProceso?.id}
          tipoAccionEnProceso={accionEnProceso?.tipo}
          alReintentar={actualizarNotificaciones}
          alVerReporte={irAReporte}
          alMarcarLeida={manejarMarcarLeida}
          alEliminar={manejarEliminar}
        />
      </Tarjeta>

      {totalPaginas > 1 ? (
        <Tarjeta className="notificacionesPagina__paginacion">
          <div className="notificacionesPagina__paginacionContenido">
            <div>
              <span className="notificacionesPagina__paginacionEtiqueta">Página actual</span>
              <strong>
                {paginaActual} de {totalPaginas}
              </strong>
            </div>

            <div className="notificacionesPagina__paginacionAcciones">
              <Boton
                variante="secundario"
                disabled={!puedeIrAnterior || consultaNotificaciones.isFetching}
                onClick={irPaginaAnterior}
              >
                Anterior
              </Boton>

              <Boton
                variante="secundario"
                disabled={!puedeIrSiguiente || consultaNotificaciones.isFetching}
                onClick={irPaginaSiguiente}
              >
                Siguiente
              </Boton>
            </div>
          </div>
        </Tarjeta>
      ) : null}
    </main>
  );
}