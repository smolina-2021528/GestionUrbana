import { Link } from 'react-router-dom';

import { rutasAplicacion } from '../../../config/constantesSistema';
import { EstadoVacio } from '../../../shared/components/data/EstadoVacio';
import { Alerta } from '../../../shared/components/feedback/Alerta';
import { Cargando } from '../../../shared/components/feedback/Cargando';
import { Boton } from '../../../shared/components/ui/Boton';
import { Tarjeta } from '../../../shared/components/ui/Tarjeta';
import { esErrorApi } from '../../../shared/types/errorApi';
import { usarReportesSimilares } from '../hooks/usarReportesIa';
import type { EstadoReporte, PrioridadReporte, CategoriaReporte } from '../types/reportesTipos';
import './reportesSimilares.css';

type PropiedadesReportesSimilares = {
  reporteId: string;
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

function obtenerMensajeError(error: unknown) {
  if (esErrorApi(error)) {
    return error.mensaje;
  }

  return 'No fue posible cargar los reportes similares. Intenta nuevamente.';
}

function obtenerMensajeRespuestaFallida(mensaje?: string, error?: string) {
  return mensaje ?? error ?? 'No fue posible cargar los reportes similares. Intenta nuevamente.';
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

  const fechaValida = new Date(fecha);

  if (Number.isNaN(fechaValida.getTime())) {
    return 'Fecha no disponible';
  }

  return new Intl.DateTimeFormat('es-GT', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(fechaValida);
}

export function ReportesSimilares({ reporteId }: PropiedadesReportesSimilares) {
  const consultaSimilares = usarReportesSimilares(reporteId, {
    limit: 5
  });

  const respuesta = consultaSimilares.data;
  const datos = respuesta?.success === true ? respuesta.data : undefined;
  const similares = datos?.similar ?? [];

  const mensajeRespuestaFallida =
    respuesta?.success === false
      ? obtenerMensajeRespuestaFallida(respuesta.message, respuesta.error)
      : undefined;

  const mensajeError =
    consultaSimilares.error !== null
      ? obtenerMensajeError(consultaSimilares.error)
      : mensajeRespuestaFallida;

  const actualizar = () => {
    void consultaSimilares.refetch();
  };

  return (
    <Tarjeta
      titulo="Reportes similares"
      descripcion="Incidencias relacionadas que pueden ayudar a entender si el caso ya fue reportado o si forma parte de un patrón urbano."
      acciones={
        <Boton
          variante="secundario"
          tamano="sm"
          disabled={consultaSimilares.isFetching}
          onClick={actualizar}
        >
          {consultaSimilares.isFetching ? 'Actualizando...' : 'Actualizar'}
        </Boton>
      }
      className="reportesSimilares"
    >
      <div className="reportesSimilares__contenido">
        {consultaSimilares.isLoading ? (
          <div className="reportesSimilares__estado">
            <Cargando texto="Buscando reportes similares..." compacto />
          </div>
        ) : null}

        {mensajeError ? (
          <Alerta variante="advertencia" titulo="No se pudieron cargar reportes similares">
            <div className="reportesSimilares__alerta">
              <p>{mensajeError}</p>

              <Boton variante="secundario" tamano="sm" onClick={actualizar}>
                Reintentar
              </Boton>
            </div>
          </Alerta>
        ) : null}

        {!consultaSimilares.isLoading && !mensajeError && similares.length === 0 ? (
          <EstadoVacio
            titulo="Sin reportes similares"
            descripcion="No se encontraron incidencias relacionadas para este reporte."
          />
        ) : null}

        {similares.length > 0 ? (
          <>
            <div className="reportesSimilares__resumen">
              <article>
                <span>Base de comparación</span>
                <strong>{datos?.baseReport?.title ?? 'Reporte actual'}</strong>
              </article>

              <article>
                <span>Coincidencias</span>
                <strong>{similares.length}</strong>
              </article>

              <article>
                <span>Umbral aplicado</span>
                <strong>
                  {respuesta?.success === true && respuesta.meta?.threshold !== undefined
                    ? formatearPorcentaje(respuesta.meta.threshold)
                    : 'No disponible'}
                </strong>
              </article>
            </div>

            <div className="reportesSimilares__lista">
              {similares.map((reporte) => (
                <article key={reporte.id} className="reportesSimilares__item">
                  <div className="reportesSimilares__itemEncabezado">
                    <div>
                      <span className="reportesSimilares__etiqueta">
                        {reporte.similarity.label}
                      </span>
                      <h3>{reporte.title}</h3>
                    </div>

                    <strong className="reportesSimilares__porcentaje">
                      {formatearPorcentaje(reporte.similarity.score)}
                    </strong>
                  </div>

                  <p>{reporte.description}</p>

                  <dl className="reportesSimilares__datos">
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

                  {reporte.similarity.isDuplicate ? (
                    <Alerta variante="advertencia" titulo="Coincidencia de alta similitud">
                      <p>
                        Este reporte puede representar el mismo problema o una incidencia muy
                        relacionada.
                      </p>
                    </Alerta>
                  ) : null}

                  <div className="reportesSimilares__acciones">
                    <Link to={`${rutasAplicacion.reportes}/${encodeURIComponent(reporte.id)}`}>
                      Abrir reporte
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </>
        ) : null}
      </div>
    </Tarjeta>
  );
}