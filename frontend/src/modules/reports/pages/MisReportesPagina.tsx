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
        titulo="Ejemplo visual de seguimiento"
        descripcion="Esta tarjeta representa la estructura futura de un reporte ciudadano."
      >
        <article className="tarjetaReporteTemporal">
          <div>
            <h2>Bache en calle principal</h2>
            <p>Vista previa visual. Los datos reales se conectarán al endpoint de mis reportes.</p>
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
        titulo="Listado real pendiente"
        descripcion="En un sprint posterior esta pantalla consumirá los reportes asociados al usuario autenticado."
      />
    </main>
  );
}