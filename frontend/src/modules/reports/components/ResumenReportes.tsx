import { Link } from 'react-router-dom';

import { rutasAplicacion } from '../../../config/constantesSistema';
import { Tarjeta } from '../../../shared/components/ui/Tarjeta';
import type { PaginacionReportes, Reporte } from '../types/reportesTipos';
import {
  evaluarAtencionOperativaReporte,
  obtenerCargaTrabajoResponsables,
  obtenerEtiquetaEstadoOperativo,
  obtenerEtiquetaPrioridadOperativa,
  obtenerResumenOperativoReportes,
  ordenarReportesPorUrgenciaOperativa,
  reporteTieneResponsable,
  reporteTieneUbicacion
} from '../utils/reportesOperativosUtils';
import './reportesComponentes.css';
import './resumenReportes.css';

type PropiedadesResumenReportes = {
  reportes: Reporte[];
  paginacion?: PaginacionReportes;
};

type IndicadorResumenOperativo = {
  id: string;
  etiqueta: string;
  valor: number;
  descripcion: string;
  destacado?: boolean;
};

function formatearNumero(valor: number) {
  return new Intl.NumberFormat('es-GT').format(valor);
}

function formatearPorcentaje(valor: number) {
  return `${new Intl.NumberFormat('es-GT', {
    maximumFractionDigits: 0
  }).format(valor)}%`;
}

function calcularPorcentaje(valor: number, total: number) {
  if (total <= 0) {
    return 0;
  }

  return Math.round((valor / total) * 100);
}

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

function obtenerReportesAtencionInmediata(reportes: Reporte[]) {
  return ordenarReportesPorUrgenciaOperativa(reportes)
    .filter((reporte) => evaluarAtencionOperativaReporte(reporte).requiereAtencion)
    .slice(0, 4);
}

function construirIndicadores(reportes: Reporte[], paginacion?: PaginacionReportes) {
  const resumen = obtenerResumenOperativoReportes(reportes);
  const totalConsulta = paginacion?.total ?? resumen.total;

  const indicadores: IndicadorResumenOperativo[] = [
    {
      id: 'total-filtrado',
      etiqueta: 'Total filtrado',
      valor: totalConsulta,
      descripcion: 'Reportes encontrados con los filtros actuales.'
    },
    {
      id: 'pendientes',
      etiqueta: 'Pendientes',
      valor: resumen.pendientes,
      descripcion: 'Casos visibles que todavía no inician gestión.',
      destacado: resumen.pendientes > 0
    },
    {
      id: 'en-proceso',
      etiqueta: 'En proceso',
      valor: resumen.enProceso,
      descripcion: 'Reportes visibles que ya están en atención.'
    },
    {
      id: 'alta-prioridad',
      etiqueta: 'Alta prioridad',
      valor: resumen.altaPrioridad,
      descripcion: 'Casos visibles que requieren seguimiento cercano.',
      destacado: resumen.altaPrioridad > 0
    },
    {
      id: 'sin-responsable',
      etiqueta: 'Sin responsable',
      valor: resumen.sinResponsable,
      descripcion: 'Reportes visibles pendientes de asignación.',
      destacado: resumen.sinResponsable > 0
    },
    {
      id: 'sin-ubicacion',
      etiqueta: 'Sin ubicación',
      valor: resumen.sinUbicacion,
      descripcion: 'Casos visibles que necesitan confirmar ubicación.',
      destacado: resumen.sinUbicacion > 0
    }
  ];

  return {
    indicadores,
    resumen,
    totalConsulta
  };
}

export function ResumenReportes({ reportes, paginacion }: PropiedadesResumenReportes) {
  const { indicadores, resumen, totalConsulta } = construirIndicadores(reportes, paginacion);
  const reportesAtencion = obtenerReportesAtencionInmediata(reportes);
  const cargasResponsables = obtenerCargaTrabajoResponsables(reportes).slice(0, 4);
  const porcentajeAsignados = calcularPorcentaje(resumen.conResponsable, resumen.total);
  const porcentajeUbicacion = calcularPorcentaje(resumen.conUbicacion, resumen.total);

  return (
    <Tarjeta
      titulo="Resumen operativo"
      descripcion="Indicadores rápidos del listado administrativo visible."
    >
      <section
        className="resumenReportes resumenReportes--operativo"
        aria-label="Resumen operativo de reportes"
      >
        <div className="resumenReportes__grid resumenReportes__grid--operativo">
          {indicadores.map((indicador) => (
            <article
              className={
                indicador.destacado
                  ? 'resumenReportes__item resumenReportes__item--destacado'
                  : 'resumenReportes__item'
              }
              key={indicador.id}
            >
              <span className="resumenReportes__etiqueta">{indicador.etiqueta}</span>
              <strong className="resumenReportes__valor">
                {formatearNumero(indicador.valor)}
              </strong>
              <p className="resumenReportes__descripcion">{indicador.descripcion}</p>
            </article>
          ))}
        </div>

        <div className="resumenReportes__panelesOperativos">
          <article className="resumenReportes__panelOperativo">
            <div className="resumenReportes__panelEncabezado">
              <div>
                <span>Avance operativo</span>
                <strong>Estado de atención</strong>
              </div>
              <small>{formatearNumero(reportes.length)} visibles</small>
            </div>

            <div className="resumenReportes__metricasOperativas">
              <div>
                <span>Asignados</span>
                <strong>{formatearPorcentaje(porcentajeAsignados)}</strong>
                <div className="resumenReportes__barra" aria-hidden="true">
                  <span style={{ width: `${porcentajeAsignados}%` }} />
                </div>
              </div>

              <div>
                <span>Con ubicación</span>
                <strong>{formatearPorcentaje(porcentajeUbicacion)}</strong>
                <div className="resumenReportes__barra" aria-hidden="true">
                  <span style={{ width: `${porcentajeUbicacion}%` }} />
                </div>
              </div>
            </div>

            <dl className="resumenReportes__distribucionOperativa">
              <div>
                <dt>{obtenerEtiquetaEstadoOperativo('PENDIENTE')}</dt>
                <dd>{formatearNumero(resumen.porEstado.PENDIENTE)}</dd>
              </div>
              <div>
                <dt>{obtenerEtiquetaEstadoOperativo('EN_PROCESO')}</dt>
                <dd>{formatearNumero(resumen.porEstado.EN_PROCESO)}</dd>
              </div>
              <div>
                <dt>{obtenerEtiquetaEstadoOperativo('RESUELTO')}</dt>
                <dd>{formatearNumero(resumen.porEstado.RESUELTO)}</dd>
              </div>
              <div>
                <dt>{obtenerEtiquetaEstadoOperativo('RECHAZADO')}</dt>
                <dd>{formatearNumero(resumen.porEstado.RECHAZADO)}</dd>
              </div>
            </dl>
          </article>

          <article className="resumenReportes__panelOperativo">
            <div className="resumenReportes__panelEncabezado">
              <div>
                <span>Atención inmediata</span>
                <strong>Casos a revisar</strong>
              </div>
              <small>{formatearNumero(totalConsulta)} filtrados</small>
            </div>

            {reportesAtencion.length > 0 ? (
              <div className="resumenReportes__casosOperativos">
                {reportesAtencion.map((reporte) => {
                  const evaluacion = evaluarAtencionOperativaReporte(reporte);

                  return (
                    <Link
                      className="resumenReportes__casoOperativo"
                      to={`${rutasAplicacion.reportes}/${encodeURIComponent(reporte.id)}`}
                      key={reporte.id}
                    >
                      <span>{evaluacion.etiqueta}</span>
                      <strong>{reporte.title}</strong>
                      <small>
                        {obtenerEtiquetaPrioridadOperativa(reporte.priority)} ·{' '}
                        {obtenerEtiquetaEstadoOperativo(reporte.status)} ·{' '}
                        {reporteTieneResponsable(reporte) ? 'Asignado' : 'Sin responsable'}
                      </small>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="resumenReportes__vacioOperativo">
                <strong>Sin alertas operativas visibles</strong>
                <p>No hay casos pendientes de atención inmediata en esta página.</p>
              </div>
            )}
          </article>
        </div>

        <div className="resumenReportes__inferiorOperativo">
          <article className="resumenReportes__bloqueOperativo">
            <div className="resumenReportes__bloqueTitulo">
              <span>Carga por responsable</span>
              <strong>Distribución visible</strong>
            </div>

            {cargasResponsables.length > 0 ? (
              <div className="resumenReportes__responsablesOperativos">
                {cargasResponsables.map((carga) => (
                  <div
                    className="resumenReportes__responsableOperativo"
                    key={carga.responsableId ?? 'SIN_RESPONSABLE'}
                  >
                    <div>
                      <strong>{carga.nombreResponsable}</strong>
                      <span>
                        {formatearNumero(carga.total)} total ·{' '}
                        {formatearNumero(carga.altaPrioridad)} alta prioridad
                      </span>
                    </div>
                    <small>
                      {formatearNumero(carga.pendientes)} pendientes ·{' '}
                      {formatearNumero(carga.enProceso)} en proceso
                    </small>
                  </div>
                ))}
              </div>
            ) : (
              <div className="resumenReportes__vacioOperativo resumenReportes__vacioOperativo--compacto">
                <strong>Sin datos de carga</strong>
                <p>No hay reportes visibles para calcular distribución.</p>
              </div>
            )}
          </article>

          <article className="resumenReportes__bloqueOperativo">
            <div className="resumenReportes__bloqueTitulo">
              <span>Prioridad y ubicación</span>
              <strong>Calidad de gestión</strong>
            </div>

            <dl className="resumenReportes__calidadOperativa">
              <div>
                <dt>{obtenerEtiquetaPrioridadOperativa('ALTA')}</dt>
                <dd>{formatearNumero(resumen.porPrioridad.ALTA)}</dd>
              </div>
              <div>
                <dt>{obtenerEtiquetaPrioridadOperativa('MEDIA')}</dt>
                <dd>{formatearNumero(resumen.porPrioridad.MEDIA)}</dd>
              </div>
              <div>
                <dt>{obtenerEtiquetaPrioridadOperativa('BAJA')}</dt>
                <dd>{formatearNumero(resumen.porPrioridad.BAJA)}</dd>
              </div>
              <div>
                <dt>Con ubicación</dt>
                <dd>{formatearNumero(resumen.conUbicacion)}</dd>
              </div>
              <div>
                <dt>Sin ubicación</dt>
                <dd>{formatearNumero(resumen.sinUbicacion)}</dd>
              </div>
              <div>
                <dt>Último visible</dt>
                <dd>{formatearFecha(reportes[0]?.createdAt)}</dd>
              </div>
            </dl>

            <div className="resumenReportes__notaOperativa">
              <span>
                {reportes.some((reporte) => !reporteTieneUbicacion(reporte))
                  ? 'Hay casos visibles que requieren confirmar ubicación para mejorar la gestión territorial.'
                  : 'Los casos visibles tienen ubicación suficiente para seguimiento territorial.'}
              </span>
            </div>
          </article>
        </div>
      </section>
    </Tarjeta>
  );
}