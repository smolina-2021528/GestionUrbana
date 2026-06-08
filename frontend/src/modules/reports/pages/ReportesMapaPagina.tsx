import { textosSistema } from '../../../design/identity/textosSistema';
import { EstadoVacio } from '../../../shared/components/data/EstadoVacio';
import { InsigniaPrioridad } from '../../../shared/components/ui/InsigniaPrioridad';
import { Tarjeta } from '../../../shared/components/ui/Tarjeta';

export function ReportesMapaPagina() {
  return (
    <main className="paginaTemporal">
      <section className="encabezadoPaginaTemporal">
        <div>
          <span className="etiquetaInicial">Mapa operativo</span>
          <h1>{textosSistema.reportes.tituloMapa}</h1>
          <p>{textosSistema.reportes.descripcionMapa}</p>
        </div>
      </section>

      <section className="barraFiltrosTemporal" aria-label="Filtros visuales de reportes">
        <select aria-label="Departamento">
          <option>Departamento</option>
        </select>

        <select aria-label="Prioridad">
          <option>Prioridad</option>
        </select>

        <select aria-label="Estado">
          <option>Estado</option>
        </select>

        <select aria-label="Categoría">
          <option>Categoría</option>
        </select>

        <input aria-label="Fecha" type="date" />

        <label className="interruptorTemporal">
          <input type="checkbox" />
          <span>Mis reportes</span>
        </label>
      </section>

      <section className="mapaPantallaTemporal">
        <Tarjeta className="mapaPantallaTemporal__mapa">
          <div className="mapaPlaceholderTemporal">
            <div className="marcadorMapaTemporal marcadorMapaTemporal--alta" />
            <div className="marcadorMapaTemporal marcadorMapaTemporal--media" />
            <div className="marcadorMapaTemporal marcadorMapaTemporal--baja" />
            <EstadoVacio
              titulo="Mapa interactivo pendiente"
              descripcion="En el sprint del mapa se integrará React Leaflet, OpenStreetMap, marcadores por prioridad y panel lateral."
            />
          </div>
        </Tarjeta>

        <Tarjeta
          titulo="Detalle del reporte"
          descripcion="Panel lateral preparado para abrirse al seleccionar un marcador."
        >
          <div className="leyendaTemporal">
            <InsigniaPrioridad prioridad="BAJA" />
            <InsigniaPrioridad prioridad="MEDIA" />
            <InsigniaPrioridad prioridad="ALTA" />
          </div>

          <EstadoVacio
            titulo="Selecciona un reporte"
            descripcion="Al hacer clic en un marcador se mostrará título, estado, prioridad, categoría, ubicación, imágenes y acciones según permisos."
          />
        </Tarjeta>
      </section>
    </main>
  );
}