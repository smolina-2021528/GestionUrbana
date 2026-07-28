import { textosSistema } from '../../../design/identity/textosSistema';
import { EstadoVacio } from '../../../shared/components/data/EstadoVacio';
import { Alerta } from '../../../shared/components/feedback/Alerta';
import { Cargando } from '../../../shared/components/feedback/Cargando';
import { Boton } from '../../../shared/components/ui/Boton';
import { Tarjeta } from '../../../shared/components/ui/Tarjeta';
import { esErrorApi } from '../../../shared/types/errorApi';
import {
  BloqueDistribucion,
  type ElementoDistribucionDashboard
} from '../components/BloqueDistribucion';
import { BloqueTendencia } from '../components/BloqueTendencia';
import { BloqueTransiciones } from '../components/BloqueTransiciones';
import { BloqueZonas } from '../components/BloqueZonas';
import {
  GridMetricasDashboard,
  type MetricaDashboard
} from '../components/GridMetricasDashboard';
import {
  ListaIndicadoresDashboard,
  type IndicadorDashboard
} from '../components/ListaIndicadoresDashboard';
import { usarEstadisticasDashboard } from '../hooks/usarEstadisticasDashboard';
import { usarTendenciasDashboard } from '../hooks/usarTendenciasDashboard';
import { usarTransicionesDashboard } from '../hooks/usarTransicionesDashboard';
import { usarZonasDashboard } from '../hooks/usarZonasDashboard';
import type { EstadisticasDashboard } from '../types/estadisticasTipos';
import './dashboardPagina.css';

function obtenerNumero(valor: unknown): number | null {
  return typeof valor === 'number' && Number.isFinite(valor) ? valor : null;
}

function valorParaSuma(valor: number | null): number {
  return valor ?? 0;
}

function sumarValores(valores: Array<number | null>): number {
  return valores.reduce<number>((total, valor) => total + valorParaSuma(valor), 0);
}

const formateadoresCache = new Map<string, Intl.NumberFormat>();

function obtenerFormateadorDecimal(decimales: number, minimumDigits: number) {
  const clave = `${decimales}-${minimumDigits}`;
  let formateador = formateadoresCache.get(clave);
  if (!formateador) {
    formateador = new Intl.NumberFormat('es-GT', {
      maximumFractionDigits: decimales,
      minimumFractionDigits: minimumDigits
    });
    formateadoresCache.set(clave, formateador);
  }
  return formateador;
}

function formatearDecimal(valor: number, decimales = 1): string {
  const minDigits = valor % 1 === 0 ? 0 : Math.min(decimales, 1);
  return obtenerFormateadorDecimal(decimales, minDigits).format(valor);
}

function formatearPorcentaje(valor: number | null): string | null {
  if (valor === null) {
    return null;
  }

  return `${formatearDecimal(valor)}%`;
}

function formatearHoras(valor: number | null): string | null {
  if (valor === null) {
    return null;
  }

  return `${formatearDecimal(valor)} h`;
}

function obtenerMensajeError(error: unknown): string {
  if (esErrorApi(error)) {
    return error.mensaje;
  }

  return 'No fue posible cargar los indicadores solicitados. Intenta nuevamente.';
}

function crearElementoDistribucion({
  id,
  etiqueta,
  valor,
  descripcion,
  detalle,
  tono
}: {
  id: string;
  etiqueta: string;
  valor: number | null;
  descripcion?: string;
  detalle?: string;
  tono?: ElementoDistribucionDashboard['tono'];
}): ElementoDistribucionDashboard | null {
  if (valor === null) {
    return null;
  }

  return {
    id,
    etiqueta,
    valor,
    descripcion,
    detalle,
    tono
  };
}

function filtrarElementoDistribucion(
  elemento: ElementoDistribucionDashboard | null
): elemento is ElementoDistribucionDashboard {
  return elemento !== null;
}

function obtenerResumenDashboard(estadisticas?: EstadisticasDashboard) {
  const totalDirecto = obtenerNumero(estadisticas?.overview?.total);

  const pendientes = obtenerNumero(estadisticas?.byStatus?.pendiente);
  const enProceso = obtenerNumero(estadisticas?.byStatus?.enProceso);
  const resueltos = obtenerNumero(estadisticas?.byStatus?.resuelto);
  const rechazados = obtenerNumero(estadisticas?.byStatus?.rechazado);

  const prioridadAlta = obtenerNumero(estadisticas?.byPriority?.alta);
  const prioridadMedia = obtenerNumero(estadisticas?.byPriority?.media);
  const prioridadBaja = obtenerNumero(estadisticas?.byPriority?.baja);

  const infraestructura = obtenerNumero(estadisticas?.byCategory?.infraestructura);
  const seguridad = obtenerNumero(estadisticas?.byCategory?.seguridad);
  const limpieza = obtenerNumero(estadisticas?.byCategory?.limpieza);

  const totalEstados = sumarValores([pendientes, enProceso, resueltos, rechazados]);
  const totalPrioridades = sumarValores([prioridadAlta, prioridadMedia, prioridadBaja]);
  const totalCategorias = sumarValores([infraestructura, seguridad, limpieza]);

  const totalCalculado = Math.max(totalEstados, totalPrioridades, totalCategorias);
  const totalReportes = totalDirecto ?? totalCalculado;

  return {
    totalReportes,
    pendientes,
    enProceso,
    resueltos,
    rechazados,
    prioridadAlta,
    prioridadMedia,
    prioridadBaja,
    infraestructura,
    seguridad,
    limpieza,
    tasaResolucion: obtenerNumero(estadisticas?.overview?.resolutionRate),
    promedioResolucionHoras: obtenerNumero(estadisticas?.overview?.avgResolutionHours),
    conUbicacion: obtenerNumero(estadisticas?.location?.withLocation),
    sinUbicacion: obtenerNumero(estadisticas?.location?.withoutLocation),
    coberturaUbicacion: obtenerNumero(estadisticas?.location?.coveragePercent),
    comentariosPublicos: obtenerNumero(estadisticas?.engagement?.totalPublicComments),
    seguidoresActivos: obtenerNumero(estadisticas?.engagement?.totalActiveFollowers),
    tieneDatos:
      totalReportes > 0 || totalEstados > 0 || totalPrioridades > 0 || totalCategorias > 0
  };
}

export function DashboardPagina() {
  const consultaEstadisticas = usarEstadisticasDashboard();
  const consultaTendencias = usarTendenciasDashboard({ groupBy: 'day' });
  const consultaZonas = usarZonasDashboard({ radius: 1000, limit: 5 });
  const consultaTransiciones = usarTransicionesDashboard();

  const respuestaEstadisticas = consultaEstadisticas.data;
  const estadisticas =
    respuestaEstadisticas?.success === true ? respuestaEstadisticas.data : undefined;

  const respuestaTendencias = consultaTendencias.data;
  const tendencias =
    respuestaTendencias?.success === true ? respuestaTendencias.data : undefined;

  const respuestaZonas = consultaZonas.data;
  const zonas = respuestaZonas?.success === true ? respuestaZonas.data : undefined;

  const respuestaTransiciones = consultaTransiciones.data;
  const transiciones =
    respuestaTransiciones?.success === true ? respuestaTransiciones.data : undefined;

  const mensajeRespuestaFallida =
    respuestaEstadisticas?.success === false ? respuestaEstadisticas.message : undefined;

  const mensajeErrorTendencias =
    consultaTendencias.error !== null
      ? obtenerMensajeError(consultaTendencias.error)
      : respuestaTendencias?.success === false
        ? respuestaTendencias.message
        : undefined;

  const mensajeErrorZonas =
    consultaZonas.error !== null
      ? obtenerMensajeError(consultaZonas.error)
      : respuestaZonas?.success === false
        ? respuestaZonas.message
        : undefined;

  const mensajeErrorTransiciones =
    consultaTransiciones.error !== null
      ? obtenerMensajeError(consultaTransiciones.error)
      : respuestaTransiciones?.success === false
        ? respuestaTransiciones.message
        : undefined;

  const resumen = obtenerResumenDashboard(estadisticas);

  const mensajeError =
    consultaEstadisticas.error !== null
      ? obtenerMensajeError(consultaEstadisticas.error)
      : mensajeRespuestaFallida;

  const estaCargando = consultaEstadisticas.isLoading;
  const estaActualizando = consultaEstadisticas.isFetching && !consultaEstadisticas.isLoading;

  const manejarActualizar = () => {
    void consultaEstadisticas.refetch();
    void consultaTendencias.refetch();
    void consultaZonas.refetch();
    void consultaTransiciones.refetch();
  };

  const metricasPrincipales: MetricaDashboard[] = [
    {
      id: 'total-reportes',
      etiqueta: 'Reportes registrados',
      valor: resumen.totalReportes,
      descripcion: 'Incidencias urbanas recibidas por la plataforma.',
      tono: 'principal'
    },
    {
      id: 'reportes-pendientes',
      etiqueta: 'Pendientes',
      valor: resumen.pendientes,
      descripcion: 'Reportes recibidos que aún requieren atención.',
      tono: 'pendiente'
    },
    {
      id: 'reportes-en-proceso',
      etiqueta: 'En proceso',
      valor: resumen.enProceso,
      descripcion: 'Casos actualmente gestionados por el equipo.',
      tono: 'enProceso'
    },
    {
      id: 'reportes-resueltos',
      etiqueta: 'Resueltos',
      valor: resumen.resueltos,
      descripcion: 'Incidencias finalizadas correctamente.',
      tono: 'resuelto'
    },
    {
      id: 'reportes-rechazados',
      etiqueta: 'Rechazados',
      valor: resumen.rechazados,
      descripcion: 'Reportes cerrados sin avance operativo.',
      tono: 'rechazado'
    },
    {
      id: 'tasa-resolucion',
      etiqueta: 'Tasa de resolución',
      valor: formatearPorcentaje(resumen.tasaResolucion),
      descripcion: 'Proporción de reportes finalizados sobre el total.',
      tono: 'exito'
    },
    {
      id: 'tiempo-promedio-resolucion',
      etiqueta: 'Tiempo promedio',
      valor: formatearHoras(resumen.promedioResolucionHoras),
      descripcion: 'Promedio de horas para resolver incidencias.',
      tono: 'neutro'
    }
  ];

  const distribucionEstados = [
    crearElementoDistribucion({
      id: 'pendiente',
      etiqueta: 'Pendiente',
      valor: resumen.pendientes,
      descripcion: 'Reportes recibidos sin cierre operativo.',
      tono: 'pendiente'
    }),
    crearElementoDistribucion({
      id: 'en-proceso',
      etiqueta: 'En proceso',
      valor: resumen.enProceso,
      descripcion: 'Reportes actualmente en atención.',
      tono: 'enProceso'
    }),
    crearElementoDistribucion({
      id: 'resuelto',
      etiqueta: 'Resuelto',
      valor: resumen.resueltos,
      descripcion: 'Casos finalizados correctamente.',
      tono: 'resuelto'
    }),
    crearElementoDistribucion({
      id: 'rechazado',
      etiqueta: 'Rechazado',
      valor: resumen.rechazados,
      descripcion: 'Reportes cerrados sin resolución operativa.',
      tono: 'rechazado'
    })
  ].filter(filtrarElementoDistribucion);

  const distribucionPrioridades = [
    crearElementoDistribucion({
      id: 'alta',
      etiqueta: 'Alta',
      valor: resumen.prioridadAlta,
      descripcion: 'Incidencias que requieren mayor atención.',
      tono: 'prioridadAlta'
    }),
    crearElementoDistribucion({
      id: 'media',
      etiqueta: 'Media',
      valor: resumen.prioridadMedia,
      descripcion: 'Reportes de prioridad operativa intermedia.',
      tono: 'prioridadMedia'
    }),
    crearElementoDistribucion({
      id: 'baja',
      etiqueta: 'Baja',
      valor: resumen.prioridadBaja,
      descripcion: 'Casos registrados con menor urgencia.',
      tono: 'prioridadBaja'
    })
  ].filter(filtrarElementoDistribucion);

  const distribucionCategorias = [
    crearElementoDistribucion({
      id: 'infraestructura',
      etiqueta: 'Infraestructura',
      valor: resumen.infraestructura,
      descripcion: 'Problemas relacionados con entorno físico urbano.',
      tono: 'principal'
    }),
    crearElementoDistribucion({
      id: 'seguridad',
      etiqueta: 'Seguridad',
      valor: resumen.seguridad,
      descripcion: 'Reportes vinculados a condiciones de riesgo.',
      tono: 'advertencia'
    }),
    crearElementoDistribucion({
      id: 'limpieza',
      etiqueta: 'Limpieza',
      valor: resumen.limpieza,
      descripcion: 'Incidencias asociadas a residuos o aseo urbano.',
      tono: 'exito'
    })
  ].filter(filtrarElementoDistribucion);

  const indicadoresOperativos: IndicadorDashboard[] = [
    {
      id: 'con-ubicacion',
      etiqueta: 'Reportes con ubicación',
      valor: resumen.conUbicacion,
      descripcion: 'Casos que incluyen coordenadas o referencia geográfica.',
      tono: 'principal'
    },
    {
      id: 'sin-ubicacion',
      etiqueta: 'Reportes sin ubicación',
      valor: resumen.sinUbicacion,
      descripcion: 'Casos que requieren completar información territorial.',
      tono: 'advertencia'
    },
    {
      id: 'cobertura-ubicacion',
      etiqueta: 'Cobertura de ubicación',
      valor: formatearPorcentaje(resumen.coberturaUbicacion),
      descripcion: 'Porcentaje de reportes con información geográfica.',
      tono: 'exito'
    },
    {
      id: 'comentarios-publicos',
      etiqueta: 'Comentarios ciudadanos',
      valor: resumen.comentariosPublicos,
      descripcion: 'Interacciones públicas registradas en reportes.',
      tono: 'neutro'
    },
    {
      id: 'seguidores-activos',
      etiqueta: 'Seguimientos activos',
      valor: resumen.seguidoresActivos,
      descripcion: 'Usuarios que siguen actualizaciones de reportes.',
      tono: 'principal'
    }
  ];

  return (
    <div className="paginaTemporal dashboardPagina">
      <section className="dashboardPagina__encabezado">
        <div>
          <span className="etiquetaInicial">Centro operativo</span>
          <h2>{textosSistema.dashboard.titulo}</h2>
          <p>{textosSistema.dashboard.descripcion}</p>
        </div>

        <div className="dashboardPagina__acciones">
          {estaActualizando ? <Cargando texto="Actualizando indicadores..." compacto /> : null}

          <Boton
            variante="secundario"
            disabled={
              consultaEstadisticas.isFetching ||
              consultaTendencias.isFetching ||
              consultaZonas.isFetching ||
              consultaTransiciones.isFetching
            }
            onClick={manejarActualizar}
          >
            Actualizar indicadores
          </Boton>
        </div>
      </section>

      {estaCargando ? (
        <Tarjeta className="dashboardPagina__panelCarga">
          <Cargando texto="Cargando indicadores operativos..." />
        </Tarjeta>
      ) : null}

      {!estaCargando && mensajeError && !estadisticas ? (
        <Alerta variante="error" titulo="No se pudieron cargar las estadísticas">
          <div className="dashboardPagina__alertaContenido">
            <p>{mensajeError}</p>
            <Boton variante="secundario" onClick={manejarActualizar}>
              Reintentar
            </Boton>
          </div>
        </Alerta>
      ) : null}

      {!estaCargando && !mensajeError && !resumen.tieneDatos ? (
        <EstadoVacio
          titulo="Aún no hay reportes registrados"
          descripcion="Cuando existan reportes urbanos, el dashboard mostrará indicadores operativos y distribuciones reales."
          accion={
            <Boton variante="secundario" onClick={manejarActualizar}>
              Actualizar indicadores
            </Boton>
          }
        />
      ) : null}

      {!estaCargando && resumen.tieneDatos ? (
        <div className="dashboardPagina__contenido">
          {mensajeError ? (
            <Alerta variante="advertencia" titulo="Los datos mostrados pueden no estar actualizados">
              <p>{mensajeError}</p>
            </Alerta>
          ) : null}

          <GridMetricasDashboard metricas={metricasPrincipales} />

          <section className="dashboardPagina__gridDistribuciones">
            <BloqueDistribucion
              titulo="Distribución por estado"
              descripcion="Avance operativo de los reportes registrados."
              elementos={distribucionEstados}
              total={resumen.totalReportes}
              etiquetaTotal="Reportes"
            />

            <BloqueDistribucion
              titulo="Distribución por prioridad"
              descripcion="Nivel de urgencia asignado a las incidencias."
              elementos={distribucionPrioridades}
              total={resumen.totalReportes}
              etiquetaTotal="Reportes"
            />

            <BloqueDistribucion
              titulo="Distribución por categoría"
              descripcion="Clasificación principal de los problemas urbanos."
              elementos={distribucionCategorias}
              total={resumen.totalReportes}
              etiquetaTotal="Reportes"
            />

            <ListaIndicadoresDashboard
              titulo="Indicadores operativos"
              descripcion="Datos complementarios para evaluar cobertura, participación y seguimiento."
              indicadores={indicadoresOperativos}
            />
          </section>

          <section className="dashboardPagina__gridDistribuciones">
            <BloqueTendencia
              tendencias={tendencias}
              cargando={consultaTendencias.isLoading}
              mensajeError={mensajeErrorTendencias}
            />

            <BloqueZonas
              zonas={zonas}
              cargando={consultaZonas.isLoading}
              mensajeError={mensajeErrorZonas}
            />

            <BloqueTransiciones
              transiciones={transiciones}
              cargando={consultaTransiciones.isLoading}
              mensajeError={mensajeErrorTransiciones}
            />
          </section>
        </div>
      ) : null}
    </div>
  );
}