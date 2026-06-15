import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { rutasAplicacion, rolesSistema } from '../../../config/constantesSistema';
import { textosSistema } from '../../../design/identity/textosSistema';
import { usarAutenticacion } from '../../../modules/authentication/hooks/usarAutenticacion';
import { EstadoVacio } from '../../../shared/components/data/EstadoVacio';
import { Alerta } from '../../../shared/components/feedback/Alerta';
import { Cargando } from '../../../shared/components/feedback/Cargando';
import { Boton } from '../../../shared/components/ui/Boton';
import { Tarjeta } from '../../../shared/components/ui/Tarjeta';
import { esErrorApi } from '../../../shared/types/errorApi';
import { FiltrosReportes } from '../components/FiltrosReportes';
import { ListadoReportes } from '../components/ListadoReportes';
import { MapaReportes } from '../components/MapaReportes';
import type { ReporteMapaVisual } from '../components/MarcadorReporte';
import { PanelReportesMapa } from '../components/PanelReportesMapa';
import { ResumenReportes } from '../components/ResumenReportes';
import { usarReportes } from '../hooks/usarReportes';
import type { FiltrosListadoReportes, Reporte } from '../types/reportesTipos';
import './reportesPagina.css';

const filtrosIniciales: FiltrosListadoReportes = {
  page: 1,
  limit: 10,
  sortBy: 'date',
  sortOrder: 'DESC'
};

function obtenerMensajeError(error: unknown) {
  if (esErrorApi(error)) {
    return error.mensaje;
  }

  return 'No fue posible cargar los reportes urbanos. Intenta nuevamente.';
}

function obtenerMensajeRespuestaFallida(mensaje?: string, error?: string) {
  return mensaje ?? error ?? 'No fue posible cargar los reportes urbanos. Intenta nuevamente.';
}

function obtenerTotalConUbicacion(reportes: Reporte[]) {
  return reportes.filter((reporte) => reporte.hasLocation && reporte.latitude !== null && reporte.longitude !== null)
    .length;
}

export function ReportesPagina() {
  const navigate = useNavigate();
  const { roles } = usarAutenticacion();
  const [filtros, setFiltros] = useState<FiltrosListadoReportes>(filtrosIniciales);
  const [reporteMapaSeleccionadoId, setReporteMapaSeleccionadoId] = useState<string | undefined>();

  const esAdministrador = roles.includes(rolesSistema.administrador);

  const consultaReportes = usarReportes(filtros, {
    habilitado: esAdministrador
  });

  const respuestaReportes = consultaReportes.data;
  const reportes = respuestaReportes?.success === true ? respuestaReportes.data ?? [] : [];
  const paginacion = respuestaReportes?.success === true ? respuestaReportes.pagination : undefined;
  const totalReportesMapa = paginacion?.total ?? reportes.length;
  const totalConUbicacion = obtenerTotalConUbicacion(reportes);

  const mensajeRespuestaFallida =
    respuestaReportes?.success === false
      ? obtenerMensajeRespuestaFallida(respuestaReportes.message, respuestaReportes.error)
      : undefined;

  const mensajeError =
    consultaReportes.error !== null
      ? obtenerMensajeError(consultaReportes.error)
      : mensajeRespuestaFallida;

  const estaCargando = consultaReportes.isLoading;
  const estaActualizando = consultaReportes.isFetching && !consultaReportes.isLoading;

  const cambiarFiltros = (nuevosFiltros: FiltrosListadoReportes) => {
    setFiltros({
      ...nuevosFiltros,
      limit: nuevosFiltros.limit ?? filtrosIniciales.limit
    });
    setReporteMapaSeleccionadoId(undefined);
  };

  const limpiarFiltros = () => {
    setFiltros(filtrosIniciales);
    setReporteMapaSeleccionadoId(undefined);
  };

  const actualizarReportes = () => {
    void consultaReportes.refetch();
  };

  const irACrearReporte = () => {
    navigate(rutasAplicacion.crearReporte);
  };

  const irAMisReportes = () => {
    navigate(rutasAplicacion.misReportes);
  };

  const irADetalleReporte = (reporte: Reporte | ReporteMapaVisual) => {
    navigate(`${rutasAplicacion.reportes}/${encodeURIComponent(reporte.id)}`);
  };

  const seleccionarReporteMapa = (reporte: ReporteMapaVisual) => {
    setReporteMapaSeleccionadoId(reporte.id);
  };

  const irPaginaAnterior = () => {
    setFiltros((filtrosActuales) => ({
      ...filtrosActuales,
      page: Math.max((filtrosActuales.page ?? 1) - 1, 1)
    }));
    setReporteMapaSeleccionadoId(undefined);
  };

  const irPaginaSiguiente = () => {
    const paginaActual = filtros.page ?? 1;
    const totalPaginas = paginacion?.totalPages ?? paginaActual;

    setFiltros((filtrosActuales) => ({
      ...filtrosActuales,
      page: Math.min((filtrosActuales.page ?? 1) + 1, totalPaginas)
    }));
    setReporteMapaSeleccionadoId(undefined);
  };

  const paginaActual = paginacion?.page ?? filtros.page ?? 1;
  const totalPaginas = paginacion?.totalPages ?? 1;
  const puedeIrAnterior = paginaActual > 1;
  const puedeIrSiguiente = paginaActual < totalPaginas;

  if (!esAdministrador) {
    return (
      <main className="paginaTemporal reportesPagina">
        <section className="reportesPagina__encabezado">
          <div>
            <span className="etiquetaInicial">Reportes urbanos</span>
            <h1>{textosSistema.reportes.tituloMapa}</h1>
            <p>{textosSistema.reportes.descripcionMapa}</p>
          </div>

          <div className="reportesPagina__accionesEncabezado">
            <Boton variante="secundario" onClick={irAMisReportes}>
              Ver mis reportes
            </Boton>
            <Boton onClick={irACrearReporte}>Crear reporte</Boton>
          </div>
        </section>

        <Alerta variante="informacion" titulo="Vista territorial">
          <p>
            Registra tus reportes con ubicación para que puedan analizarse territorialmente y dar
            mejor seguimiento a las incidencias urbanas.
          </p>
        </Alerta>

        <section className="reportesPagina__mapaOperativo" aria-label="Vista territorial ciudadana">
          <div className="reportesPagina__mapaColumna">
            <MapaReportes
              reportes={[]}
              tituloVacio="Sin reportes con ubicación para mostrar"
              descripcionVacia="Crea reportes con coordenadas o dirección para alimentar la vista territorial."
            />
          </div>

          <div className="reportesPagina__panelColumna">
            <PanelReportesMapa
              reportes={[]}
              tituloVacio="Sin incidencias visibles"
              descripcionVacia="Tus reportes aparecerán en el seguimiento cuando estén registrados."
            />
          </div>
        </section>

        <EstadoVacio
          titulo="Seguimiento ciudadano disponible"
          descripcion="Puedes crear reportes urbanos y consultar el avance de tus casos desde la sección Mis reportes."
          accion={
            <div className="reportesPagina__accionesVacias">
              <Boton onClick={irACrearReporte}>Crear reporte</Boton>
              <Boton variante="secundario" onClick={irAMisReportes}>
                Ver mis reportes
              </Boton>
            </div>
          }
        />
      </main>
    );
  }

  return (
    <main className="paginaTemporal reportesPagina">
      <section className="reportesPagina__encabezado">
        <div>
          <span className="etiquetaInicial">Gestión operativa</span>
          <h1>{textosSistema.reportes.tituloMapa}</h1>
          <p>Consulta, filtra y revisa las incidencias urbanas registradas por la ciudadanía.</p>
        </div>

        <div className="reportesPagina__accionesEncabezado">
          {estaActualizando ? <Cargando texto="Actualizando reportes..." compacto /> : null}

          <Boton variante="secundario" disabled={consultaReportes.isFetching} onClick={actualizarReportes}>
            Actualizar
          </Boton>

          <Boton onClick={irACrearReporte}>Crear reporte</Boton>
        </div>
      </section>

      <FiltrosReportes
        filtros={filtros}
        bloqueado={consultaReportes.isFetching}
        alCambiarFiltros={cambiarFiltros}
        alLimpiar={limpiarFiltros}
      />

      {mensajeError && reportes.length > 0 ? (
        <Alerta variante="advertencia" titulo="Los datos mostrados pueden no estar actualizados">
          <p>{mensajeError}</p>
        </Alerta>
      ) : null}

      <section className="reportesPagina__mapaOperativo" aria-label="Vista territorial de reportes">
        <div className="reportesPagina__mapaColumna">
          <MapaReportes
            reportes={reportes}
            reporteSeleccionadoId={reporteMapaSeleccionadoId}
            acciones={
              <div className="reportesPagina__accionesMapa">
                <span>{totalConUbicacion} con ubicación</span>
                <span>{totalReportesMapa} en consulta</span>
              </div>
            }
            tituloVacio="Sin reportes con ubicación"
            descripcionVacia="Los reportes cargados no tienen coordenadas registradas o no coinciden con los filtros actuales."
            alSeleccionarReporte={seleccionarReporteMapa}
          />
        </div>

        <div className="reportesPagina__panelColumna">
          <PanelReportesMapa
            reportes={reportes}
            total={totalReportesMapa}
            reporteSeleccionadoId={reporteMapaSeleccionadoId}
            estaCargando={estaCargando}
            tieneError={Boolean(mensajeError && reportes.length === 0)}
            mensajeError={mensajeError}
            alSeleccionarReporte={seleccionarReporteMapa}
            alVerDetalle={irADetalleReporte}
            alReintentar={actualizarReportes}
          />
        </div>
      </section>

      {reportes.length > 0 ? (
        <ResumenReportes reportes={reportes} paginacion={paginacion} />
      ) : null}

      <ListadoReportes
        reportes={reportes}
        cargando={estaCargando}
        mensajeError={mensajeError}
        paginacion={paginacion}
        mostrarCiudadano
        mostrarAsignado
        tituloVacio="Sin reportes encontrados"
        descripcionVacia="No hay reportes que coincidan con los filtros actuales."
        alActualizar={actualizarReportes}
        alVerDetalle={irADetalleReporte}
      />

      {paginacion && paginacion.totalPages > 1 ? (
        <Tarjeta className="reportesPagina__paginacion">
          <div className="reportesPagina__paginacionContenido">
            <div>
              <span className="reportesPagina__paginacionEtiqueta">Paginación</span>
              <strong>
                Página {paginaActual} de {totalPaginas}
              </strong>
            </div>

            <div className="reportesPagina__paginacionAcciones">
              <Boton
                variante="secundario"
                disabled={!puedeIrAnterior || consultaReportes.isFetching}
                onClick={irPaginaAnterior}
              >
                Anterior
              </Boton>

              <Boton
                variante="secundario"
                disabled={!puedeIrSiguiente || consultaReportes.isFetching}
                onClick={irPaginaSiguiente}
              >
                Siguiente
              </Boton>
            </div>
          </div>
        </Tarjeta>
      ) : null}
    </main>
  );
}