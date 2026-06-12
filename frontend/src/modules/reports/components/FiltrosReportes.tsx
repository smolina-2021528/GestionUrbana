import type { ChangeEvent } from 'react';

import { Boton } from '../../../shared/components/ui/Boton';
import { Tarjeta } from '../../../shared/components/ui/Tarjeta';
import {
  camposOrdenReportes,
  categoriasReporte,
  estadosReporte,
  ordenesReportes,
  prioridadesReporte,
  type CampoOrdenReporte,
  type CategoriaReporte,
  type EstadoReporte,
  type FiltrosListadoReportes,
  type OrdenReporte,
  type PrioridadReporte
} from '../types/reportesTipos';
import './reportesComponentes.css';

type PropiedadesFiltrosReportes = {
  filtros: FiltrosListadoReportes;
  bloqueado?: boolean;
  mostrarOrden?: boolean;
  alCambiarFiltros: (filtros: FiltrosListadoReportes) => void;
  alLimpiar?: () => void;
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

function limpiarFiltro<TFiltros extends Record<string, unknown>>(
  filtros: TFiltros,
  campo: keyof TFiltros
) {
  const filtrosActualizados = { ...filtros };
  delete filtrosActualizados[campo];

  return filtrosActualizados;
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

  const cambiarFechaInicio = (evento: ChangeEvent<HTMLInputElement>) => {
    const valor = evento.target.value;

    if (!valor) {
      alCambiarFiltros(limpiarFiltro({ ...filtros, page: 1 }, 'startDate'));
      return;
    }

    alCambiarFiltros({ ...filtros, page: 1, startDate: valor });
  };

  const cambiarFechaFin = (evento: ChangeEvent<HTMLInputElement>) => {
    const valor = evento.target.value;

    if (!valor) {
      alCambiarFiltros(limpiarFiltro({ ...filtros, page: 1 }, 'endDate'));
      return;
    }

    alCambiarFiltros({ ...filtros, page: 1, endDate: valor });
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

  return (
    <Tarjeta
      titulo="Filtros de reportes"
      descripcion="Refina el listado por estado, prioridad, categoría o período."
    >
      <div className="filtrosReportes">
        <div className="filtrosReportes__grid">
          <label className="filtrosReportes__campo">
            <span>Categoría</span>
            <select value={filtros.category ?? ''} disabled={bloqueado} onChange={cambiarCategoria}>
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
            <select value={filtros.priority ?? ''} disabled={bloqueado} onChange={cambiarPrioridad}>
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

          {mostrarOrden ? (
            <>
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
            </>
          ) : null}
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