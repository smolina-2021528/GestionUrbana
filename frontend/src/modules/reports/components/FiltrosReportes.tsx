import type { ChangeEvent } from 'react';

import { Boton } from '../../../shared/components/ui/Boton';
import { Tarjeta } from '../../../shared/components/ui/Tarjeta';
import {
  camposOrdenReportes,
  categoriasReporte,
  estadosReporte,
  ordenesReportes,
  prioridadesReporte,
  rangosFechaReportes,
  type CampoOrdenReporte,
  type CategoriaReporte,
  type EstadoReporte,
  type FiltrosListadoReportes,
  type OrdenReporte,
  type PrioridadReporte,
  type RangoFechaReporte
} from '../types/reportesTipos';
import './reportesComponentes.css';
import './filtrosReportes.css';

type PropiedadesFiltrosReportes = {
  filtros: FiltrosListadoReportes;
  bloqueado?: boolean;
  mostrarOrden?: boolean;
  alCambiarFiltros: (filtros: FiltrosListadoReportes) => void;
  alLimpiar?: () => void;
};

type FiltroActivo = {
  id: string;
  etiqueta: string;
  valor: string;
  alQuitar: () => void;
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

const etiquetasOrden: Record<OrdenReporte, string> = {
  ASC: 'Ascendente',
  DESC: 'Descendente'
};

const etiquetasCampoOrden: Record<CampoOrdenReporte, string> = {
  date: 'Fecha',
  priority: 'Prioridad'
};

const etiquetasRangoFecha: Record<RangoFechaReporte, string> = {
  TODAY: 'Hoy',
  LAST_7_DAYS: 'Últimos 7 días',
  LAST_30_DAYS: 'Últimos 30 días',
  LAST_90_DAYS: 'Últimos 90 días',
  THIS_YEAR: 'Este año'
};

const limitesPaginaReportes = [10, 20, 30, 50] as const;

type LimitePaginaReporte = (typeof limitesPaginaReportes)[number];

function esCategoriaReporte(valor: string): valor is CategoriaReporte {
  return categoriasReporte.includes(valor as CategoriaReporte);
}

function esPrioridadReporte(valor: string): valor is PrioridadReporte {
  return prioridadesReporte.includes(valor as PrioridadReporte);
}

function esEstadoReporte(valor: string): valor is EstadoReporte {
  return estadosReporte.includes(valor as EstadoReporte);
}

function esOrdenReporte(valor: string): valor is OrdenReporte {
  return ordenesReportes.includes(valor as OrdenReporte);
}

function esCampoOrdenReporte(valor: string): valor is CampoOrdenReporte {
  return camposOrdenReportes.includes(valor as CampoOrdenReporte);
}

function esRangoFechaReporte(valor: string): valor is RangoFechaReporte {
  return rangosFechaReportes.includes(valor as RangoFechaReporte);
}

function esLimitePaginaReporte(valor: number): valor is LimitePaginaReporte {
  return limitesPaginaReportes.includes(valor as LimitePaginaReporte);
}

function limpiarFiltro<TFiltros extends Record<string, unknown>>(
  filtros: TFiltros,
  campo: keyof TFiltros
) {
  const filtrosActualizados = { ...filtros };
  delete filtrosActualizados[campo];

  return filtrosActualizados;
}

function formatearFechaFiltro(fecha: string) {
  const fechaValida = new Date(`${fecha}T00:00:00`);

  if (Number.isNaN(fechaValida.getTime())) {
    return fecha;
  }

  return new Intl.DateTimeFormat('es-GT', {
    dateStyle: 'medium'
  }).format(fechaValida);
}

export function FiltrosReportes({
  filtros,
  bloqueado = false,
  mostrarOrden = true,
  alCambiarFiltros,
  alLimpiar
}: PropiedadesFiltrosReportes) {
  const cambiarCategoria = (evento: ChangeEvent<HTMLSelectElement>) => {
    const valor = evento.target.value;

    if (!esCategoriaReporte(valor)) {
      alCambiarFiltros(limpiarFiltro({ ...filtros, page: 1 }, 'category'));
      return;
    }

    alCambiarFiltros({ ...filtros, page: 1, category: valor });
  };

  const cambiarPrioridad = (evento: ChangeEvent<HTMLSelectElement>) => {
    const valor = evento.target.value;

    if (!esPrioridadReporte(valor)) {
      alCambiarFiltros(limpiarFiltro({ ...filtros, page: 1 }, 'priority'));
      return;
    }

    alCambiarFiltros({ ...filtros, page: 1, priority: valor });
  };

  const cambiarEstado = (evento: ChangeEvent<HTMLSelectElement>) => {
    const valor = evento.target.value;

    if (!esEstadoReporte(valor)) {
      alCambiarFiltros(limpiarFiltro({ ...filtros, page: 1 }, 'status'));
      return;
    }

    alCambiarFiltros({ ...filtros, page: 1, status: valor });
  };

  const cambiarRangoFecha = (evento: ChangeEvent<HTMLSelectElement>) => {
    const valor = evento.target.value;
    const filtrosSinInicio = limpiarFiltro({ ...filtros, page: 1 }, 'startDate');
    const filtrosSinFechas = limpiarFiltro(filtrosSinInicio, 'endDate');

    if (!esRangoFechaReporte(valor)) {
      alCambiarFiltros(limpiarFiltro(filtrosSinFechas, 'dateRange'));
      return;
    }

    alCambiarFiltros({
      ...filtrosSinFechas,
      page: 1,
      dateRange: valor
    });
  };

  const cambiarFechaInicio = (evento: ChangeEvent<HTMLInputElement>) => {
    const valor = evento.target.value;
    const filtrosSinRango = limpiarFiltro({ ...filtros, page: 1 }, 'dateRange');

    if (!valor) {
      alCambiarFiltros(limpiarFiltro(filtrosSinRango, 'startDate'));
      return;
    }

    alCambiarFiltros({ ...filtrosSinRango, page: 1, startDate: valor });
  };

  const cambiarFechaFin = (evento: ChangeEvent<HTMLInputElement>) => {
    const valor = evento.target.value;
    const filtrosSinRango = limpiarFiltro({ ...filtros, page: 1 }, 'dateRange');

    if (!valor) {
      alCambiarFiltros(limpiarFiltro(filtrosSinRango, 'endDate'));
      return;
    }

    alCambiarFiltros({ ...filtrosSinRango, page: 1, endDate: valor });
  };

  const cambiarCampoOrden = (evento: ChangeEvent<HTMLSelectElement>) => {
    const valor = evento.target.value;

    if (!esCampoOrdenReporte(valor)) {
      alCambiarFiltros(limpiarFiltro({ ...filtros, page: 1 }, 'sortBy'));
      return;
    }

    alCambiarFiltros({ ...filtros, page: 1, sortBy: valor });
  };

  const cambiarOrden = (evento: ChangeEvent<HTMLSelectElement>) => {
    const valor = evento.target.value;

    if (!esOrdenReporte(valor)) {
      alCambiarFiltros(limpiarFiltro({ ...filtros, page: 1 }, 'sortOrder'));
      return;
    }

    alCambiarFiltros({ ...filtros, page: 1, sortOrder: valor });
  };

  const cambiarLimite = (evento: ChangeEvent<HTMLSelectElement>) => {
    const valor = Number(evento.target.value);

    if (!esLimitePaginaReporte(valor)) {
      alCambiarFiltros({
        ...filtros,
        page: 1,
        limit: 10
      });
      return;
    }

    alCambiarFiltros({
      ...filtros,
      page: 1,
      limit: valor
    });
  };

  const quitarFiltroSimple = (campo: keyof FiltrosListadoReportes) => {
    alCambiarFiltros(limpiarFiltro({ ...filtros, page: 1 }, campo));
  };

  const quitarFechas = () => {
    const filtrosSinInicio = limpiarFiltro({ ...filtros, page: 1 }, 'startDate');
    const filtrosSinFin = limpiarFiltro(filtrosSinInicio, 'endDate');

    alCambiarFiltros(limpiarFiltro(filtrosSinFin, 'dateRange'));
  };

  const quitarOrden = () => {
    const filtrosSinCampo = limpiarFiltro({ ...filtros, page: 1 }, 'sortBy');

    alCambiarFiltros(limpiarFiltro(filtrosSinCampo, 'sortOrder'));
  };

  const filtrosActivos: FiltroActivo[] = [];

  if (filtros.category) {
    filtrosActivos.push({
      id: 'category',
      etiqueta: 'Categoría',
      valor: etiquetasCategoria[filtros.category],
      alQuitar: () => quitarFiltroSimple('category')
    });
  }

  if (filtros.priority) {
    filtrosActivos.push({
      id: 'priority',
      etiqueta: 'Prioridad',
      valor: etiquetasPrioridad[filtros.priority],
      alQuitar: () => quitarFiltroSimple('priority')
    });
  }

  if (filtros.status) {
    filtrosActivos.push({
      id: 'status',
      etiqueta: 'Estado',
      valor: etiquetasEstado[filtros.status],
      alQuitar: () => quitarFiltroSimple('status')
    });
  }

  if (filtros.dateRange) {
    filtrosActivos.push({
      id: 'dateRange',
      etiqueta: 'Período',
      valor: etiquetasRangoFecha[filtros.dateRange],
      alQuitar: quitarFechas
    });
  }

  if (filtros.startDate || filtros.endDate) {
    filtrosActivos.push({
      id: 'dates',
      etiqueta: 'Fechas',
      valor: [
        filtros.startDate ? `Desde ${formatearFechaFiltro(filtros.startDate)}` : null,
        filtros.endDate ? `Hasta ${formatearFechaFiltro(filtros.endDate)}` : null
      ]
        .filter(Boolean)
        .join(' · '),
      alQuitar: quitarFechas
    });
  }

  if (mostrarOrden && (filtros.sortBy || filtros.sortOrder)) {
    filtrosActivos.push({
      id: 'sort',
      etiqueta: 'Orden',
      valor: [
        filtros.sortBy ? etiquetasCampoOrden[filtros.sortBy] : 'Fecha',
        filtros.sortOrder ? etiquetasOrden[filtros.sortOrder] : 'Descendente'
      ].join(' · '),
      alQuitar: quitarOrden
    });
  }

  if (filtros.limit && filtros.limit !== 10) {
    filtrosActivos.push({
      id: 'limit',
      etiqueta: 'Vista',
      valor: `${filtros.limit} por página`,
      alQuitar: () =>
        alCambiarFiltros({
          ...filtros,
          page: 1,
          limit: 10
        })
    });
  }

  const tieneFiltrosActivos = filtrosActivos.length > 0;

  return (
    <Tarjeta
      titulo="Filtros administrativos"
      descripcion="Refina el listado por estado, prioridad, categoría, período y orden operativo."
    >
      <div className="filtrosReportes filtrosReportes--avanzados">
        <div className="filtrosReportes__seccion">
          <div className="filtrosReportes__seccionEncabezado">
            <div>
              <strong>Clasificación del reporte</strong>
              <p>Usa estos filtros para priorizar el seguimiento operativo.</p>
            </div>
          </div>

          <div className="filtrosReportes__grid filtrosReportes__grid--principal">
            <label className="filtrosReportes__campo">
              <span>Categoría</span>
              <select
                value={filtros.category ?? ''}
                disabled={bloqueado}
                onChange={cambiarCategoria}
              >
                <option value="">Todas</option>
                {categoriasReporte.map((categoria) => (
                  <option key={categoria} value={categoria}>
                    {etiquetasCategoria[categoria]}
                  </option>
                ))}
              </select>
            </label>

            <label className="filtrosReportes__campo">
              <span>Prioridad</span>
              <select
                value={filtros.priority ?? ''}
                disabled={bloqueado}
                onChange={cambiarPrioridad}
              >
                <option value="">Todas</option>
                {prioridadesReporte.map((prioridad) => (
                  <option key={prioridad} value={prioridad}>
                    {etiquetasPrioridad[prioridad]}
                  </option>
                ))}
              </select>
            </label>

            <label className="filtrosReportes__campo">
              <span>Estado</span>
              <select value={filtros.status ?? ''} disabled={bloqueado} onChange={cambiarEstado}>
                <option value="">Todos</option>
                {estadosReporte.map((estado) => (
                  <option key={estado} value={estado}>
                    {etiquetasEstado[estado]}
                  </option>
                ))}
              </select>
            </label>

            <label className="filtrosReportes__campo">
              <span>Resultados por página</span>
              <select value={filtros.limit ?? 10} disabled={bloqueado} onChange={cambiarLimite}>
                {limitesPaginaReportes.map((limite) => (
                  <option key={limite} value={limite}>
                    {limite} reportes
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="filtrosReportes__seccion">
          <div className="filtrosReportes__seccionEncabezado">
            <div>
              <strong>Período de creación</strong>
              <p>Elige un rango rápido o define fechas específicas.</p>
            </div>
          </div>

          <div className="filtrosReportes__grid filtrosReportes__grid--fechas">
            <label className="filtrosReportes__campo">
              <span>Rango rápido</span>
              <select
                value={filtros.dateRange ?? ''}
                disabled={bloqueado}
                onChange={cambiarRangoFecha}
              >
                <option value="">Sin rango rápido</option>
                {rangosFechaReportes.map((rango) => (
                  <option key={rango} value={rango}>
                    {etiquetasRangoFecha[rango]}
                  </option>
                ))}
              </select>
            </label>

            <label className="filtrosReportes__campo">
              <span>Desde</span>
              <input
                type="date"
                value={filtros.startDate ?? ''}
                disabled={bloqueado}
                onChange={cambiarFechaInicio}
              />
            </label>

            <label className="filtrosReportes__campo">
              <span>Hasta</span>
              <input
                type="date"
                value={filtros.endDate ?? ''}
                disabled={bloqueado}
                onChange={cambiarFechaFin}
              />
            </label>
          </div>
        </div>

        {mostrarOrden ? (
          <div className="filtrosReportes__seccion">
            <div className="filtrosReportes__seccionEncabezado">
              <div>
                <strong>Orden del listado</strong>
                <p>Define cómo se debe presentar la cola de atención.</p>
              </div>
            </div>

            <div className="filtrosReportes__grid filtrosReportes__grid--orden">
              <label className="filtrosReportes__campo">
                <span>Ordenar por</span>
                <select
                  value={filtros.sortBy ?? ''}
                  disabled={bloqueado}
                  onChange={cambiarCampoOrden}
                >
                  <option value="">Sin orden específico</option>
                  {camposOrdenReportes.map((campo) => (
                    <option key={campo} value={campo}>
                      {etiquetasCampoOrden[campo]}
                    </option>
                  ))}
                </select>
              </label>

              <label className="filtrosReportes__campo">
                <span>Orden</span>
                <select value={filtros.sortOrder ?? ''} disabled={bloqueado} onChange={cambiarOrden}>
                  <option value="">Automático</option>
                  {ordenesReportes.map((orden) => (
                    <option key={orden} value={orden}>
                      {etiquetasOrden[orden]}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        ) : null}

        <div className="filtrosReportes__atajos" aria-label="Atajos de filtros administrativos">
          <Boton
            variante="secundario"
            tamano="sm"
            disabled={bloqueado}
            onClick={() =>
              alCambiarFiltros({
                ...filtros,
                page: 1,
                status: 'PENDIENTE',
                sortBy: 'priority',
                sortOrder: 'DESC'
              })
            }
          >
            Pendientes primero
          </Boton>

          <Boton
            variante="secundario"
            tamano="sm"
            disabled={bloqueado}
            onClick={() =>
              alCambiarFiltros({
                ...filtros,
                page: 1,
                priority: 'ALTA',
                sortBy: 'date',
                sortOrder: 'DESC'
              })
            }
          >
            Alta prioridad
          </Boton>

          <Boton
            variante="secundario"
            tamano="sm"
            disabled={bloqueado}
            onClick={() =>
              alCambiarFiltros({
                ...filtros,
                page: 1,
                status: 'EN_PROCESO',
                sortBy: 'date',
                sortOrder: 'DESC'
              })
            }
          >
            En proceso
          </Boton>

          <Boton
            variante="secundario"
            tamano="sm"
            disabled={bloqueado}
            onClick={() =>
              alCambiarFiltros({
                ...filtros,
                page: 1,
                dateRange: 'LAST_7_DAYS',
                sortBy: 'date',
                sortOrder: 'DESC'
              })
            }
          >
            Últimos 7 días
          </Boton>
        </div>

        <div className="filtrosReportes__estado">
          <div>
            <span>Filtros activos</span>
            <strong>{tieneFiltrosActivos ? filtrosActivos.length : 0}</strong>
          </div>

          {tieneFiltrosActivos ? (
            <div className="filtrosReportes__chips">
              {filtrosActivos.map((filtro) => (
                <button
                  type="button"
                  key={filtro.id}
                  disabled={bloqueado}
                  onClick={filtro.alQuitar}
                  className="filtrosReportes__chip"
                  title={`Quitar filtro ${filtro.etiqueta}`}
                >
                  <span>{filtro.etiqueta}</span>
                  <strong>{filtro.valor}</strong>
                  <small>×</small>
                </button>
              ))}
            </div>
          ) : (
            <p>No hay filtros adicionales aplicados.</p>
          )}
        </div>

        {alLimpiar ? (
          <div className="filtrosReportes__acciones">
            <Boton variante="fantasma" disabled={bloqueado} onClick={alLimpiar}>
              Limpiar filtros
            </Boton>
          </div>
        ) : null}
      </div>
    </Tarjeta>
  );
}