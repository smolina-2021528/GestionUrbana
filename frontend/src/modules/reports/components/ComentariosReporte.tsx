import { useMemo, useState } from 'react';

import { EstadoVacio } from '../../../shared/components/data/EstadoVacio';
import { Alerta } from '../../../shared/components/feedback/Alerta';
import { Cargando } from '../../../shared/components/feedback/Cargando';
import { Boton } from '../../../shared/components/ui/Boton';
import { Tarjeta } from '../../../shared/components/ui/Tarjeta';
import { usarPermisos } from '../../../shared/hooks/usarPermisos';
import { esErrorApi } from '../../../shared/types/errorApi';
import { usarAutenticacion } from '../../authentication/hooks/usarAutenticacion';
import { usarComentariosReporte } from '../hooks/usarComentariosReporte';
import { usarEliminarComentarioReporte } from '../hooks/usarEliminarComentarioReporte';
import type { ComentarioReporte } from '../types/interaccionesReporteTipos';
import type { UsuarioResumenReporte } from '../types/reportesTipos';
import { FormularioComentarioReporte } from './FormularioComentarioReporte';
import './interaccionesReporte.css';

type PropiedadesComentariosReporte = {
  reporteId: string;
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

function obtenerNombreUsuario(usuario: UsuarioResumenReporte | null) {
  if (!usuario) {
    return 'Usuario no disponible';
  }

  const nombreCompleto = [usuario.name, usuario.surname].filter(Boolean).join(' ').trim();

  return nombreCompleto || usuario.username || 'Usuario';
}

function obtenerMensajeError(error: unknown) {
  if (esErrorApi(error)) {
    return error.mensaje;
  }

  return 'No fue posible completar la acción. Intenta nuevamente.';
}

function obtenerMensajeRespuestaFallida(mensaje?: string, error?: string) {
  return mensaje ?? error ?? 'No fue posible cargar los comentarios del reporte.';
}

export function ComentariosReporte({ reporteId }: PropiedadesComentariosReporte) {
  const { usuario } = usarAutenticacion();
  const { esAdministrador } = usarPermisos();
  const eliminarComentario = usarEliminarComentarioReporte();

  const [mensajeErrorAccion, setMensajeErrorAccion] = useState<string | null>(null);
  const [mensajeExitoAccion, setMensajeExitoAccion] = useState<string | null>(null);

  const filtrosComentarios = useMemo(
    () => ({
      page: 1,
      limit: 50,
      includeInternal: esAdministrador
    }),
    [esAdministrador]
  );

  const consultaComentarios = usarComentariosReporte(reporteId, filtrosComentarios);

  const respuestaComentarios = consultaComentarios.data;
  const comentarios =
    respuestaComentarios?.success === true ? respuestaComentarios.data ?? [] : [];

  const mensajeRespuestaFallida =
    respuestaComentarios?.success === false
      ? obtenerMensajeRespuestaFallida(respuestaComentarios.message, respuestaComentarios.error)
      : undefined;

  const mensajeErrorConsulta =
    consultaComentarios.error !== null
      ? obtenerMensajeError(consultaComentarios.error)
      : mensajeRespuestaFallida;

  const puedeEliminarComentario = (comentario: ComentarioReporte) =>
    esAdministrador || comentario.author?.id === usuario?.id;

  const refrescarComentarios = () => {
    void consultaComentarios.refetch();
  };

  const limpiarMensajesAccion = () => {
    setMensajeErrorAccion(null);
    setMensajeExitoAccion(null);
  };

  const manejarEliminarComentario = async (comentario: ComentarioReporte) => {
    limpiarMensajesAccion();

    const confirmado = window.confirm('¿Deseas eliminar este comentario?');

    if (!confirmado) {
      return;
    }

    try {
      const respuesta = await eliminarComentario.mutateAsync({
        reporteId,
        comentarioId: comentario.id
      });

      if (respuesta.success === false) {
        setMensajeErrorAccion(
          respuesta.message ?? respuesta.error ?? 'No fue posible eliminar el comentario.'
        );
        return;
      }

      setMensajeExitoAccion(respuesta.message ?? 'Comentario eliminado correctamente.');
    } catch (error) {
      setMensajeErrorAccion(obtenerMensajeError(error));
    }
  };

  return (
    <Tarjeta
      titulo="Comentarios"
      descripcion="Comunicación y actualizaciones asociadas al reporte."
      acciones={
        <Boton
          variante="fantasma"
          tamano="sm"
          disabled={consultaComentarios.isFetching}
          onClick={refrescarComentarios}
        >
          {consultaComentarios.isFetching ? 'Actualizando...' : 'Actualizar'}
        </Boton>
      }
    >
      <section className="comentariosReporte" aria-label="Comentarios del reporte">
        <FormularioComentarioReporte
          reporteId={reporteId}
          alComentarioCreado={refrescarComentarios}
        />

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

        {mensajeErrorConsulta ? (
          <Alerta variante="error" titulo="No se pudieron cargar los comentarios">
            <div className="comentariosReporte__alerta">
              <p>{mensajeErrorConsulta}</p>

              <Boton variante="secundario" tamano="sm" onClick={refrescarComentarios}>
                Reintentar
              </Boton>
            </div>
          </Alerta>
        ) : null}

        {consultaComentarios.isLoading ? (
          <div className="comentariosReporte__estado">
            <Cargando texto="Cargando comentarios..." compacto />
          </div>
        ) : null}

        {!consultaComentarios.isLoading && !mensajeErrorConsulta && comentarios.length === 0 ? (
          <EstadoVacio
            titulo="Sin comentarios registrados"
            descripcion="Aún no hay comentarios asociados a este reporte."
          />
        ) : null}

        {!consultaComentarios.isLoading && comentarios.length > 0 ? (
          <div className="comentariosReporte__lista">
            {comentarios.map((comentario) => (
              <article
                key={comentario.id}
                className={
                  comentario.isInternal
                    ? 'comentarioReporte comentarioReporte--interno'
                    : 'comentarioReporte'
                }
              >
                <header className="comentarioReporte__encabezado">
                  <div>
                    <strong>{obtenerNombreUsuario(comentario.author)}</strong>
                    <time dateTime={comentario.createdAt}>{formatearFecha(comentario.createdAt)}</time>
                  </div>

                  <div className="comentarioReporte__acciones">
                    {comentario.isInternal ? (
                      <span className="comentarioReporte__etiqueta">Interno</span>
                    ) : null}

                    {puedeEliminarComentario(comentario) ? (
                      <Boton
                        variante="fantasma"
                        tamano="sm"
                        disabled={eliminarComentario.isPending}
                        onClick={() => manejarEliminarComentario(comentario)}
                      >
                        Eliminar
                      </Boton>
                    ) : null}
                  </div>
                </header>

                <p className="comentarioReporte__contenido">{comentario.content}</p>
              </article>
            ))}
          </div>
        ) : null}
      </section>
    </Tarjeta>
  );
}