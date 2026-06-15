import { useMemo, useState } from 'react';

import { EstadoVacio } from '../../../shared/components/data/EstadoVacio';
import { Alerta } from '../../../shared/components/feedback/Alerta';
import { Cargando } from '../../../shared/components/feedback/Cargando';
import { Boton } from '../../../shared/components/ui/Boton';
import { InsigniaEstado } from '../../../shared/components/ui/InsigniaEstado';
import { InsigniaPrioridad } from '../../../shared/components/ui/InsigniaPrioridad';
import { Tarjeta } from '../../../shared/components/ui/Tarjeta';
import { esErrorApi } from '../../../shared/types/errorApi';
import { usarReportesSeguidos } from '../hooks/usarReportesSeguidos';
import {
  categoriasReporte,
  estadosReporte,
  prioridadesReporte,
  type CategoriaReporte,
  type EstadoReporte,
  type PrioridadReporte
} from '../types/reportesTipos';
import type { ReporteSeguido } from '../types/interaccionesReporteTipos';
import './reportesSeguidos.css';

type PropiedadesReportesSeguidos = {
  alVerDetalle: (reporteId: string) => void;
};

const LIMITE_REPORTES_SEGUIDOS = 5;

const etiquetasCategoria: Record<CategoriaReporte, string> = {
  INFRAESTRUCTURA: 'Infraestructura',
  SEGURIDAD: 'Seguridad',
  LIMPIEZA: 'Limpieza'
};

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

function obtenerMensajeError(error: unknown) {
  if (esErrorApi(error)) {
    return error.mensaje;
  }

  return 'No fue posible cargar los reportes seguidos. Intenta nuevamente.';
}

function obtenerMensajeRespuestaFallida(mensaje?: string, error?: string) {
  return mensaje ?? error ?? 'No fue posible cargar los reportes seguidos. Intenta nuevamente.';
}

function esCategoriaReporte(valor: string): valor is CategoriaReporte {
  return categoriasReporte.includes(valor as CategoriaReporte);
}

function esEstadoReporte(valor: string): valor is EstadoReporte {
  return estadosReporte.includes(valor as EstadoReporte);
}

function esPrioridadReporte(valor: string): valor is PrioridadReporte {
  return prioridadesReporte.includes(valor as PrioridadReporte);
}

function obtenerEtiquetaCategoria(categoria: string) {
  return esCategoriaReporte(categoria) ? etiquetasCategoria[categoria] : 'Categoría no disponible';
}

function obtenerTotalMostrado(total: number) {
  return new Intl.NumberFormat('es-GT').format(total);
}

function TarjetaReporteSeguido({
  reporte,
  alVerDetalle
}: {
  reporte: ReporteSeguido;
  alVerDetalle: (reporteId: string) => void;
}) {
  const categoria = obtenerEtiquetaCategoria(reporte.category);
  const fechaCreacion = formatearFecha(reporte.createdAt);

  return (
    <article className="tarjetaReporteSeguido">
      <div className="tarjetaReporteSeguido__contenido">
        <header className="tarjetaReporteSeguido__encabezado">
          <div className="tarjetaReporteSeguido__tituloGrupo">
            <span className="tarjetaReporteSeguido__categoria">{categoria}</span>
            <h3>{reporte.title || 'Reporte sin título'}</h3>
          </div>

          <div className="tarjetaReporteSeguido__insignias">
            {esEstadoReporte(reporte.status) ? (
              <InsigniaEstado estado={reporte.status} />
            ) : (
              <span className="tarjetaReporteSeguido__etiquetaSimple">Estado no disponible</span>
            )}

            {esPrioridadReporte(reporte.priority) ? (
              <InsigniaPrioridad prioridad={reporte.priority} />
            ) : (
              <span className="tarjetaReporteSeguido__etiquetaSimple">
                Prioridad no disponible
              </span>
            )}
          </div>
        </header>

        <footer className="tarjetaReporteSeguido__pie">
          <span>Creado el {fechaCreacion}</span>

          <Boton variante="secundario" tamano="sm" onClick={() => alVerDetalle(reporte.id)}>
            Ver detalle
          </Boton>
        </footer>
      </div>
    </article>
  );
}

export function ReportesSeguidos({ alVerDetalle }: PropiedadesReportesSeguidos) {
  const [pagina, setPagina] = useState(1);

  const filtrosReportesSeguidos = useMemo(
    () => ({
      page: pagina,
      limit: LIMITE_REPORTES_SEGUIDOS
    }),
    [pagina]
  );

  const consultaReportesSeguidos = usarReportesSeguidos(filtrosReportesSeguidos);

  const respuestaReportesSeguidos = consultaReportesSeguidos.data;
  const reportesSeguidos =
    respuestaReportesSeguidos?.success === true ? respuestaReportesSeguidos.data ?? [] : [];
  const paginacion =
    respuestaReportesSeguidos?.success === true
      ? respuestaReportesSeguidos.pagination
      : undefined;

  const mensajeRespuestaFallida =
    respuestaReportesSeguidos?.success === false
      ? obtenerMensajeRespuestaFallida(
          respuestaReportesSeguidos.message,
          respuestaReportesSeguidos.error
        )
      : undefined;

  const mensajeError =
    consultaReportesSeguidos.error !== null
      ? obtenerMensajeError(consultaReportesSeguidos.error)
      : mensajeRespuestaFallida;

  const estaCargando = consultaReportesSeguidos.isLoading;
  const estaActualizando =
    consultaReportesSeguidos.isFetching && !consultaReportesSeguidos.isLoading;

  const paginaActual = paginacion?.page ?? pagina;
  const totalPaginas = paginacion?.totalPages ?? 1;
  const totalReportes = paginacion?.total ?? reportesSeguidos.length;
  const puedeIrAnterior = paginaActual > 1;
  const puedeIrSiguiente = paginaActual < totalPaginas;

  const actualizarReportesSeguidos = () => {
    void consultaReportesSeguidos.refetch();
  };

  const irPaginaAnterior = () => {
    if (!puedeIrAnterior) {
      return;
    }

    setPagina((paginaActualEstado) => Math.max(paginaActualEstado - 1, 1));
  };

  const irPaginaSiguiente = () => {
    if (!puedeIrSiguiente) {
      return;
    }

    setPagina((paginaActualEstado) => Math.min(paginaActualEstado + 1, totalPaginas));
  };

  return (
    <Tarjeta
      titulo="Reportes seguidos"
      descripcion="Reportes que estás monitoreando para recibir actualizaciones y revisar su avance."
      acciones={
        <Boton
          variante="fantasma"
          disabled={consultaReportesSeguidos.isFetching}
          onClick={actualizarReportesSeguidos}
        >
          {consultaReportesSeguidos.isFetching ? 'Actualizando...' : 'Actualizar'}
        </Boton>
      }
    >
      <section className="reportesSeguidos" aria-label="Reportes seguidos">
        {estaActualizando ? (
          <div className="reportesSeguidos__actualizando">Actualizando reportes seguidos...</div>
        ) : null}

        {estaCargando ? (
          <div className="reportesSeguidos__estado">
            <Cargando texto="Cargando reportes seguidos..." />
          </div>
        ) : null}

        {!estaCargando && mensajeError ? (
          <Alerta variante="error" titulo="No se pudieron cargar los reportes seguidos">
            <div className="reportesSeguidos__alerta">
              <p>{mensajeError}</p>

              <Boton variante="secundario" tamano="sm" onClick={actualizarReportesSeguidos}>
                Reintentar
              </Boton>
            </div>
          </Alerta>
        ) : null}

        {!estaCargando && !mensajeError && reportesSeguidos.length === 0 ? (
          <EstadoVacio
            titulo="Sin reportes seguidos"
            descripcion="Cuando sigas un reporte desde su detalle, aparecerá en esta sección."
          />
        ) : null}

        {!estaCargando && !mensajeError && reportesSeguidos.length > 0 ? (
          <>
            <div className="reportesSeguidos__resumen">
              <span>
                {obtenerTotalMostrado(totalReportes)} reporte
                {totalReportes === 1 ? '' : 's'} seguido{totalReportes === 1 ? '' : 's'}
              </span>
            </div>

            <div className="reportesSeguidos__lista">
              {reportesSeguidos.map((reporte) => (
                <TarjetaReporteSeguido
                  key={reporte.id}
                  reporte={reporte}
                  alVerDetalle={alVerDetalle}
                />
              ))}
            </div>

            {totalPaginas > 1 ? (
              <div className="reportesSeguidos__paginacion">
                <div>
                  <span>Página</span>
                  <strong>
                    {paginaActual} de {totalPaginas}
                  </strong>
                </div>

                <div className="reportesSeguidos__paginacionAcciones">
                  <Boton
                    variante="secundario"
                    tamano="sm"
                    disabled={!puedeIrAnterior || consultaReportesSeguidos.isFetching}
                    onClick={irPaginaAnterior}
                  >
                    Anterior
                  </Boton>

                  <Boton
                    variante="secundario"
                    tamano="sm"
                    disabled={!puedeIrSiguiente || consultaReportesSeguidos.isFetching}
                    onClick={irPaginaSiguiente}
                  >
                    Siguiente
                  </Boton>
                </div>
              </div>
            ) : null}
          </>
        ) : null}
      </section>
    </Tarjeta>
  );
}