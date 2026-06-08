import { textosSistema } from '../../../design/identity/textosSistema';
import { EstadoVacio } from '../../../shared/components/data/EstadoVacio';
import { Boton } from '../../../shared/components/ui/Boton';
import { Tarjeta } from '../../../shared/components/ui/Tarjeta';

const metricasPlaceholder = [
  {
    etiqueta: 'Reportes pendientes',
    valor: '—',
    descripcion: 'Se conectará con estadísticas reales.'
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
    descripcion: 'Incidencias críticas.'
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
        <Tarjeta
          titulo="Tendencia de reportes"
          descripcion="Espacio reservado para gráfica de reportes por semana."
        >
          <div className="graficaTemporal">
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>
        </Tarjeta>

        <Tarjeta
          titulo="Distribución de incidencias"
          descripcion="Espacio reservado para mini mapa o resumen geográfico."
        >
          <EstadoVacio
            titulo="Mapa pendiente"
            descripcion="La visualización geográfica se integrará cuando se implemente el módulo de reportes urbanos."
          />
        </Tarjeta>

        <Tarjeta
          titulo="Últimos reportes recibidos"
          descripcion="Listado visual preparado para conectarse con el backend."
          acciones={<Boton variante="fantasma">Ver reportes</Boton>}
        >
          <EstadoVacio
            titulo="Sin datos conectados"
            descripcion="Este sprint solo define estructura visual. Los datos reales se integrarán en sprints posteriores."
          />
        </Tarjeta>
      </section>
    </main>
  );
}