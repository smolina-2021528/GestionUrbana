import { textosSistema } from '../../../design/identity/textosSistema';
import { EstadoVacio } from '../../../shared/components/data/EstadoVacio';
import { Boton } from '../../../shared/components/ui/Boton';
import { Tarjeta } from '../../../shared/components/ui/Tarjeta';

export function NotificacionesPagina() {
  return (
    <main className="paginaTemporal">
      <section className="encabezadoPaginaTemporal">
        <div>
          <span className="etiquetaInicial">Centro de avisos</span>
          <h1>{textosSistema.navegacion.notificaciones}</h1>
          <p>Consulta actualizaciones sobre reportes, asignaciones y cambios de estado.</p>
        </div>
      </section>

      <Tarjeta
        titulo="Notificaciones"
        descripcion="Avisos relacionados con actividad y seguimiento de reportes."
        acciones={<Boton variante="fantasma">Marcar todas como leídas</Boton>}
      >
        <EstadoVacio
          titulo="Sin notificaciones"
          descripcion="Cuando existan avisos nuevos, aparecerán ordenados por fecha en esta sección."
        />
      </Tarjeta>
    </main>
  );
}