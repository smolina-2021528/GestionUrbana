import type { ChangeEvent } from 'react';

import { Boton } from '../../../shared/components/ui/Boton';
import { Tarjeta } from '../../../shared/components/ui/Tarjeta';
import {
  categoriasReporte,
  estadosReporte,
  prioridadesReporte,
  type CategoriaReporte,
  type EstadoReporte,
  type FiltrosHeatmapReportes as FiltrosHeatmapReportesTipo,
  type PrioridadReporte
} from '../types/reportesTipos';
import './filtrosHeatmapReportes.css';

type PropiedadesFiltrosHeatmapReportes = {
  activo: boolean;
  filtros: FiltrosHeatmapReportesTipo;
  totalPuntos?: number;
  bloqueado?: boolean;
  alCambiarActivo: (activo: boolean) => void;
  alCambiarFiltros: (filtros: FiltrosHeatmapReportesTipo) => void;
  alConsultar: () => void;
  alLimpiar: () => void;
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

function esCategoriaReporte(valor: string): valor is CategoriaReporte {
  return categoriasReporte.includes(valor as CategoriaReporte);
}

function esPrioridadReporte(valor: string): valor is PrioridadReporte {
  return prioridadesReporte.includes(valor as PrioridadReporte);
}

function esEstadoReporte(valor: string): valor is EstadoReporte {
  return estadosReporte.includes(valor as EstadoReporte);
}

function limpiarCampo<TFiltros extends Record<string, unknown>>(
  filtros: TFiltros,
  campo: keyof TFiltros
) {
  const filtrosActualizados = { ...filtros };
  delete filtrosActualizados[campo];

  return filtrosActualizados;
}

export function FiltrosHeatmapReportes({
  activo,
  filtros,
  totalPuntos = 0,
  bloqueado = false,
  alCambiarActivo,
  alCambiarFiltros,
  alConsultar,
  alLimpiar
}: PropiedadesFiltrosHeatmapReportes) {
  const cambiarCategoria = (evento: ChangeEvent<HTMLSelectElement>) => {
    const valor = evento.target.value;

    if (!esCategoriaReporte(valor)) {
      alCambiarFiltros(limpiarCampo(filtros, 'category'));
      return;
    }

    alCambiarFiltros({ ...filtros, category: valor });
  };

  const cambiarPrioridad = (evento: ChangeEvent<HTMLSelectElement>) => {
    const valor = evento.target.value;

    if (!esPrioridadReporte(valor)) {
      alCambiarFiltros(limpiarCampo(filtros, 'priority'));
      return;
    }

    alCambiarFiltros({ ...filtros, priority: valor });
  };

  const cambiarEstado = (evento: ChangeEvent<HTMLSelectElement>) => {
    const valor = evento.target.value;

    if (!esEstadoReporte(valor)) {
      alCambiarFiltros(limpiarCampo(filtros, 'status'));
      return;
    }

    alCambiarFiltros({ ...filtros, status: valor });
  };

  const cambiarFechaInicio = (evento: ChangeEvent<HTMLInputElement>) => {
    const valor = evento.target.value;

    if (!valor) {
      alCambiarFiltros(limpiarCampo(filtros, 'startDate'));
      return;
    }

    alCambiarFiltros({ ...filtros, startDate: valor });
  };

  const cambiarFechaFin = (evento: ChangeEvent<HTMLInputElement>) => {
    const valor = evento.target.value;

    if (!valor) {
      alCambiarFiltros(limpiarCampo(filtros, 'endDate'));
      return;
    }

    alCambiarFiltros({ ...filtros, endDate: valor });
  };

  return (
    <Tarjeta
      titulo="Intensidad territorial"
      descripcion="Activa la capa de intensidad para identificar concentración de incidencias según prioridad, estado, categoría y fechas."
      acciones={
        <span className={activo ? 'heatmapReportes__estado heatmapReportes__estado--activo' : 'heatmapReportes__estado'}>
          {activo ? `${new Intl.NumberFormat('es-GT').format(totalPuntos)} puntos activos` : 'Capa desactivada'}
        </span>
      }
    >
      <div className="heatmapReportes">
        <div className="heatmapReportes__interruptor">
          <div>
            <strong>Mostrar intensidad en el mapa</strong>
            <p>
              La capa se dibuja sobre la misma vista territorial usando los puntos reales del
              endpoint de heatmap.
            </p>
          </div>

          <button
            type="button"
            className={[
              'heatmapReportes__switch',
              activo ? 'heatmapReportes__switch--activo' : ''
            ]
              .filter(Boolean)
              .join(' ')}
            aria-pressed={activo}
            disabled={bloqueado}
            onClick={() => alCambiarActivo(!activo)}
          >
            <span>{activo ? 'Activa' : 'Inactiva'}</span>
          </button>
        </div>

        <div className="heatmapReportes__grid">
          <label className="heatmapReportes__campo">
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

          <label className="heatmapReportes__campo">
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

          <label className="heatmapReportes__campo">
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

          <label className="heatmapReportes__campo">
            <span>Desde</span>
            <input
              type="date"
              value={filtros.startDate ?? ''}
              disabled={bloqueado}
              onChange={cambiarFechaInicio}
            />
          </label>

          <label className="heatmapReportes__campo">
            <span>Hasta</span>
            <input
              type="date"
              value={filtros.endDate ?? ''}
              disabled={bloqueado}
              onChange={cambiarFechaFin}
            />
          </label>
        </div>

        <div className="heatmapReportes__acciones">
          <Boton variante="secundario" disabled={bloqueado} onClick={alLimpiar}>
            Limpiar intensidad
          </Boton>

          <Boton disabled={bloqueado || !activo} onClick={alConsultar}>
            Actualizar intensidad
          </Boton>
        </div>
      </div>
    </Tarjeta>
  );
}