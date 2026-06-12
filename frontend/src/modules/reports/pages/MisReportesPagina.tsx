import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { rutasAplicacion } from '../../../config/constantesSistema';
import { textosSistema } from '../../../design/identity/textosSistema';
import { EstadoVacio } from '../../../shared/components/data/EstadoVacio';
import { Alerta } from '../../../shared/components/feedback/Alerta';
import { Cargando } from '../../../shared/components/feedback/Cargando';
import { Boton } from '../../../shared/components/ui/Boton';
import { Tarjeta } from '../../../shared/components/ui/Tarjeta';
import { esErrorApi } from '../../../shared/types/errorApi';
import { ListadoReportes } from '../components/ListadoReportes';
import { ResumenReportes } from '../components/ResumenReportes';
import { usarMisReportes } from '../hooks/usarMisReportes';
import type { FiltrosMisReportes } from '../types/reportesTipos';
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
  const [filtros, setFiltros] = useState<FiltrosMisReportes>(filtrosIniciales);

  const consultaMisReportes = usarMisReportes(filtros);

  const respuestaReportes = consultaMisReportes.data;
  const reportes = respuestaReportes?.success === true ? respuestaReportes.data ?? [] : [];
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
            Consulta el estado de los reportes urbanos que has registrado y da seguimiento a su
            avance.
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

      <Tarjeta
        titulo="Filtros de seguimiento"
        descripcion="Refina tus reportes por fecha de creación."
      >
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
        mostrarCiudadano={false}
        mostrarAsignado
        tituloVacio="Aún no has registrado reportes"
        descripcionVacia="Cuando crees un reporte urbano, podrás darle seguimiento desde esta sección."
        alActualizar={actualizarReportes}
      />

      {!estaCargando && !mensajeError && reportes.length === 0 ? (
        <EstadoVacio
          titulo="Crea tu primer reporte urbano"
          descripcion="Ayuda a identificar incidencias en tu ciudad para que puedan ser atendidas."
          accion={<Boton onClick={irACrearReporte}>Crear reporte</Boton>}
        />
      ) : null}

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