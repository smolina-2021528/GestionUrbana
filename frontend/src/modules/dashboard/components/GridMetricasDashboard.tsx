import { TarjetaMetrica, type PropiedadesTarjetaMetrica } from './TarjetaMetrica';
import './dashboardComponentes.css';

export type MetricaDashboard = PropiedadesTarjetaMetrica & {
  id: string;
};

type PropiedadesGridMetricasDashboard = {
  metricas: MetricaDashboard[];
  tituloAccesible?: string;
};

export function GridMetricasDashboard({
  metricas,
  tituloAccesible = 'Métricas principales del dashboard'
}: PropiedadesGridMetricasDashboard) {
  return (
    <section className="gridMetricasDashboard" aria-label={tituloAccesible}>
      {metricas.map(({ id, ...metrica }) => (
        <TarjetaMetrica key={id} {...metrica} />
      ))}
    </section>
  );
}