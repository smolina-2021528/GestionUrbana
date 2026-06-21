import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { rutasAplicacion } from '../../../config/constantesSistema';
import { Alerta } from '../../../shared/components/feedback/Alerta';
import { Boton } from '../../../shared/components/ui/Boton';
import { Tarjeta } from '../../../shared/components/ui/Tarjeta';
import { esErrorApi } from '../../../shared/types/errorApi';
import { usarVerificarDuplicadosReporte } from '../hooks/usarReportesIa';
import {
  limitesIaReportes,
  type ReporteConSimilitud,
  type RespuestaDuplicadosReporte
} from '../types/reportesIaTipos';
import type { CategoriaReporte, EstadoReporte, PrioridadReporte } from '../types/reportesTipos';
import './duplicadosReportePanel.css';

export type ResultadoRevisionDuplicados = {
  revisado: true;
  hayDuplicados: boolean;
  totalCandidatos: number;
};

type PropiedadesDuplicadosReportePanel = {
  titulo: string;
  descripcion: string;
  categoria: CategoriaReporte | '';
  latitude?: number | null;
  longitude?: number | null;
  bloqueado?: boolean;
  revisionVigente: boolean;
  alCompletarRevision: (resultado: ResultadoRevisionDuplicados) => void;
};

const etiquetasCategoria: Record<CategoriaReporte, string> = {
  INFRAESTRUCTURA: 'Infraestructura',
  SEGURIDAD: 'Seguridad',
  LIMPIEZA: 'Limpieza'
};

const etiquetasPrioridad: Record<PrioridadReporte, string> = {
  ALTA: 'Alta',
  MEDIA: 'Media',
  BAJA: 'Baja'
};

const etiquetasEstado: Record<EstadoReporte, string> = {
  PENDIENTE: 'Pendiente',
  EN_PROCESO: 'En proceso',
  RESUELTO: 'Resuelto',
  RECHAZADO: 'Rechazado'
};

function limpiarTexto(valor: string) {
  return valor.trim();
}

function obtenerMensajeError(error: unknown) {
  if (esErrorApi(error)) {
    return error.mensaje;
  }

  return 'No fue posible revisar reportes similares. Intenta nuevamente antes de enviar.';
}

function obtenerMensajeRespuestaFallida(respuesta: { message?: string; error?: string }) {
  return (
    respuesta.message ??
    respuesta.error ??
    'No fue posible revisar reportes similares. Intenta nuevamente antes de enviar.'
  );
}

function esCategoriaReporte(valor: string): valor is CategoriaReporte {
  return ['INFRAESTRUCTURA', 'SEGURIDAD', 'LIMPIEZA'].includes(valor);
}

function formatearPorcentaje(valor: number) {
  return `${new Intl.NumberFormat('es-GT', {
    maximumFractionDigits: 0
  }).format(valor * 100)}%`;
}

function formatearDistancia(distancia: number | null) {
  if (distancia === null) {
    return 'Sin distancia calculada';
  }

  if (distancia < 1000) {
    return `${new Intl.NumberFormat('es-GT', {
      maximumFractionDigits: 0
    }).format(distancia)} m`;
  }

  return `${new Intl.NumberFormat('es-GT', {
    maximumFractionDigits: 1
  }).format(distancia / 1000)} km`;
}

function formatearFecha(fecha: string | null | undefined) {
  if (!fecha) {
    return 'Fecha no disponible';
  }

  return new Intl.DateTimeFormat('es-GT', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(fecha));
}

function obtenerErroresRevision(titulo: string, descripcion: string, categoria: CategoriaReporte | '') {
  const errores: string[] = [];
  const tituloLimpio = limpiarTexto(titulo);
  const descripcionLimpia = limpiarTexto(descripcion);

  if (
    tituloLimpio.length < limitesIaReportes.tituloMinimoDuplicados ||
    tituloLimpio.length > limitesIaReportes.tituloMaximoDuplicados
  ) {
    errores.push('El título debe tener entre 3 y 150 caracteres.');
  }

  if (
    descripcionLimpia.length < limitesIaReportes.descripcionMinimaDuplicados ||
    descripcionLimpia.length > limitesIaReportes.descripcionMaximaDuplicados
  ) {
    errores.push('La descripción debe tener entre 10 y 2000 caracteres.');
  }

  if (!categoria || !esCategoriaReporte(categoria)) {
    errores.push('Selecciona una categoría válida.');
  }

  return errores;
}

function obtenerCandidatos(respuesta: RespuestaDuplicadosReporte | null) {
  if (!respuesta || respuesta.success === false) {
    return [];
  }

  return respuesta.data?.candidates ?? [];
}

function obtenerMensajeResultado(respuesta: RespuestaDuplicadosReporte | null) {
  if (!respuesta || respuesta.success === false) {
    return null;
  }

  return respuesta.data?.message ?? null;
}

function obtenerTotalCandidatos(candidatos: ReporteConSimilitud[]) {
  return candidatos.length;
}

export function DuplicadosReportePanel({
  titulo,
  descripcion,
  categoria,
  latitude,
  longitude,
  bloqueado = false,
  revisionVigente,
  alCompletarRevision
}: PropiedadesDuplicadosReportePanel) {
  const verificarDuplicados = usarVerificarDuplicadosReporte();

  const [respuesta, setRespuesta] = useState<RespuestaDuplicadosReporte | null>(null);
  const [mensajeError, setMensajeError] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  const erroresRevision = useMemo(
    () => obtenerErroresRevision(titulo, descripcion, categoria),
    [titulo, descripcion, categoria]
  );

  const candidatos = obtenerCandidatos(respuesta);
  const mensajeResultado = obtenerMensajeResultado(respuesta);
  const tieneCandidatos = candidatos.length > 0;
  const puedeRevisar =
    erroresRevision.length === 0 && !bloqueado && !verificarDuplicados.isPending;

  useEffect(() => {
    if (!revisionVigente) {
      setRespuesta(null);
      setMensajeError(null);
      setMensajeExito(null);
    }
  }, [revisionVigente]);

  const revisarDuplicados = async () => {
    setMensajeError(null);
    setMensajeExito(null);

    if (!categoria || !esCategoriaReporte(categoria)) {
      setMensajeError('Selecciona una categoría válida antes de revisar duplicados.');
      return;
    }

    if (erroresRevision.length > 0) {
      setMensajeError('Completa los datos principales antes de revisar reportes similares.');
      return;
    }

    try {
      const respuestaDuplicados = await verificarDuplicados.mutateAsync({
        datos: {
          title: limpiarTexto(titulo),
          description: limpiarTexto(descripcion),
          category: categoria,
          latitude: latitude ?? undefined,
          longitude: longitude ?? undefined
        },
        filtros: {
          limit: 5
        }
      });

      if (respuestaDuplicados.success === false) {
        setRespuesta(null);
        setMensajeError(obtenerMensajeRespuestaFallida(respuestaDuplicados));
        return;
      }

      const candidatosEncontrados = respuestaDuplicados.data?.candidates ?? [];

      setRespuesta(respuestaDuplicados);
      setMensajeExito(
        candidatosEncontrados.length > 0
          ? 'Se encontraron reportes similares. Revísalos antes de enviar.'
          : 'No se encontraron reportes similares relevantes.'
      );

      alCompletarRevision({
        revisado: true,
        hayDuplicados: Boolean(respuestaDuplicados.data?.hasDuplicates),
        totalCandidatos: obtenerTotalCandidatos(candidatosEncontrados)
      });
    } catch (error) {
      setRespuesta(null);
      setMensajeError(obtenerMensajeError(error));
    }
  };

  return (
    <Tarjeta
      titulo="5. Revisión de duplicados"
      descripcion="Compara tu reporte con incidencias existentes antes de enviarlo."
      className="duplicadosReportePanel"
    >
      <div className="duplicadosReportePanel__contenido">
        <div className="duplicadosReportePanel__intro">
          <div>
            <strong>Reportes similares</strong>
            <p>
              Esta revisión ayuda a evitar registros repetidos. Si tu caso es diferente, puedes
              continuar después de revisar los resultados.
            </p>
          </div>

          <div className="duplicadosReportePanel__estadoAccion">
            <span
              className={
                revisionVigente
                  ? 'duplicadosReportePanel__estado duplicadosReportePanel__estado--revisado'
                  : 'duplicadosReportePanel__estado'
              }
            >
              {revisionVigente ? 'Revisión completada' : 'Revisión pendiente'}
            </span>

            <Boton disabled={!puedeRevisar} onClick={revisarDuplicados}>
              {verificarDuplicados.isPending ? 'Revisando...' : 'Revisar duplicados'}
            </Boton>
          </div>
        </div>

        {erroresRevision.length > 0 ? (
          <Alerta variante="informacion" titulo="Datos necesarios">
            <ul className="duplicadosReportePanel__listaAyuda">
              {erroresRevision.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          </Alerta>
        ) : null}

        {mensajeError ? (
          <Alerta variante="advertencia" titulo="Revisión no completada">
            <p>{mensajeError}</p>
          </Alerta>
        ) : null}

        {mensajeExito ? (
          <Alerta variante={tieneCandidatos ? 'advertencia' : 'exito'} titulo="Resultado">
            <p>{mensajeExito}</p>
            {mensajeResultado ? <p>{mensajeResultado}</p> : null}
          </Alerta>
        ) : null}

        {respuesta && respuesta.success === true ? (
          <div className="duplicadosReportePanel__resultado">
            <div className="duplicadosReportePanel__resumen">
              <article>
                <span>Candidatos encontrados</span>
                <strong>{candidatos.length}</strong>
              </article>

              <article>
                <span>Umbral aplicado</span>
                <strong>
                  {respuesta.meta?.threshold !== undefined
                    ? formatearPorcentaje(respuesta.meta.threshold)
                    : 'No disponible'}
                </strong>
              </article>

              <article>
                <span>Duplicado probable desde</span>
                <strong>
                  {respuesta.meta?.duplicateThreshold !== undefined
                    ? formatearPorcentaje(respuesta.meta.duplicateThreshold)
                    : 'No disponible'}
                </strong>
              </article>
            </div>

            {candidatos.length > 0 ? (
              <div className="duplicadosReportePanel__candidatos">
                {candidatos.map((reporte) => (
                  <article key={reporte.id} className="duplicadosReportePanel__candidato">
                    <div className="duplicadosReportePanel__candidatoEncabezado">
                      <div>
                        <span>{reporte.similarity.label}</span>
                        <h3>{reporte.title}</h3>
                      </div>

                      <strong>{formatearPorcentaje(reporte.similarity.score)}</strong>
                    </div>

                    <p>{reporte.description}</p>

                    <dl className="duplicadosReportePanel__detalles">
                      <div>
                        <dt>Categoría</dt>
                        <dd>{etiquetasCategoria[reporte.category] ?? reporte.category}</dd>
                      </div>

                      <div>
                        <dt>Prioridad</dt>
                        <dd>{etiquetasPrioridad[reporte.priority] ?? reporte.priority}</dd>
                      </div>

                      <div>
                        <dt>Estado</dt>
                        <dd>{etiquetasEstado[reporte.status] ?? reporte.status}</dd>
                      </div>

                      <div>
                        <dt>Distancia</dt>
                        <dd>{formatearDistancia(reporte.similarity.distanceM)}</dd>
                      </div>

                      <div>
                        <dt>Creado</dt>
                        <dd>{formatearFecha(reporte.createdAt)}</dd>
                      </div>
                    </dl>

                    <div className="duplicadosReportePanel__accionesCandidato">
                      <Link to={`${rutasAplicacion.reportes}/${encodeURIComponent(reporte.id)}`}>
                        Abrir reporte similar
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="duplicadosReportePanel__vacio">
                <strong>No se encontraron coincidencias relevantes.</strong>
                <p>Puedes continuar con el envío del reporte.</p>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </Tarjeta>
  );
}