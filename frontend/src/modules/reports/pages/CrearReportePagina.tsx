import { textosSistema } from '../../../design/identity/textosSistema';
import { Boton } from '../../../shared/components/ui/Boton';
import { Tarjeta } from '../../../shared/components/ui/Tarjeta';

const pasosReporte = ['Problema', 'Ubicación', 'Evidencia', 'Revisión'] as const;

export function CrearReportePagina() {
  return (
    <main className="paginaTemporal">
      <section className="encabezadoPaginaTemporal">
        <div>
          <span className="etiquetaInicial">Reporte ciudadano</span>
          <h1>{textosSistema.reportes.tituloCrear}</h1>
          <p>{textosSistema.reportes.descripcionCrear}</p>
        </div>
      </section>

      <nav className="pasosReporteTemporal" aria-label="Pasos para crear reporte">
        {pasosReporte.map((paso, indice) => (
          <span
            key={paso}
            className={
              indice === 0 ? 'pasosReporteTemporal__paso activo' : 'pasosReporteTemporal__paso'
            }
          >
            {indice + 1}. {paso}
          </span>
        ))}
      </nav>

      <section className="crearReporteTemporal">
        <Tarjeta titulo="1. Problema" descripcion="Describe con claridad la incidencia urbana.">
          <form className="formularioTemporal">
            <label className="campoTemporal">
              <span>Título del reporte</span>
              <input placeholder="Ej. Bache frente a parada de bus" type="text" />
            </label>

            <label className="campoTemporal">
              <span>Descripción del problema</span>
              <textarea placeholder="Describe qué ocurre, desde cuándo y cómo afecta a la zona." />
            </label>

            <label className="campoTemporal">
              <span>Categoría</span>
              <select>
                <option>Infraestructura</option>
                <option>Seguridad</option>
                <option>Limpieza</option>
              </select>
            </label>
          </form>
        </Tarjeta>

        <Tarjeta titulo="Ubicación y evidencia" descripcion="Completa los datos necesarios del caso.">
          <div className="bloquesCrearReporteTemporal">
            <div className="bloquePlaceholderTemporal">
              <strong>Mapa de ubicación</strong>
              <p>Marca el punto exacto donde ocurre la incidencia.</p>
            </div>

            <div className="bloquePlaceholderTemporal">
              <strong>Fotos de evidencia</strong>
              <p>Agrega imágenes claras del problema reportado.</p>
            </div>

            <div className="bloquePlaceholderTemporal">
              <strong>Resumen</strong>
              <p>Revisa la información antes de enviar el reporte.</p>
            </div>
          </div>

          <div className="accionesFormularioTemporal">
            <Boton variante="secundario">Guardar borrador</Boton>
            <Boton>Siguiente: Ubicación</Boton>
          </div>
        </Tarjeta>
      </section>
    </main>
  );
}