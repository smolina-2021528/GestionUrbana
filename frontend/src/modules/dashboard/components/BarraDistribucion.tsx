import type { TonoVisualDashboard } from './TarjetaMetrica';
import './dashboardComponentes.css';

export type PropiedadesBarraDistribucion = {
  etiqueta: string;
  valor: number;
  total?: number;
  porcentaje?: number;
  descripcion?: string;
  detalle?: string;
  tono?: TonoVisualDashboard;
};

function limitarPorcentaje(valor: number) {
  if (!Number.isFinite(valor)) {
    return 0;
  }

  return Math.min(Math.max(valor, 0), 100);
}

function calcularPorcentaje({
  valor,
  total,
  porcentaje
}: {
  valor: number;
  total?: number;
  porcentaje?: number;
}) {
  if (typeof porcentaje === 'number') {
    return limitarPorcentaje(porcentaje);
  }

  if (!total || total <= 0) {
    return 0;
  }

  return limitarPorcentaje((valor / total) * 100);
}

function formatearNumero(valor: number) {
  return new Intl.NumberFormat('es-GT').format(valor);
}

function formatearPorcentaje(valor: number) {
  return `${new Intl.NumberFormat('es-GT', {
    maximumFractionDigits: 1
  }).format(valor)}%`;
}

export function BarraDistribucion({
  etiqueta,
  valor,
  total,
  porcentaje,
  descripcion,
  detalle,
  tono = 'principal'
}: PropiedadesBarraDistribucion) {
  const porcentajeCalculado = calcularPorcentaje({ valor, total, porcentaje });
  const porcentajeVisible = formatearPorcentaje(porcentajeCalculado);
  const valorVisible = formatearNumero(valor);

  return (
    <article className={`barraDistribucionDashboard tonoDashboard--${tono}`}>
      <div className="barraDistribucionDashboard__encabezado">
        <div className="barraDistribucionDashboard__texto">
          <span className="barraDistribucionDashboard__etiqueta">{etiqueta}</span>
          {descripcion ? (
            <p className="barraDistribucionDashboard__descripcion">{descripcion}</p>
          ) : null}
        </div>

        <div className="barraDistribucionDashboard__valores">
          <span className="barraDistribucionDashboard__valor">{valorVisible}</span>
          <span className="barraDistribucionDashboard__porcentaje">{porcentajeVisible}</span>
        </div>
      </div>

      <div
        className="barraDistribucionDashboard__pista"
        role="progressbar"
        aria-label={`${etiqueta}: ${porcentajeVisible}`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(porcentajeCalculado)}
      >
        <div
          className="barraDistribucionDashboard__relleno"
          style={{ width: `${porcentajeCalculado}%` }}
        />
      </div>

      {detalle ? <p className="barraDistribucionDashboard__detalle">{detalle}</p> : null}
    </article>
  );
}