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

const LIMITE_CARACTERES_COMENTARIO = 1000;

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
  const comentarioLimpio = limpiarTexto(contenido);
  const puedePublicar = comentarioLimpio.length > 0 && !publicando;
  const caracteresRestantes = LIMITE_CARACTERES_COMENTARIO - contenido.length;

  const limpiarMensajes = () => {
    setMensajeError(null);
    setMensajeExito(null);
  };

  const manejarEnvio = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    limpiarMensajes();

    if (!comentarioLimpio) {
      setMensajeError('Escribe un comentario antes de publicarlo.');
      return;
    }

    try {
      const respuesta = await crearComentario.mutateAsync({
        reporteId,
        datos: {
          content: comentarioLimpio,
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
          maxLength={LIMITE_CARACTERES_COMENTARIO}
          placeholder="Escribe una actualización, aclaración o información adicional sobre el reporte."
          disabled={publicando}
          aria-describedby="ayuda-comentario-reporte"
          onChange={(evento) => {
            setContenido(evento.target.value);
            if (mensajeError || mensajeExito) {
              limpiarMensajes();
            }
          }}
        />
      </label>

      <div id="ayuda-comentario-reporte" className="formularioComentario__estadoTexto">
        <span>
          {comentarioLimpio.length > 0
            ? 'El comentario se publicará en este reporte.'
            : 'Escribe al menos un carácter para publicar.'}
        </span>

        <span
          className={
            caracteresRestantes <= 100
              ? 'formularioComentario__contador formularioComentario__contador--alerta'
              : 'formularioComentario__contador'
          }
        >
          {caracteresRestantes} caracteres disponibles
        </span>
      </div>

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

        <Boton type="submit" disabled={!puedePublicar}>
          {publicando ? 'Publicando...' : 'Publicar comentario'}
        </Boton>
      </div>
    </form>
  );
}