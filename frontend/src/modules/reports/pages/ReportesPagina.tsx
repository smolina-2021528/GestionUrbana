import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { rolesSistema, rutasAplicacion } from '../../../config/constantesSistema';
import { textosSistema } from '../../../design/identity/textosSistema';
import { usarAutenticacion } from '../../authentication/hooks/usarAutenticacion';
import { EstadoVacio } from '../../../shared/components/data/EstadoVacio';
import { Alerta } from '../../../shared/components/feedback/Alerta';
import { Cargando } from '../../../shared/components/feedback/Cargando';
import { Boton } from '../../../shared/components/ui/Boton';
import { Tarjeta } from '../../../shared/components/ui/Tarjeta';
import { esErrorApi } from '../../../shared/types/errorApi';
import { FiltrosReportes } from '../components/FiltrosReportes';
import { ListadoReportes } from '../components/ListadoReportes';
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

export function ReportesPagina() {
  const navigate = useNavigate();
  const { roles } = usarAutenticacion();
  const [filtros, setFiltros] = useState<FiltrosListadoReportes>(filtrosIniciales);

  const esAdministrador = roles.includes(rolesSistema.administrador);

  const consultaReportes = usarReportes(filtros, {
    habilitado: esAdministrador
  });

  const respuestaReportes = consultaReportes.data;
  const reportes = respuestaReportes?.success === true ? respuestaReportes.data ?? [] : [];
  const paginacion = respuestaReportes?.success === true ? respuestaReportes.pagination : undefined;

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
  };

  const limpiarFiltros = () => {
    setFiltros(filtrosIniciales);
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

  const irADetalleReporte = (reporte: Reporte) => {
    navigate(`${rutasAplicacion.reportes}/${encodeURIComponent(reporte.id)}`);
  };

  const irPaginaAnterior = () => {
    setFiltros((filtrosActuales) => ({
      ...filtrosActuales,
      page: Math.max((filtrosActuales.page ?? 1) - 1, 1)
    }));
  };

  const irPaginaSiguiente = () => {
    const paginaActual = filtros.page ?? 1;
    const totalPaginas = paginacion?.totalPages ?? paginaActual;

    setFiltros((filtrosActuales) => ({
      ...filtrosActuales,
      page: Math.min((filtrosActuales.page ?? 1) + 1, totalPaginas)
    }));
  };

  const paginaActual = paginacion?.page ?? filtros.page ?? 1;
  const totalPaginas = paginacion?.totalPages ?? 1;
  const puedeIrAnterior = paginaActual > 1;
  const puedeIrSiguiente = paginaActual < totalPaginas;

  if (!esAdministrador) {
    return (
      <main className="paginaTemporal reportesPagina">
        <section className="encabezadoPaginaTemporal">
          <div>
            <span className="etiquetaInicial">Reportes urbanos</span>
            <h1>{textosSistema.reportes.tituloMapa}</h1>
            <p>{textosSistema.reportes.descripcionMapa}</p>
          </div>

          <Boton onClick={irACrearReporte}>Crear reporte</Boton>
        </section>

        <EstadoVacio
          titulo="Consulta operativa disponible para administración"
          descripcion="Puedes crear reportes urbanos y consultar el seguimiento de tus casos desde la sección Mis reportes."
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
          <p>
            Consulta, filtra y revisa las incidencias urbanas registradas por la ciudadanía.
          </p>
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