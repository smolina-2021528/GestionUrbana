import { textosSistema } from '../../../design/identity/textosSistema';
import { EstadoVacio } from '../../../shared/components/data/EstadoVacio';
import { Boton } from '../../../shared/components/ui/Boton';
import { InsigniaEstado } from '../../../shared/components/ui/InsigniaEstado';
import { InsigniaPrioridad } from '../../../shared/components/ui/InsigniaPrioridad';
import { Tarjeta } from '../../../shared/components/ui/Tarjeta';

export function MisReportesPagina() {
  return (
    <main className="paginaTemporal">
      <section className="encabezadoPaginaTemporal">
        <div>
          <span className="etiquetaInicial">Seguimiento ciudadano</span>
          <h1>{textosSistema.reportes.tituloMisReportes}</h1>
          <p>{textosSistema.reportes.descripcionMisReportes}</p>
        </div>

        <Boton>Crear reporte</Boton>
      </section>

      <Tarjeta
        titulo="Seguimiento de reporte"
        descripcion="Estructura de consulta para revisar el avance de una incidencia."
      >
        <article className="tarjetaReporteTemporal">
          <div>
            <h2>Reporte urbano</h2>
            <p>Consulta el estado, prioridad, fecha de actualización y avance del caso.</p>
          </div>

          <div className="tarjetaReporteTemporal__insignias">
            <InsigniaEstado estado="EN_PROCESO" />
            <InsigniaPrioridad prioridad="MEDIA" />
          </div>

          <div className="lineaProgresoTemporal" aria-label="Progreso del reporte">
            <span className="activo">Recibido</span>
            <span className="activo">En revisión</span>
            <span className="activo">En proceso</span>
            <span>Resuelto</span>
          </div>
        </article>
      </Tarjeta>

      <EstadoVacio
        titulo="Sin reportes registrados"
        descripcion="Cuando crees reportes urbanos, podrás consultar su seguimiento desde esta pantalla."
      />
    </main>
  );
}