import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { rutasAplicacion } from '../../../config/constantesSistema';
import type { PaginacionReportes, Reporte } from '../types/reportesTipos';
import type { CargaTrabajoResponsable } from '../types/reportesOperativosTipos';
import {
  evaluarAtencionOperativaReporte,
  obtenerCargaTrabajoResponsables,
  obtenerEtiquetaEstadoOperativo,
  obtenerEtiquetaPrioridadOperativa,
  ordenarReportesPorUrgenciaOperativa
} from '../utils/reportesOperativosUtils';
import './cargaTrabajoResponsables.css';

type PropiedadesCargaTrabajoResponsables = {
  reportes: Reporte[];
  paginacion?: PaginacionReportes;
};

type OrdenCargaTrabajo = 'ACTIVOS' | 'ALTA_PRIORIDAD' | 'TOTAL';

const claveSinResponsable = 'SIN_RESPONSABLE';

const etiquetasOrdenCarga: Record<OrdenCargaTrabajo, string> = {
  ACTIVOS: 'Casos activos',
  ALTA_PRIORIDAD: 'Alta prioridad',
  TOTAL: 'Total visible'
};

function formatearNumero(valor: number) {
  return new Intl.NumberFormat('es-GT').format(valor);
}

function obtenerClaveCarga(carga: CargaTrabajoResponsable) {
  return carga.responsableId ?? claveSinResponsable;
}

function obtenerCasosActivos(carga: CargaTrabajoResponsable) {
  return carga.pendientes + carga.enProceso;
}

function ordenarCargasTrabajo(
  cargas: CargaTrabajoResponsable[],
  orden: OrdenCargaTrabajo
) {
  return [...cargas].sort((cargaA, cargaB) => {
    const cargaASinResponsable = cargaA.responsableId === null;
    const cargaBSinResponsable = cargaB.responsableId === null;

    if (cargaASinResponsable && !cargaBSinResponsable) {
      return -1;
    }

    if (!cargaASinResponsable && cargaBSinResponsable) {
      return 1;
    }

    if (orden === 'ALTA_PRIORIDAD') {
      const diferenciaAltaPrioridad =
        cargaB.altaPrioridad - cargaA.altaPrioridad;

      if (diferenciaAltaPrioridad !== 0) {
        return diferenciaAltaPrioridad;
      }
    }

    if (orden === 'TOTAL') {
      const diferenciaTotal = cargaB.total - cargaA.total;

      if (diferenciaTotal !== 0) {
        return diferenciaTotal;
      }
    }

    const diferenciaActivos =
      obtenerCasosActivos(cargaB) - obtenerCasosActivos(cargaA);

    if (diferenciaActivos !== 0) {
      return diferenciaActivos;
    }

    return cargaA.nombreResponsable.localeCompare(
      cargaB.nombreResponsable,
      'es'
    );
  });
}

function obtenerReportesResponsable(
  reportes: Reporte[],
  responsableSeleccionado: string
) {
  return reportes.filter((reporte) => {
    if (responsableSeleccionado === claveSinResponsable) {
      return !reporte.assignedTo?.id;
    }

    return reporte.assignedTo?.id === responsableSeleccionado;
  });
}

function obtenerPorcentajeCarga(cargaActiva: number, cargaActivaMaxima: number) {
  if (cargaActivaMaxima <= 0) {
    return 0;
  }

  return Math.round((cargaActiva / cargaActivaMaxima) * 100);
}

function obtenerDescripcionResponsable(carga: CargaTrabajoResponsable) {
  if (carga.responsableId === null) {
    return 'Casos que todavía necesitan una persona responsable.';
  }

  return 'Casos asignados a esta persona dentro del listado visible.';
}

export function CargaTrabajoResponsables({
  reportes,
  paginacion
}: PropiedadesCargaTrabajoResponsables) {
  const [orden, setOrden] = useState<OrdenCargaTrabajo>('ACTIVOS');
  const [responsableSeleccionado, setResponsableSeleccionado] =
    useState<string | null>(null);

  const cargas = useMemo(
    () =>
      ordenarCargasTrabajo(
        obtenerCargaTrabajoResponsables(reportes),
        orden
      ),
    [orden, reportes]
  );

  useEffect(() => {
    const clavesDisponibles = cargas.map(obtenerClaveCarga);

    if (clavesDisponibles.length === 0) {
      setResponsableSeleccionado(null);
      return;
    }

    if (
      !responsableSeleccionado ||
      !clavesDisponibles.includes(responsableSeleccionado)
    ) {
      setResponsableSeleccionado(clavesDisponibles[0]);
    }
  }, [cargas, responsableSeleccionado]);

  const cargaSeleccionada =
    cargas.find(
      (carga) => obtenerClaveCarga(carga) === responsableSeleccionado
    ) ?? null;

  const reportesSeleccionados = useMemo(() => {
    if (!responsableSeleccionado) {
      return [];
    }

    return ordenarReportesPorUrgenciaOperativa(
      obtenerReportesResponsable(reportes, responsableSeleccionado)
    );
  }, [reportes, responsableSeleccionado]);

  const cargaActivaMaxima = Math.max(
    ...cargas.map(obtenerCasosActivos),
    0
  );

  const totalGeneral = paginacion?.total ?? reportes.length;
  const reportesMostrados = reportesSeleccionados.slice(0, 6);
  const reportesRestantes = Math.max(
    reportesSeleccionados.length - reportesMostrados.length,
    0
  );

  if (reportes.length === 0) {
    return (
      <section
        className="cargaTrabajoResponsables cargaTrabajoResponsables--vacia"
        aria-label="Carga de trabajo por responsable"
      >
        <strong>Sin carga operativa para mostrar</strong>
        <p>
          No hay reportes visibles con los filtros administrativos actuales.
        </p>
      </section>
    );
  }

  return (
    <section
      className="cargaTrabajoResponsables"
      aria-label="Carga de trabajo por responsable"
    >
      <header className="cargaTrabajoResponsables__encabezado">
        <div>
          <span>Carga de trabajo</span>
          <h3>Distribución por responsable</h3>
          <p>
            Compara casos pendientes, en proceso y de alta prioridad en la
            página actual.
          </p>
        </div>

        <label className="cargaTrabajoResponsables__orden">
          <span>Ordenar por</span>
          <select
            value={orden}
            onChange={(evento) =>
              setOrden(evento.target.value as OrdenCargaTrabajo)
            }
          >
            {(Object.keys(etiquetasOrdenCarga) as OrdenCargaTrabajo[]).map(
              (opcion) => (
                <option key={opcion} value={opcion}>
                  {etiquetasOrdenCarga[opcion]}
                </option>
              )
            )}
          </select>
        </label>
      </header>

      <div className="cargaTrabajoResponsables__contexto">
        <span>
          {formatearNumero(reportes.length)} reportes visibles de{' '}
          {formatearNumero(totalGeneral)} encontrados
        </span>
        <span>
          {formatearNumero(cargas.length)} grupos de responsabilidad
        </span>
      </div>

      <div className="cargaTrabajoResponsables__contenido">
        <div
          className="cargaTrabajoResponsables__responsables"
          role="list"
        >
          {cargas.map((carga) => {
            const claveCarga = obtenerClaveCarga(carga);
            const casosActivos = obtenerCasosActivos(carga);
            const porcentajeCarga = obtenerPorcentajeCarga(
              casosActivos,
              cargaActivaMaxima
            );
            const estaSeleccionada =
              claveCarga === responsableSeleccionado;

            return (
              <button
                type="button"
                key={claveCarga}
                role="listitem"
                aria-pressed={estaSeleccionada}
                className={
                  estaSeleccionada
                    ? 'cargaTrabajoResponsables__responsable cargaTrabajoResponsables__responsable--seleccionado'
                    : 'cargaTrabajoResponsables__responsable'
                }
                onClick={() => setResponsableSeleccionado(claveCarga)}
              >
                <div className="cargaTrabajoResponsables__responsableEncabezado">
                  <div>
                    <strong>{carga.nombreResponsable}</strong>
                    <span>
                      {casosActivos} casos activos
                    </span>
                  </div>

                  <small>{carga.total} total</small>
                </div>

                <div
                  className="cargaTrabajoResponsables__barra"
                  aria-hidden="true"
                >
                  <span style={{ width: `${porcentajeCarga}%` }} />
                </div>

                <dl className="cargaTrabajoResponsables__responsableMetricas">
                  <div>
                    <dt>Pendientes</dt>
                    <dd>{carga.pendientes}</dd>
                  </div>

                  <div>
                    <dt>En proceso</dt>
                    <dd>{carga.enProceso}</dd>
                  </div>

                  <div>
                    <dt>Alta prioridad</dt>
                    <dd>{carga.altaPrioridad}</dd>
                  </div>
                </dl>
              </button>
            );
          })}
        </div>

        {cargaSeleccionada ? (
          <article className="cargaTrabajoResponsables__detalle">
            <div className="cargaTrabajoResponsables__detalleEncabezado">
              <div>
                <span>Responsable seleccionado</span>
                <h4>{cargaSeleccionada.nombreResponsable}</h4>
                <p>
                  {obtenerDescripcionResponsable(cargaSeleccionada)}
                </p>
              </div>

              <strong>
                {formatearNumero(
                  obtenerCasosActivos(cargaSeleccionada)
                )}{' '}
                activos
              </strong>
            </div>

            <dl className="cargaTrabajoResponsables__detalleMetricas">
              <div>
                <dt>Total visible</dt>
                <dd>{formatearNumero(cargaSeleccionada.total)}</dd>
              </div>

              <div>
                <dt>Pendientes</dt>
                <dd>{formatearNumero(cargaSeleccionada.pendientes)}</dd>
              </div>

              <div>
                <dt>En proceso</dt>
                <dd>{formatearNumero(cargaSeleccionada.enProceso)}</dd>
              </div>

              <div>
                <dt>Alta prioridad</dt>
                <dd>
                  {formatearNumero(cargaSeleccionada.altaPrioridad)}
                </dd>
              </div>

              <div>
                <dt>Resueltos</dt>
                <dd>{formatearNumero(cargaSeleccionada.resueltos)}</dd>
              </div>

              <div>
                <dt>Rechazados</dt>
                <dd>{formatearNumero(cargaSeleccionada.rechazados)}</dd>
              </div>
            </dl>

            <div className="cargaTrabajoResponsables__cola">
              <div className="cargaTrabajoResponsables__colaEncabezado">
                <div>
                  <span>Cola visible</span>
                  <strong>Casos ordenados por atención</strong>
                </div>

                <small>
                  {formatearNumero(reportesSeleccionados.length)} reportes
                </small>
              </div>

              {reportesMostrados.length > 0 ? (
                <div className="cargaTrabajoResponsables__reportes">
                  {reportesMostrados.map((reporte) => {
                    const evaluacion =
                      evaluarAtencionOperativaReporte(reporte);

                    return (
                      <Link
                        key={reporte.id}
                        className="cargaTrabajoResponsables__reporte"
                        to={`${rutasAplicacion.reportes}/${encodeURIComponent(
                          reporte.id
                        )}`}
                      >
                        <div>
                          <span>{evaluacion.etiqueta}</span>
                          <strong>{reporte.title}</strong>
                        </div>

                        <small>
                          {obtenerEtiquetaPrioridadOperativa(
                            reporte.priority
                          )}{' '}
                          ·{' '}
                          {obtenerEtiquetaEstadoOperativo(
                            reporte.status
                          )}
                        </small>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="cargaTrabajoResponsables__sinReportes">
                  <strong>Sin reportes visibles</strong>
                  <p>
                    No hay casos asociados a esta selección.
                  </p>
                </div>
              )}

              {reportesRestantes > 0 ? (
                <p className="cargaTrabajoResponsables__restantes">
                  Hay {formatearNumero(reportesRestantes)} reportes
                  adicionales en esta página.
                </p>
              ) : null}
            </div>
          </article>
        ) : null}
      </div>
    </section>
  );
}