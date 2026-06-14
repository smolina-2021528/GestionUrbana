import { useMemo, useState } from 'react';

import { Alerta } from '../../../shared/components/feedback/Alerta';
import { Cargando } from '../../../shared/components/feedback/Cargando';
import { Boton } from '../../../shared/components/ui/Boton';
import { Tarjeta } from '../../../shared/components/ui/Tarjeta';
import { esErrorApi } from '../../../shared/types/errorApi';
import { usarDejarDeSeguirReporte, usarSeguirReporte } from '../hooks/usarSeguimientoReporte';
import { usarReportesSeguidos } from '../hooks/usarReportesSeguidos';
import './interaccionesReporte.css';

type PropiedadesBotonSeguimientoReporte = {
  reporteId: string;
  tituloReporte: string;
  alCambioSeguimiento?: () => void;
};

function obtenerMensajeError(error: unknown) {
  if (esErrorApi(error)) {
    return error.mensaje;
  }

  return 'No fue posible actualizar el seguimiento del reporte. Intenta nuevamente.';
}

function obtenerMensajeRespuestaFallida(mensaje?: string, error?: string) {
  return mensaje ?? error ?? 'No fue posible consultar tus reportes seguidos.';
}

export function BotonSeguimientoReporte({
  reporteId,
  tituloReporte,
  alCambioSeguimiento
}: PropiedadesBotonSeguimientoReporte) {
  const seguirReporte = usarSeguirReporte();
  const dejarDeSeguirReporte = usarDejarDeSeguirReporte();

  const [mensajeError, setMensajeError] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  const filtrosReportesSeguidos = useMemo(
    () => ({
      page: 1,
      limit: 100
    }),
    []
  );

  const consultaReportesSeguidos = usarReportesSeguidos(filtrosReportesSeguidos);

  const respuestaReportesSeguidos = consultaReportesSeguidos.data;
  const reportesSeguidos =
    respuestaReportesSeguidos?.success === true ? respuestaReportesSeguidos.data ?? [] : [];

  const reporteSeguido = reportesSeguidos.some((reporte) => reporte.id === reporteId);

  const mensajeRespuestaFallida =
    respuestaReportesSeguidos?.success === false
      ? obtenerMensajeRespuestaFallida(
          respuestaReportesSeguidos.message,
          respuestaReportesSeguidos.error
        )
      : undefined;

  const mensajeErrorConsulta =
    consultaReportesSeguidos.error !== null
      ? obtenerMensajeError(consultaReportesSeguidos.error)
      : mensajeRespuestaFallida;

  const actualizandoSeguimiento = seguirReporte.isPending || dejarDeSeguirReporte.isPending;
  const cargandoEstado = consultaReportesSeguidos.isLoading || consultaReportesSeguidos.isFetching;

  const limpiarMensajes = () => {
    setMensajeError(null);
    setMensajeExito(null);
  };

  const refrescarSeguimiento = () => {
    void consultaReportesSeguidos.refetch();
  };

  const manejarSeguirReporte = async () => {
    limpiarMensajes();

    try {
      const respuesta = await seguirReporte.mutateAsync(reporteId);

      if (respuesta.success === false) {
        setMensajeError(
          respuesta.message ?? respuesta.error ?? 'No fue posible seguir este reporte.'
        );
        return;
      }

      setMensajeExito(respuesta.message ?? 'Ahora estás siguiendo este reporte.');
      alCambioSeguimiento?.();
      refrescarSeguimiento();
    } catch (error) {
      setMensajeError(obtenerMensajeError(error));
      refrescarSeguimiento();
    }
  };

  const manejarDejarDeSeguirReporte = async () => {
    limpiarMensajes();

    try {
      const respuesta = await dejarDeSeguirReporte.mutateAsync(reporteId);

      if (respuesta.success === false) {
        setMensajeError(
          respuesta.message ?? respuesta.error ?? 'No fue posible dejar de seguir este reporte.'
        );
        return;
      }

      setMensajeExito(respuesta.message ?? 'Dejaste de seguir este reporte.');
      alCambioSeguimiento?.();
      refrescarSeguimiento();
    } catch (error) {
      setMensajeError(obtenerMensajeError(error));
      refrescarSeguimiento();
    }
  };

  return (
    <Tarjeta
      titulo="Seguimiento del reporte"
      descripcion="Recibe actualizaciones relacionadas con esta incidencia urbana."
      acciones={
        <Boton
          variante={reporteSeguido ? 'secundario' : 'primario'}
          disabled={actualizandoSeguimiento || cargandoEstado}
          onClick={reporteSeguido ? manejarDejarDeSeguirReporte : manejarSeguirReporte}
        >
          {actualizandoSeguimiento
            ? 'Actualizando...'
            : reporteSeguido
              ? 'Dejar de seguir'
              : 'Seguir reporte'}
        </Boton>
      }
    >
      <section className="seguimientoReporte" aria-label="Seguimiento del reporte">
        {consultaReportesSeguidos.isLoading ? (
          <div className="seguimientoReporte__estado">
            <Cargando texto="Consultando seguimiento..." compacto />
          </div>
        ) : null}

        {!consultaReportesSeguidos.isLoading ? (
          <div className="seguimientoReporte__contenido">
            <div>
              <span className="seguimientoReporte__etiqueta">
                {reporteSeguido ? 'Reporte seguido' : 'Seguimiento disponible'}
              </span>

              <p>
                {reporteSeguido
                  ? `Actualmente estás siguiendo “${tituloReporte}”.`
                  : `Puedes seguir “${tituloReporte}” para mantenerlo dentro de tus reportes monitoreados.`}
              </p>
            </div>

            {mensajeErrorConsulta ? (
              <Alerta variante="advertencia" titulo="Seguimiento no actualizado">
                <div className="seguimientoReporte__alerta">
                  <p>{mensajeErrorConsulta}</p>

                  <Boton variante="secundario" tamano="sm" onClick={refrescarSeguimiento}>
                    Reintentar
                  </Boton>
                </div>
              </Alerta>
            ) : null}

            {mensajeError ? (
              <Alerta variante="error" titulo="No se pudo completar la acción">
                <p>{mensajeError}</p>
              </Alerta>
            ) : null}

            {mensajeExito ? (
              <Alerta variante="exito" titulo="Seguimiento actualizado">
                <p>{mensajeExito}</p>
              </Alerta>
            ) : null}
          </div>
        ) : null}
      </section>
    </Tarjeta>
  );
}