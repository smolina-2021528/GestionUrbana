import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { rutasAplicacion } from '../../../config/constantesSistema';
import { textosSistema } from '../../../design/identity/textosSistema';
import { Alerta } from '../../../shared/components/feedback/Alerta';
import { Cargando } from '../../../shared/components/feedback/Cargando';
import { Boton } from '../../../shared/components/ui/Boton';
import { Tarjeta } from '../../../shared/components/ui/Tarjeta';
import { esErrorApi } from '../../../shared/types/errorApi';
import { ListadoReportes } from '../components/ListadoReportes';
import { ResumenCiudadanoReportes } from '../components/ResumenCiudadanoReportes';
import { usarMisReportes } from '../hooks/usarMisReportes';
import type { FiltrosMisReportes, Reporte } from '../types/reportesTipos';
import './reportesPagina.css';

const filtrosIniciales: FiltrosMisReportes = {
  page: 1,
  limit: 10
};

function obtenerMensajeError(error: unknown) {
  if (esErrorApi(error)) {
    return error.mensaje;
  }

  return 'No fue posible cargar tus reportes urbanos. Intenta nuevamente.';
}

function obtenerMensajeRespuestaFallida(mensaje?: string, error?: string) {
  return mensaje ?? error ?? 'No fue posible cargar tus reportes urbanos. Intenta nuevamente.';
}

function limpiarFiltro<TFiltros extends Record<string, unknown>>(
  filtros: TFiltros,
  campo: keyof TFiltros
) {
  const filtrosActualizados = { ...filtros };
  delete filtrosActualizados[campo];

  return filtrosActualizados;
}

export function MisReportesPagina() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  const [filtros, setFiltros] = useState<FiltrosMisReportes>(() => ({
    ...filtrosIniciales,
    q: queryParam || undefined
  }));

  useEffect(() => {
    setFiltros((filtrosActuales) => ({
      ...filtrosActuales,
      page: 1,
      q: queryParam || undefined
    }));
  }, [queryParam]);

  const consultaMisReportes = usarMisReportes(filtros);

  const respuestaReportes = consultaMisReportes.data;
  const reportes = respuestaReportes?.success === true ? respuestaReportes.data ?? [] : [];
  const reportesFiltrados = reportes;
  const paginacion = respuestaReportes?.success === true ? respuestaReportes.pagination : undefined;

  const mensajeRespuestaFallida =
    respuestaReportes?.success === false
      ? obtenerMensajeRespuestaFallida(respuestaReportes.message, respuestaReportes.error)
      : undefined;

  const mensajeError =
    consultaMisReportes.error !== null
      ? obtenerMensajeError(consultaMisReportes.error)
      : mensajeRespuestaFallida;

  const estaCargando = consultaMisReportes.isLoading;
  const estaActualizando = consultaMisReportes.isFetching && !consultaMisReportes.isLoading;

  const actualizarReportes = () => {
    void consultaMisReportes.refetch();
  };

  const irACrearReporte = () => {
    navigate(rutasAplicacion.crearReporte);
  };

  const irANotificaciones = () => {
    navigate(rutasAplicacion.notificaciones);
  };

  const irADetalleReporte = (reporte: Reporte) => {
    navigate(`${rutasAplicacion.reportes}/${encodeURIComponent(reporte.id)}`);
  };

  const limpiarFiltros = () => {
    setFiltros(filtrosIniciales);
  };

  const cambiarFechaInicio = (valor: string) => {
    if (!valor) {
      setFiltros((filtrosActuales) =>
        limpiarFiltro({ ...filtrosActuales, page: 1 }, 'startDate')
      );
      return;
    }

    setFiltros((filtrosActuales) => ({
      ...filtrosActuales,
      page: 1,
      startDate: valor
    }));
  };

  const cambiarFechaFin = (valor: string) => {
    if (!valor) {
      setFiltros((filtrosActuales) => limpiarFiltro({ ...filtrosActuales, page: 1 }, 'endDate'));
      return;
    }

    setFiltros((filtrosActuales) => ({
      ...filtrosActuales,
      page: 1,
      endDate: valor
    }));
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

  return (
    <main className="paginaTemporal reportesPagina">
      <section className="reportesPagina__encabezado">
        <div>
          <span className="etiquetaInicial">Seguimiento ciudadano</span>
          <h1>{textosSistema.reportes.tituloMisReportes}</h1>
          <p>
            Revisa tus reportes, consulta su estado y da seguimiento a las actualizaciones más
            importantes sin entrar a vistas administrativas.
          </p>
        </div>

        <div className="reportesPagina__accionesEncabezado">
          {estaActualizando ? <Cargando texto="Actualizando tus reportes..." compacto /> : null}

          <Boton
            variante="secundario"
            disabled={consultaMisReportes.isFetching}
            onClick={actualizarReportes}
          >
            Actualizar
          </Boton>

          <Boton onClick={irACrearReporte}>Crear reporte</Boton>
        </div>
      </section>

      <ResumenCiudadanoReportes
        reportes={reportes}
        paginacion={paginacion}
        actualizando={consultaMisReportes.isFetching}
        alCrearReporte={irACrearReporte}
        alVerNotificaciones={irANotificaciones}
        alActualizar={actualizarReportes}
        alVerDetalle={irADetalleReporte}
      />

      <Tarjeta titulo="Buscar por fecha" descripcion="Filtra tus reportes por fecha de creación.">
        <div className="reportesPagina__filtrosSimples">
          <label className="reportesPagina__campoFiltro">
            <span>Desde</span>
            <input
              type="date"
              value={filtros.startDate ?? ''}
              disabled={consultaMisReportes.isFetching}
              onChange={(evento) => cambiarFechaInicio(evento.target.value)}
            />
          </label>

          <label className="reportesPagina__campoFiltro">
            <span>Hasta</span>
            <input
              type="date"
              value={filtros.endDate ?? ''}
              disabled={consultaMisReportes.isFetching}
              onChange={(evento) => cambiarFechaFin(evento.target.value)}
            />
          </label>

          <div className="reportesPagina__accionesFiltro">
            <Boton
              variante="fantasma"
              disabled={consultaMisReportes.isFetching}
              onClick={limpiarFiltros}
            >
              Limpiar filtros
            </Boton>
          </div>
        </div>
      </Tarjeta>

      {queryParam && (
        <Tarjeta
          className="reportesPagina__filtroInfo"
          style={{
            marginBottom: '1rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0.75rem 1rem'
          }}
        >
          <div>
            Filtrado por búsqueda: <strong>"{queryParam}"</strong>
          </div>
          <Boton variante="secundario" tamano="sm" onClick={() => navigate(rutasAplicacion.misReportes)}>
            Limpiar búsqueda
          </Boton>
        </Tarjeta>
      )}

      {queryParam && reportesFiltrados.length === 0 && reportes.length > 0 && (
        <Alerta variante="informacion" titulo="Sin resultados">
          <p>No se encontraron reportes que coincidan con la búsqueda "{queryParam}".</p>
        </Alerta>
      )}

      {mensajeError && reportes.length > 0 ? (
        <Alerta variante="advertencia" titulo="Los datos mostrados pueden no estar actualizados">
          <p>{mensajeError}</p>
        </Alerta>
      ) : null}

      <ListadoReportes
        reportes={reportesFiltrados}
        cargando={estaCargando}
        mensajeError={mensajeError}
        paginacion={paginacion}
        mostrarCiudadano={false}
        mostrarAsignado={false}
        tituloVacio={queryParam ? "No hay resultados para tu búsqueda" : "Aún no has registrado reportes"}
        descripcionVacia={queryParam ? "Intenta con otras palabras clave o limpia el filtro de búsqueda." : "Cuando crees un reporte urbano, podrás darle seguimiento desde esta sección."}
        accionVacia={
          queryParam ? (
            <Boton onClick={() => navigate(rutasAplicacion.misReportes)}>
              Limpiar búsqueda
            </Boton>
          ) : (
            <div className="reportesPagina__accionesVacias">
              <Boton onClick={irACrearReporte}>Crear reporte</Boton>
              <Boton variante="secundario" onClick={actualizarReportes}>
                Actualizar reportes
              </Boton>
            </div>
          )
        }
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
                disabled={!puedeIrAnterior || consultaMisReportes.isFetching}
                onClick={irPaginaAnterior}
              >
                Anterior
              </Boton>

              <Boton
                variante="secundario"
                disabled={!puedeIrSiguiente || consultaMisReportes.isFetching}
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