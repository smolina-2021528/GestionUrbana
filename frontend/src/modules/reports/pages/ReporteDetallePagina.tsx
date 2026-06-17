import { useNavigate, useParams } from 'react-router-dom';

import { rolesSistema, rutasAplicacion } from '../../../config/constantesSistema';
import { EstadoVacio } from '../../../shared/components/data/EstadoVacio';
import { Alerta } from '../../../shared/components/feedback/Alerta';
import { Cargando } from '../../../shared/components/feedback/Cargando';
import { Boton } from '../../../shared/components/ui/Boton';
import { Tarjeta } from '../../../shared/components/ui/Tarjeta';
import { esErrorApi } from '../../../shared/types/errorApi';
import { usarAutenticacion } from '../../authentication/hooks/usarAutenticacion';
import { AccionesAdministrativasReporte } from '../components/AccionesAdministrativasReporte';
import { BotonSeguimientoReporte } from '../components/BotonSeguimientoReporte';
import { ComentariosReporte } from '../components/ComentariosReporte';
import { DetalleReporte } from '../components/DetalleReporte';
import { HistorialReporte } from '../components/HistorialReporte';
import { UbicacionReporte } from '../components/UbicacionReporte';
import { usarReporteDetalle } from '../hooks/usarReporteDetalle';
import './reportesPagina.css';

function obtenerMensajeError(error: unknown) {
  if (esErrorApi(error)) {
    return error.mensaje;
  }

  return 'No fue posible cargar el detalle del reporte. Intenta nuevamente.';
}

function obtenerMensajeRespuestaFallida(mensaje?: string, error?: string) {
  return mensaje ?? error ?? 'No fue posible cargar el detalle del reporte. Intenta nuevamente.';
}

export function ReporteDetallePagina() {
  const navigate = useNavigate();
  const { reporteId } = useParams<{ reporteId: string }>();
  const { roles, usuario } = usarAutenticacion();

  const consultaDetalle = usarReporteDetalle(reporteId);

  const respuestaDetalle = consultaDetalle.data;
  const reporte = respuestaDetalle?.success === true ? respuestaDetalle.data : undefined;

  const mensajeRespuestaFallida =
    respuestaDetalle?.success === false
      ? obtenerMensajeRespuestaFallida(respuestaDetalle.message, respuestaDetalle.error)
      : undefined;

  const mensajeError =
    consultaDetalle.error !== null
      ? obtenerMensajeError(consultaDetalle.error)
      : mensajeRespuestaFallida;

  const esAdministrador = roles.includes(rolesSistema.administrador);
  const puedeGestionarUbicacion =
    esAdministrador || Boolean(usuario?.id && reporte?.citizen?.id && usuario.id === reporte.citizen.id);

  const volver = () => {
    navigate(-1);
  };

  const irAReportes = () => {
    navigate(rutasAplicacion.reportes);
  };

  const actualizarDetalle = () => {
    void consultaDetalle.refetch();
  };

  const manejarReporteEliminado = () => {
    navigate(rutasAplicacion.reportes);
  };

  if (!reporteId) {
    return (
      <main className="paginaTemporal reportesPagina">
        <EstadoVacio
          titulo="Reporte no identificado"
          descripcion="No fue posible identificar el reporte que deseas consultar."
          accion={
            <Boton variante="secundario" onClick={irAReportes}>
              Volver a reportes
            </Boton>
          }
        />
      </main>
    );
  }

  if (consultaDetalle.isLoading) {
    return (
      <main className="paginaTemporal reportesPagina">
        <Tarjeta className="reportesPagina__estadoDetalle">
          <Cargando texto="Cargando detalle del reporte..." />
        </Tarjeta>
      </main>
    );
  }

  if (mensajeError && !reporte) {
    return (
      <main className="paginaTemporal reportesPagina">
        <Alerta variante="error" titulo="No se pudo cargar el reporte">
          <div className="reportesPagina__alertaDetalle">
            <p>{mensajeError}</p>

            <div className="reportesPagina__accionesDetalle">
              <Boton variante="secundario" onClick={actualizarDetalle}>
                Reintentar
              </Boton>

              <Boton variante="fantasma" onClick={irAReportes}>
                Volver a reportes
              </Boton>
            </div>
          </div>
        </Alerta>
      </main>
    );
  }

  if (!reporte) {
    return (
      <main className="paginaTemporal reportesPagina">
        <EstadoVacio
          titulo="Reporte no encontrado"
          descripcion="No se encontró información para el reporte solicitado."
          accion={
            <Boton variante="secundario" onClick={irAReportes}>
              Volver a reportes
            </Boton>
          }
        />
      </main>
    );
  }

  return (
    <main className="paginaTemporal reportesPagina">
      {mensajeError ? (
        <Alerta variante="advertencia" titulo="Los datos mostrados pueden no estar actualizados">
          <p>{mensajeError}</p>
        </Alerta>
      ) : null}

      <DetalleReporte
        reporte={reporte}
        alVolver={volver}
        alActualizar={actualizarDetalle}
        actualizando={consultaDetalle.isFetching}
      />

      <UbicacionReporte
        reporte={reporte}
        puedeGestionar={puedeGestionarUbicacion}
        alCambioRealizado={actualizarDetalle}
      />

      <BotonSeguimientoReporte
        reporteId={reporteId}
        tituloReporte={reporte.title}
        alCambioSeguimiento={actualizarDetalle}
      />

      {esAdministrador ? (
        <AccionesAdministrativasReporte
          reporte={reporte}
          alCambioRealizado={actualizarDetalle}
          alReporteEliminado={manejarReporteEliminado}
        />
      ) : null}

      <section className="reportesPagina__interaccionesDetalle">
        <ComentariosReporte reporteId={reporteId} />
        <HistorialReporte reporteId={reporteId} />
      </section>
    </main>
  );
}