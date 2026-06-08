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
        descripcion="Lista preparada para conectarse al servicio de notificaciones."
        acciones={<Boton variante="fantasma">Marcar todas como leídas</Boton>}
      >
        <EstadoVacio
          titulo="Sin notificaciones conectadas"
          descripcion="En un sprint posterior se mostrarán avisos reales del backend y acciones para marcar como leído."
        />
      </Tarjeta>
    </main>
  );
}