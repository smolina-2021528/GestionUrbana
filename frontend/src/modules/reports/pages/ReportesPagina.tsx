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
import { FiltrosHeatmapReportes } from '../components/FiltrosHeatmapReportes';
import {
  FiltrosMapaReportes,
  type ModoConsultaMapaReportes
} from '../components/FiltrosMapaReportes';
import { FiltrosReportes } from '../components/FiltrosReportes';
import { ListadoReportes } from '../components/ListadoReportes';
import { MapaReportes } from '../components/MapaReportes';
import type { ReporteMapaVisual } from '../components/MarcadorReporte';
import { PanelReportesMapa } from '../components/PanelReportesMapa';
import { ResumenReportes } from '../components/ResumenReportes';
import { usarReportes } from '../hooks/usarReportes';
import {
  usarHeatmapReportes,
  usarReportesBoundingBox,
  usarReportesCercanos
} from '../hooks/usarReportesMapa';
import type {
  FiltrosBoundingBoxReportes,
  FiltrosHeatmapReportes as FiltrosHeatmapReportesTipo,
  FiltrosListadoReportes,
  FiltrosReportesCercanos,
  Reporte
} from '../types/reportesTipos';
import './reportesPagina.css';

const filtrosIniciales: FiltrosListadoReportes = {
  page: 1,
  limit: 10,
  sortBy: 'date',
  sortOrder: 'DESC'
};

const filtrosCercanosIniciales: FiltrosReportesCercanos = {
  lat: 14.634915,
  lng: -90.506882,
  radius: 3000,
  page: 1,
  limit: 20
};

const filtrosAreaIniciales: FiltrosBoundingBoxReportes = {
  swLat: 14.55,
  swLng: -90.6,
  neLat: 14.72,
  neLng: -90.42
};

const filtrosHeatmapIniciales: FiltrosHeatmapReportesTipo = {};

function obtenerMensajeError(error: unknown) {
  if (esErrorApi(error)) {
    return error.mensaje;
  }

  return 'No fue posible cargar los reportes urbanos. Intenta nuevamente.';
}

function obtenerMensajeRespuestaFallida(mensaje?: string, error?: string) {
  return mensaje ?? error ?? 'No fue posible cargar los reportes urbanos. Intenta nuevamente.';
}

function obtenerTotalConUbicacion(reportes: ReporteMapaVisual[]) {
  return reportes.filter((reporte) => reporte.hasLocation && reporte.latitude !== null && reporte.longitude !== null)
    .length;
}

function obtenerMensajeConsultaGeograficaFallida(mensaje?: string, error?: string) {
  return mensaje ?? error ?? 'No fue posible cargar la consulta territorial. Intenta nuevamente.';
}

function obtenerMensajeHeatmapFallido(mensaje?: string, error?: string) {
  return mensaje ?? error ?? 'No fue posible cargar la capa de intensidad territorial.';
}

export function ReportesPagina() {
  const navigate = useNavigate();
  const { roles } = usarAutenticacion();

  const [filtros, setFiltros] = useState<FiltrosListadoReportes>(filtrosIniciales);
  const [modoConsultaMapa, setModoConsultaMapa] = useState<ModoConsultaMapaReportes>('CERCANOS');
  const [filtrosCercanos, setFiltrosCercanos] =
    useState<FiltrosReportesCercanos>(filtrosCercanosIniciales);
  const [filtrosArea, setFiltrosArea] = useState<FiltrosBoundingBoxReportes>(filtrosAreaIniciales);
  const [mostrarHeatmap, setMostrarHeatmap] = useState(true);
  const [filtrosHeatmap, setFiltrosHeatmap] =
    useState<FiltrosHeatmapReportesTipo>(filtrosHeatmapIniciales);
  const [reporteMapaSeleccionadoId, setReporteMapaSeleccionadoId] = useState<string | undefined>();
  const [mensajeUbicacion, setMensajeUbicacion] = useState<string | undefined>();
  const [solicitandoUbicacion, setSolicitandoUbicacion] = useState(false);

  const esAdministrador = roles.includes(rolesSistema.administrador);

  const consultaReportes = usarReportes(filtros, {
    habilitado: esAdministrador
  });

  const consultaReportesCercanos = usarReportesCercanos(filtrosCercanos, {
    habilitado: modoConsultaMapa === 'CERCANOS'
  });

  const consultaReportesArea = usarReportesBoundingBox(filtrosArea, {
    habilitado: modoConsultaMapa === 'AREA'
  });

  const consultaHeatmap = usarHeatmapReportes(filtrosHeatmap, {
    habilitado: mostrarHeatmap
  });

  const respuestaReportes = consultaReportes.data;
  const reportes = respuestaReportes?.success === true ? respuestaReportes.data ?? [] : [];
  const paginacion = respuestaReportes?.success === true ? respuestaReportes.pagination : undefined;

  const respuestaCercanos = consultaReportesCercanos.data;
  const respuestaArea = consultaReportesArea.data;
  const respuestaHeatmap = consultaHeatmap.data;

  const reportesCercanos = respuestaCercanos?.success === true ? respuestaCercanos.data ?? [] : [];
  const reportesArea = respuestaArea?.success === true ? respuestaArea.data ?? [] : [];
  const puntosHeatmap = respuestaHeatmap?.success === true ? respuestaHeatmap.data ?? [] : [];

  const reportesTerritoriales: ReporteMapaVisual[] =
    modoConsultaMapa === 'CERCANOS' ? reportesCercanos : reportesArea;

  const totalReportesMapa =
    modoConsultaMapa === 'CERCANOS'
      ? respuestaCercanos?.success === true
        ? respuestaCercanos.pagination?.total ?? reportesTerritoriales.length
        : reportesTerritoriales.length
      : respuestaArea?.success === true
        ? respuestaArea.total ?? reportesTerritoriales.length
        : reportesTerritoriales.length;

  const totalPuntosHeatmap =
    respuestaHeatmap?.success === true ? respuestaHeatmap.total ?? puntosHeatmap.length : puntosHeatmap.length;

  const centroConsulta =
    modoConsultaMapa === 'CERCANOS'
      ? respuestaCercanos?.success === true
        ? respuestaCercanos.meta?.center ?? {
            latitude: filtrosCercanos.lat,
            longitude: filtrosCercanos.lng
          }
        : {
            latitude: filtrosCercanos.lat,
            longitude: filtrosCercanos.lng
          }
      : undefined;

  const radioConsulta = modoConsultaMapa === 'CERCANOS' ? filtrosCercanos.radius : undefined;
  const totalConUbicacion = obtenerTotalConUbicacion(reportesTerritoriales);

  const mensajeRespuestaFallida =
    respuestaReportes?.success === false
      ? obtenerMensajeRespuestaFallida(respuestaReportes.message, respuestaReportes.error)
      : undefined;

  const mensajeError =
    consultaReportes.error !== null
      ? obtenerMensajeError(consultaReportes.error)
      : mensajeRespuestaFallida;

  const mensajeRespuestaGeograficaFallida =
    modoConsultaMapa === 'CERCANOS'
      ? respuestaCercanos?.success === false
        ? obtenerMensajeConsultaGeograficaFallida(respuestaCercanos.message, respuestaCercanos.error)
        : undefined
      : respuestaArea?.success === false
        ? obtenerMensajeConsultaGeograficaFallida(respuestaArea.message, respuestaArea.error)
        : undefined;

  const mensajeErrorGeografico =
    modoConsultaMapa === 'CERCANOS'
      ? consultaReportesCercanos.error !== null
        ? obtenerMensajeError(consultaReportesCercanos.error)
        : mensajeRespuestaGeograficaFallida
      : consultaReportesArea.error !== null
        ? obtenerMensajeError(consultaReportesArea.error)
        : mensajeRespuestaGeograficaFallida;

  const mensajeRespuestaHeatmapFallida =
    respuestaHeatmap?.success === false
      ? obtenerMensajeHeatmapFallido(respuestaHeatmap.message, respuestaHeatmap.error)
      : undefined;

  const mensajeErrorHeatmap =
    consultaHeatmap.error !== null
      ? obtenerMensajeError(consultaHeatmap.error)
      : mensajeRespuestaHeatmapFallida;

  const estaCargando = consultaReportes.isLoading;
  const estaActualizando = consultaReportes.isFetching && !consultaReportes.isLoading;

  const estaCargandoMapa =
    modoConsultaMapa === 'CERCANOS'
      ? consultaReportesCercanos.isLoading
      : consultaReportesArea.isLoading;

  const estaActualizandoMapa =
    modoConsultaMapa === 'CERCANOS'
      ? consultaReportesCercanos.isFetching && !consultaReportesCercanos.isLoading
      : consultaReportesArea.isFetching && !consultaReportesArea.isLoading;

  const estaCargandoHeatmap = consultaHeatmap.isLoading;
  const estaActualizandoHeatmap = consultaHeatmap.isFetching && !consultaHeatmap.isLoading;
  const estaActualizandoTerritorio = estaActualizandoMapa || estaActualizandoHeatmap;

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

  const actualizarConsultaGeografica = () => {
    if (modoConsultaMapa === 'CERCANOS') {
      void consultaReportesCercanos.refetch();
      return;
    }

    void consultaReportesArea.refetch();
  };

  const actualizarHeatmap = () => {
    if (!mostrarHeatmap) {
      return;
    }

    void consultaHeatmap.refetch();
  };

  const limpiarConsultaGeografica = () => {
    setModoConsultaMapa('CERCANOS');
    setFiltrosCercanos(filtrosCercanosIniciales);
    setFiltrosArea(filtrosAreaIniciales);
    setReporteMapaSeleccionadoId(undefined);
    setMensajeUbicacion(undefined);
  };

  const limpiarHeatmap = () => {
    setFiltrosHeatmap(filtrosHeatmapIniciales);
    setMostrarHeatmap(true);
  };

  const cambiarModoConsultaMapa = (modo: ModoConsultaMapaReportes) => {
    setModoConsultaMapa(modo);
    setReporteMapaSeleccionadoId(undefined);
    setMensajeUbicacion(undefined);
  };

  const cambiarFiltrosCercanos = (nuevosFiltros: FiltrosReportesCercanos) => {
    setFiltrosCercanos(nuevosFiltros);
    setReporteMapaSeleccionadoId(undefined);
  };

  const cambiarFiltrosArea = (nuevosFiltros: FiltrosBoundingBoxReportes) => {
    setFiltrosArea(nuevosFiltros);
    setReporteMapaSeleccionadoId(undefined);
  };

  const cambiarFiltrosHeatmap = (nuevosFiltros: FiltrosHeatmapReportesTipo) => {
    setFiltrosHeatmap(nuevosFiltros);
  };

  const cambiarActivoHeatmap = (activo: boolean) => {
    setMostrarHeatmap(activo);
  };

  const usarUbicacionActual = () => {
    if (!navigator.geolocation) {
      setMensajeUbicacion('Tu navegador no permite obtener la ubicación actual.');
      return;
    }

    setSolicitandoUbicacion(true);
    setMensajeUbicacion(undefined);

    navigator.geolocation.getCurrentPosition(
      (posicion) => {
        setModoConsultaMapa('CERCANOS');
        setFiltrosCercanos((filtrosActuales) => ({
          ...filtrosActuales,
          page: 1,
          lat: Number(posicion.coords.latitude.toFixed(6)),
          lng: Number(posicion.coords.longitude.toFixed(6))
        }));
        setReporteMapaSeleccionadoId(undefined);
        setSolicitandoUbicacion(false);
        setMensajeUbicacion('Ubicación detectada. Puedes consultar reportes cercanos a ese punto.');
      },
      () => {
        setSolicitandoUbicacion(false);
        setMensajeUbicacion('No fue posible obtener tu ubicación. Puedes ingresar las coordenadas manualmente.');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
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
            {estaActualizandoTerritorio ? <Cargando texto="Actualizando mapa..." compacto /> : null}

            <Boton variante="secundario" onClick={irAMisReportes}>
              Ver mis reportes
            </Boton>
            <Boton onClick={irACrearReporte}>Crear reporte</Boton>
          </div>
        </section>

        <FiltrosMapaReportes
          modo={modoConsultaMapa}
          filtrosCercanos={filtrosCercanos}
          filtrosArea={filtrosArea}
          bloqueado={estaCargandoMapa || estaActualizandoMapa}
          solicitandoUbicacion={solicitandoUbicacion}
          alCambiarModo={cambiarModoConsultaMapa}
          alCambiarFiltrosCercanos={cambiarFiltrosCercanos}
          alCambiarFiltrosArea={cambiarFiltrosArea}
          alConsultar={actualizarConsultaGeografica}
          alLimpiar={limpiarConsultaGeografica}
          alUsarUbicacionActual={usarUbicacionActual}
        />

        <FiltrosHeatmapReportes
          activo={mostrarHeatmap}
          filtros={filtrosHeatmap}
          totalPuntos={totalPuntosHeatmap}
          bloqueado={estaCargandoHeatmap || estaActualizandoHeatmap}
          alCambiarActivo={cambiarActivoHeatmap}
          alCambiarFiltros={cambiarFiltrosHeatmap}
          alConsultar={actualizarHeatmap}
          alLimpiar={limpiarHeatmap}
        />

        {mensajeUbicacion ? (
          <Alerta variante="informacion" titulo="Ubicación">
            <p>{mensajeUbicacion}</p>
          </Alerta>
        ) : null}

        {mensajeErrorHeatmap && mostrarHeatmap ? (
          <Alerta variante="advertencia" titulo="La intensidad territorial no pudo actualizarse">
            <p>{mensajeErrorHeatmap}</p>
          </Alerta>
        ) : null}

        <section className="reportesPagina__mapaOperativo" aria-label="Vista territorial ciudadana">
          <div className="reportesPagina__mapaColumna">
            <MapaReportes
              reportes={reportesTerritoriales}
              puntosHeatmap={puntosHeatmap}
              mostrarHeatmap={mostrarHeatmap}
              reporteSeleccionadoId={reporteMapaSeleccionadoId}
              centro={centroConsulta}
              radioMetros={radioConsulta}
              acciones={
                <div className="reportesPagina__accionesMapa">
                  <span>{totalConUbicacion} con ubicación</span>
                  <span>{totalReportesMapa} en consulta</span>
                  {mostrarHeatmap ? <span>{totalPuntosHeatmap} puntos de intensidad</span> : null}
                </div>
              }
              tituloVacio="Sin reportes con ubicación para mostrar"
              descripcionVacia="Ajusta las coordenadas, el radio o el área de consulta para visualizar incidencias urbanas."
              alSeleccionarReporte={seleccionarReporteMapa}
            />
          </div>

          <div className="reportesPagina__panelColumna">
            <PanelReportesMapa
              reportes={reportesTerritoriales}
              total={totalReportesMapa}
              reporteSeleccionadoId={reporteMapaSeleccionadoId}
              estaCargando={estaCargandoMapa}
              tieneError={Boolean(mensajeErrorGeografico && reportesTerritoriales.length === 0)}
              mensajeError={mensajeErrorGeografico}
              tituloVacio="Sin incidencias visibles"
              descripcionVacia="No hay reportes que coincidan con la consulta territorial actual."
              alSeleccionarReporte={seleccionarReporteMapa}
              alVerDetalle={irADetalleReporte}
              alReintentar={actualizarConsultaGeografica}
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
          {estaActualizando || estaActualizandoTerritorio ? (
            <Cargando
              texto={estaActualizandoTerritorio ? 'Actualizando mapa...' : 'Actualizando reportes...'}
              compacto
            />
          ) : null}

          <Boton
            variante="secundario"
            disabled={consultaReportes.isFetching}
            onClick={actualizarReportes}
          >
            Actualizar listado
          </Boton>

          <Boton onClick={irACrearReporte}>Crear reporte</Boton>
        </div>
      </section>

      <FiltrosMapaReportes
        modo={modoConsultaMapa}
        filtrosCercanos={filtrosCercanos}
        filtrosArea={filtrosArea}
        bloqueado={estaCargandoMapa || estaActualizandoMapa}
        solicitandoUbicacion={solicitandoUbicacion}
        alCambiarModo={cambiarModoConsultaMapa}
        alCambiarFiltrosCercanos={cambiarFiltrosCercanos}
        alCambiarFiltrosArea={cambiarFiltrosArea}
        alConsultar={actualizarConsultaGeografica}
        alLimpiar={limpiarConsultaGeografica}
        alUsarUbicacionActual={usarUbicacionActual}
      />

      <FiltrosHeatmapReportes
        activo={mostrarHeatmap}
        filtros={filtrosHeatmap}
        totalPuntos={totalPuntosHeatmap}
        bloqueado={estaCargandoHeatmap || estaActualizandoHeatmap}
        alCambiarActivo={cambiarActivoHeatmap}
        alCambiarFiltros={cambiarFiltrosHeatmap}
        alConsultar={actualizarHeatmap}
        alLimpiar={limpiarHeatmap}
      />

      {mensajeUbicacion ? (
        <Alerta variante="informacion" titulo="Ubicación">
          <p>{mensajeUbicacion}</p>
        </Alerta>
      ) : null}

      {mensajeErrorGeografico && reportesTerritoriales.length > 0 ? (
        <Alerta variante="advertencia" titulo="Los datos territoriales pueden no estar actualizados">
          <p>{mensajeErrorGeografico}</p>
        </Alerta>
      ) : null}

      {mensajeErrorHeatmap && mostrarHeatmap ? (
        <Alerta variante="advertencia" titulo="La intensidad territorial no pudo actualizarse">
          <p>{mensajeErrorHeatmap}</p>
        </Alerta>
      ) : null}

      <section className="reportesPagina__mapaOperativo" aria-label="Vista territorial de reportes">
        <div className="reportesPagina__mapaColumna">
          <MapaReportes
            reportes={reportesTerritoriales}
            puntosHeatmap={puntosHeatmap}
            mostrarHeatmap={mostrarHeatmap}
            reporteSeleccionadoId={reporteMapaSeleccionadoId}
            centro={centroConsulta}
            radioMetros={radioConsulta}
            acciones={
              <div className="reportesPagina__accionesMapa">
                <span>{totalConUbicacion} con ubicación</span>
                <span>{totalReportesMapa} en consulta</span>
                {mostrarHeatmap ? <span>{totalPuntosHeatmap} puntos de intensidad</span> : null}
              </div>
            }
            tituloVacio="Sin reportes con ubicación"
            descripcionVacia="No hay reportes con coordenadas que coincidan con la consulta territorial actual."
            alSeleccionarReporte={seleccionarReporteMapa}
          />
        </div>

        <div className="reportesPagina__panelColumna">
          <PanelReportesMapa
            reportes={reportesTerritoriales}
            total={totalReportesMapa}
            reporteSeleccionadoId={reporteMapaSeleccionadoId}
            estaCargando={estaCargandoMapa}
            tieneError={Boolean(mensajeErrorGeografico && reportesTerritoriales.length === 0)}
            mensajeError={mensajeErrorGeografico}
            tituloVacio="Sin reportes para mostrar"
            descripcionVacia="Ajusta el radio, las coordenadas o los filtros de la consulta territorial."
            alSeleccionarReporte={seleccionarReporteMapa}
            alVerDetalle={irADetalleReporte}
            alReintentar={actualizarConsultaGeografica}
          />
        </div>
      </section>

      <FiltrosReportes
        filtros={filtros}
        bloqueado={consultaReportes.isFetching}
        alCambiarFiltros={cambiarFiltros}
        alLimpiar={limpiarFiltros}
      />

      {mensajeError && reportes.length > 0 ? (
        <Alerta variante="advertencia" titulo="Los datos del listado pueden no estar actualizados">
          <p>{mensajeError}</p>
        </Alerta>
      ) : null}

      {reportes.length > 0 ? <ResumenReportes reportes={reportes} paginacion={paginacion} /> : null}

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