import type { ChangeEvent, FormEvent } from 'react';

import { Boton } from '../../../shared/components/ui/Boton';
import { Tarjeta } from '../../../shared/components/ui/Tarjeta';
import {
  categoriasReporte,
  estadosReporte,
  type CategoriaReporte,
  type EstadoReporte,
  type FiltrosBoundingBoxReportes,
  type FiltrosReportesCercanos
} from '../types/reportesTipos';
import './filtrosMapaReportes.css';

export type ModoConsultaMapaReportes = 'CERCANOS' | 'AREA';

type PropiedadesFiltrosMapaReportes = {
  modo: ModoConsultaMapaReportes;
  filtrosCercanos: FiltrosReportesCercanos;
  filtrosArea: FiltrosBoundingBoxReportes;
  bloqueado?: boolean;
  solicitandoUbicacion?: boolean;
  alCambiarModo: (modo: ModoConsultaMapaReportes) => void;
  alCambiarFiltrosCercanos: (filtros: FiltrosReportesCercanos) => void;
  alCambiarFiltrosArea: (filtros: FiltrosBoundingBoxReportes) => void;
  alConsultar: () => void;
  alLimpiar: () => void;
  alUsarUbicacionActual?: () => void;
};

const etiquetasCategoria: Record<CategoriaReporte, string> = {
  INFRAESTRUCTURA: 'Infraestructura',
  SEGURIDAD: 'Seguridad',
  LIMPIEZA: 'Limpieza'
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

function esEstadoReporte(valor: string): valor is EstadoReporte {
  return estadosReporte.includes(valor as EstadoReporte);
}

function obtenerNumeroCampo(evento: ChangeEvent<HTMLInputElement>, valorAnterior: number) {
  const valor = Number(evento.target.value);

  return Number.isFinite(valor) ? valor : valorAnterior;
}

function limpiarCampo<TFiltros extends Record<string, unknown>>(
  filtros: TFiltros,
  campo: keyof TFiltros
) {
  const filtrosActualizados = { ...filtros };
  delete filtrosActualizados[campo];

  return filtrosActualizados;
}

export function FiltrosMapaReportes({
  modo,
  filtrosCercanos,
  filtrosArea,
  bloqueado = false,
  solicitandoUbicacion = false,
  alCambiarModo,
  alCambiarFiltrosCercanos,
  alCambiarFiltrosArea,
  alConsultar,
  alLimpiar,
  alUsarUbicacionActual
}: PropiedadesFiltrosMapaReportes) {
  const cambiarModo = (nuevoModo: ModoConsultaMapaReportes) => {
    alCambiarModo(nuevoModo);
  };

  const consultar = (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    alConsultar();
  };

  const cambiarCategoriaCercanos = (evento: ChangeEvent<HTMLSelectElement>) => {
    const valor = evento.target.value;

    if (!esCategoriaReporte(valor)) {
      alCambiarFiltrosCercanos(limpiarCampo({ ...filtrosCercanos, page: 1 }, 'category'));
      return;
    }

    alCambiarFiltrosCercanos({ ...filtrosCercanos, page: 1, category: valor });
  };

  const cambiarEstadoCercanos = (evento: ChangeEvent<HTMLSelectElement>) => {
    const valor = evento.target.value;

    if (!esEstadoReporte(valor)) {
      alCambiarFiltrosCercanos(limpiarCampo({ ...filtrosCercanos, page: 1 }, 'status'));
      return;
    }

    alCambiarFiltrosCercanos({ ...filtrosCercanos, page: 1, status: valor });
  };

  const cambiarCategoriaArea = (evento: ChangeEvent<HTMLSelectElement>) => {
    const valor = evento.target.value;

    if (!esCategoriaReporte(valor)) {
      alCambiarFiltrosArea(limpiarCampo(filtrosArea, 'category'));
      return;
    }

    alCambiarFiltrosArea({ ...filtrosArea, category: valor });
  };

  const cambiarEstadoArea = (evento: ChangeEvent<HTMLSelectElement>) => {
    const valor = evento.target.value;

    if (!esEstadoReporte(valor)) {
      alCambiarFiltrosArea(limpiarCampo(filtrosArea, 'status'));
      return;
    }

    alCambiarFiltrosArea({ ...filtrosArea, status: valor });
  };

  return (
    <Tarjeta
      titulo="Consulta territorial"
      descripcion="Consulta reportes cercanos o define un área por coordenadas para visualizar incidencias urbanas."
    >
      <form className="filtrosMapaReportes" onSubmit={consultar}>
        <div className="filtrosMapaReportes__modos" role="group" aria-label="Tipo de consulta">
          <button
            type="button"
            className={[
              'filtrosMapaReportes__modo',
              modo === 'CERCANOS' ? 'filtrosMapaReportes__modo--activo' : ''
            ]
              .filter(Boolean)
              .join(' ')}
            disabled={bloqueado}
            onClick={() => cambiarModo('CERCANOS')}
          >
            Reportes cercanos
          </button>

          <button
            type="button"
            className={[
              'filtrosMapaReportes__modo',
              modo === 'AREA' ? 'filtrosMapaReportes__modo--activo' : ''
            ]
              .filter(Boolean)
              .join(' ')}
            disabled={bloqueado}
            onClick={() => cambiarModo('AREA')}
          >
            Área geográfica
          </button>
        </div>

        {modo === 'CERCANOS' ? (
          <div className="filtrosMapaReportes__grid">
            <label className="filtrosMapaReportes__campo">
              <span>Latitud centro</span>
              <input
                type="number"
                step="0.000001"
                min="-90"
                max="90"
                value={filtrosCercanos.lat}
                disabled={bloqueado}
                onChange={(evento) =>
                  alCambiarFiltrosCercanos({
                    ...filtrosCercanos,
                    page: 1,
                    lat: obtenerNumeroCampo(evento, filtrosCercanos.lat)
                  })
                }
              />
            </label>

            <label className="filtrosMapaReportes__campo">
              <span>Longitud centro</span>
              <input
                type="number"
                step="0.000001"
                min="-180"
                max="180"
                value={filtrosCercanos.lng}
                disabled={bloqueado}
                onChange={(evento) =>
                  alCambiarFiltrosCercanos({
                    ...filtrosCercanos,
                    page: 1,
                    lng: obtenerNumeroCampo(evento, filtrosCercanos.lng)
                  })
                }
              />
            </label>

            <label className="filtrosMapaReportes__campo">
              <span>Radio en metros</span>
              <input
                type="number"
                step="50"
                min="50"
                max="50000"
                value={filtrosCercanos.radius ?? 3000}
                disabled={bloqueado}
                onChange={(evento) =>
                  alCambiarFiltrosCercanos({
                    ...filtrosCercanos,
                    page: 1,
                    radius: obtenerNumeroCampo(evento, filtrosCercanos.radius ?? 3000)
                  })
                }
              />
            </label>

            <label className="filtrosMapaReportes__campo">
              <span>Categoría</span>
              <select
                value={filtrosCercanos.category ?? ''}
                disabled={bloqueado}
                onChange={cambiarCategoriaCercanos}
              >
                <option value="">Todas</option>
                {categoriasReporte.map((categoria) => (
                  <option key={categoria} value={categoria}>
                    {etiquetasCategoria[categoria]}
                  </option>
                ))}
              </select>
            </label>

            <label className="filtrosMapaReportes__campo">
              <span>Estado</span>
              <select
                value={filtrosCercanos.status ?? ''}
                disabled={bloqueado}
                onChange={cambiarEstadoCercanos}
              >
                <option value="">Todos</option>
                {estadosReporte.map((estado) => (
                  <option key={estado} value={estado}>
                    {etiquetasEstado[estado]}
                  </option>
                ))}
              </select>
            </label>

            <label className="filtrosMapaReportes__campo">
              <span>Límite</span>
              <input
                type="number"
                step="1"
                min="1"
                max="50"
                value={filtrosCercanos.limit ?? 20}
                disabled={bloqueado}
                onChange={(evento) =>
                  alCambiarFiltrosCercanos({
                    ...filtrosCercanos,
                    page: 1,
                    limit: obtenerNumeroCampo(evento, filtrosCercanos.limit ?? 20)
                  })
                }
              />
            </label>
          </div>
        ) : (
          <div className="filtrosMapaReportes__grid filtrosMapaReportes__grid--area">
            <label className="filtrosMapaReportes__campo">
              <span>Latitud suroeste</span>
              <input
                type="number"
                step="0.000001"
                min="-90"
                max="90"
                value={filtrosArea.swLat}
                disabled={bloqueado}
                onChange={(evento) =>
                  alCambiarFiltrosArea({
                    ...filtrosArea,
                    swLat: obtenerNumeroCampo(evento, filtrosArea.swLat)
                  })
                }
              />
            </label>

            <label className="filtrosMapaReportes__campo">
              <span>Longitud suroeste</span>
              <input
                type="number"
                step="0.000001"
                min="-180"
                max="180"
                value={filtrosArea.swLng}
                disabled={bloqueado}
                onChange={(evento) =>
                  alCambiarFiltrosArea({
                    ...filtrosArea,
                    swLng: obtenerNumeroCampo(evento, filtrosArea.swLng)
                  })
                }
              />
            </label>

            <label className="filtrosMapaReportes__campo">
              <span>Latitud noreste</span>
              <input
                type="number"
                step="0.000001"
                min="-90"
                max="90"
                value={filtrosArea.neLat}
                disabled={bloqueado}
                onChange={(evento) =>
                  alCambiarFiltrosArea({
                    ...filtrosArea,
                    neLat: obtenerNumeroCampo(evento, filtrosArea.neLat)
                  })
                }
              />
            </label>

            <label className="filtrosMapaReportes__campo">
              <span>Longitud noreste</span>
              <input
                type="number"
                step="0.000001"
                min="-180"
                max="180"
                value={filtrosArea.neLng}
                disabled={bloqueado}
                onChange={(evento) =>
                  alCambiarFiltrosArea({
                    ...filtrosArea,
                    neLng: obtenerNumeroCampo(evento, filtrosArea.neLng)
                  })
                }
              />
            </label>

            <label className="filtrosMapaReportes__campo">
              <span>Categoría</span>
              <select
                value={filtrosArea.category ?? ''}
                disabled={bloqueado}
                onChange={cambiarCategoriaArea}
              >
                <option value="">Todas</option>
                {categoriasReporte.map((categoria) => (
                  <option key={categoria} value={categoria}>
                    {etiquetasCategoria[categoria]}
                  </option>
                ))}
              </select>
            </label>

            <label className="filtrosMapaReportes__campo">
              <span>Estado</span>
              <select
                value={filtrosArea.status ?? ''}
                disabled={bloqueado}
                onChange={cambiarEstadoArea}
              >
                <option value="">Todos</option>
                {estadosReporte.map((estado) => (
                  <option key={estado} value={estado}>
                    {etiquetasEstado[estado]}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}

        <div className="filtrosMapaReportes__acciones">
          {modo === 'CERCANOS' && alUsarUbicacionActual ? (
            <Boton
              variante="fantasma"
              disabled={bloqueado || solicitandoUbicacion}
              onClick={alUsarUbicacionActual}
            >
              {solicitandoUbicacion ? 'Obteniendo ubicación...' : 'Usar mi ubicación'}
            </Boton>
          ) : null}

          <Boton variante="secundario" disabled={bloqueado} onClick={alLimpiar}>
            Restablecer
          </Boton>

          <Boton type="submit" disabled={bloqueado}>
            Consultar mapa
          </Boton>
        </div>
      </form>
    </Tarjeta>
  );
}