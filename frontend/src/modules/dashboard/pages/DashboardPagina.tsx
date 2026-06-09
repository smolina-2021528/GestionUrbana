import { textosSistema } from '../../../design/identity/textosSistema';
import { EstadoVacio } from '../../../shared/components/data/EstadoVacio';
import { Boton } from '../../../shared/components/ui/Boton';
import { Tarjeta } from '../../../shared/components/ui/Tarjeta';

const metricasPlaceholder = [
  {
    etiqueta: 'Reportes pendientes',
    valor: '—',
    descripcion: 'Casos recibidos sin cierre operativo.'
  },
  {
    etiqueta: 'En proceso',
    valor: '—',
    descripcion: 'Reportes actualmente en atención.'
  },
  {
    etiqueta: 'Resueltos',
    valor: '—',
    descripcion: 'Casos finalizados correctamente.'
  },
  {
    etiqueta: 'Alta prioridad',
    valor: '—',
    descripcion: 'Incidencias críticas registradas.'
  }
] as const;

export function DashboardPagina() {
  return (
    <main className="paginaTemporal">
      <section className="encabezadoPaginaTemporal">
        <div>
          <span className="etiquetaInicial">Centro operativo</span>
          <h1>{textosSistema.dashboard.titulo}</h1>
          <p>{textosSistema.dashboard.descripcion}</p>
        </div>
      </section>

      <section className="gridMetricasTemporal" aria-label="Métricas principales">
        {metricasPlaceholder.map((metrica) => (
          <Tarjeta key={metrica.etiqueta}>
            <article className="metricaTemporal">
              <span>{metrica.etiqueta}</span>
              <strong>{metrica.valor}</strong>
              <p>{metrica.descripcion}</p>
            </article>
          </Tarjeta>
        ))}
      </section>

      <section className="gridDashboardTemporal">
        <Tarjeta titulo="Tendencia de reportes" descripcion="Comportamiento semanal de incidencias.">
          <div className="graficaTemporal" aria-label="Representación visual de tendencia">
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>
        </Tarjeta>

        <Tarjeta titulo="Distribución de incidencias" descripcion="Vista general por zona urbana.">
          <EstadoVacio
            titulo="Sin distribución disponible"
            descripcion="No hay información geográfica para mostrar en este momento."
          />
        </Tarjeta>

        <Tarjeta
          titulo="Últimos reportes recibidos"
          descripcion="Actividad reciente registrada en la plataforma."
          acciones={<Boton variante="fantasma">Ver reportes</Boton>}
        >
          <EstadoVacio
            titulo="Sin reportes recientes"
            descripcion="Cuando existan reportes registrados, aparecerán en esta sección."
          />
        </Tarjeta>
      </section>
    </main>
  );
}