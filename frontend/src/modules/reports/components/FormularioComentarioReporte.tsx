import type { FormEvent } from 'react';
import { useState } from 'react';

import { Alerta } from '../../../shared/components/feedback/Alerta';
import { Boton } from '../../../shared/components/ui/Boton';
import { usarPermisos } from '../../../shared/hooks/usarPermisos';
import { esErrorApi } from '../../../shared/types/errorApi';
import { usarCrearComentarioReporte } from '../hooks/usarCrearComentarioReporte';
import './interaccionesReporte.css';

type PropiedadesFormularioComentarioReporte = {
  reporteId: string;
  alComentarioCreado?: () => void;
};

function limpiarTexto(valor: string) {
  return valor.trim();
}

function obtenerMensajeError(error: unknown) {
  if (esErrorApi(error)) {
    return error.mensaje;
  }

  return 'No fue posible publicar el comentario. Intenta nuevamente.';
}

export function FormularioComentarioReporte({
  reporteId,
  alComentarioCreado
}: PropiedadesFormularioComentarioReporte) {
  const { esAdministrador } = usarPermisos();
  const crearComentario = usarCrearComentarioReporte();

  const [contenido, setContenido] = useState('');
  const [esInterno, setEsInterno] = useState(false);
  const [mensajeError, setMensajeError] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  const publicando = crearComentario.isPending;

  const limpiarMensajes = () => {
    setMensajeError(null);
    setMensajeExito(null);
  };

  const manejarEnvio = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    limpiarMensajes();

    const comentario = limpiarTexto(contenido);

    if (!comentario) {
      setMensajeError('Escribe un comentario antes de publicarlo.');
      return;
    }

    try {
      const respuesta = await crearComentario.mutateAsync({
        reporteId,
        datos: {
          content: comentario,
          ...(esAdministrador ? { isInternal: esInterno } : {})
        }
      });

      if (respuesta.success === false) {
        setMensajeError(
          respuesta.message ?? respuesta.error ?? 'No fue posible publicar el comentario.'
        );
        return;
      }

      setContenido('');
      setEsInterno(false);
      setMensajeExito(respuesta.message ?? 'Comentario publicado correctamente.');
      alComentarioCreado?.();
    } catch (error) {
      setMensajeError(obtenerMensajeError(error));
    }
  };

  return (
    <form className="formularioComentario" onSubmit={manejarEnvio}>
      <div className="formularioComentario__encabezado">
        <h3>Agregar comentario</h3>
        <p>Comparte información útil para el seguimiento del reporte.</p>
      </div>

      {mensajeError ? (
        <Alerta variante="error" titulo="No se pudo publicar">
          <p>{mensajeError}</p>
        </Alerta>
      ) : null}

      {mensajeExito ? (
        <Alerta variante="exito" titulo="Comentario registrado">
          <p>{mensajeExito}</p>
        </Alerta>
      ) : null}

      <label className="formularioComentario__campo">
        <span>Comentario</span>
        <textarea
          value={contenido}
          maxLength={1000}
          placeholder="Escribe una actualización, aclaración o información adicional sobre el reporte."
          disabled={publicando}
          onChange={(evento) => {
            setContenido(evento.target.value);
            if (mensajeError || mensajeExito) {
              limpiarMensajes();
            }
          }}
        />
      </label>

      <div className="formularioComentario__pie">
        {esAdministrador ? (
          <label className="formularioComentario__opcion">
            <input
              type="checkbox"
              checked={esInterno}
              disabled={publicando}
              onChange={(evento) => setEsInterno(evento.target.checked)}
            />
            <span>Comentario interno</span>
          </label>
        ) : (
          <span className="formularioComentario__nota">
            Tu comentario quedará asociado a este reporte.
          </span>
        )}

        <Boton type="submit" disabled={publicando}>
          {publicando ? 'Publicando...' : 'Publicar comentario'}
        </Boton>
      </div>
    </form>
  );
}