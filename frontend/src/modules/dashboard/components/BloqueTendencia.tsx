import { EstadoVacio } from '../../../shared/components/data/EstadoVacio';
import { Alerta } from '../../../shared/components/feedback/Alerta';
import { Cargando } from '../../../shared/components/feedback/Cargando';
import { Tarjeta } from '../../../shared/components/ui/Tarjeta';
import type { TendenciasDashboard } from '../types/estadisticasTipos';
import './analisisDashboard.css';

type PropiedadesBloqueTendencia = {
  tendencias?: TendenciasDashboard;
  cargando?: boolean;
  mensajeError?: string;
};

function formatearNumero(valor: number) {
  return new Intl.NumberFormat('es-GT').format(valor);
}

function formatearHoras(valor: number | null | undefined) {
  if (typeof valor !== 'number' || !Number.isFinite(valor)) {
    return null;
  }

  return `${new Intl.NumberFormat('es-GT', {
    maximumFractionDigits: 1
  }).format(valor)} h promedio`;
}

function formatearPeriodo(periodo: string) {
  if (!periodo) {
    return 'Período sin identificar';
  }

  return periodo;
}

function calcularPorcentaje(valor: number, maximo: number) {
  if (maximo <= 0) {
    return 0;
  }

  return Math.min(Math.max((valor / maximo) * 100, 0), 100);
}

export function BloqueTendencia({
  tendencias,
  cargando = false,
  mensajeError
}: PropiedadesBloqueTendencia) {
  const reportesPorPeriodo = tendencias?.trends ?? [];
  const resolucionPorPeriodo = new Map(
    (tendencias?.resolution ?? []).map((punto) => [punto.period, punto.avgHours])
  );

  const maximoReportes = Math.max(...reportesPorPeriodo.map((punto) => punto.total), 0);
  const tieneDatos = reportesPorPeriodo.some((punto) => punto.total > 0);

  return (
    <Tarjeta
      titulo="Tendencia de reportes"
      descripcion="Evolución de incidencias registradas en el período consultado."
    >
      {cargando ? (
        <div className="bloqueAnaliticoDashboard__carga">
          <Cargando texto="Cargando tendencia de reportes..." />
        </div>
      ) : (
        <div className="bloqueAnaliticoDashboard">
          {mensajeError ? (
            <Alerta variante="advertencia" titulo="No se pudo cargar la tendencia">
              <p>{mensajeError}</p>
            </Alerta>
          ) : null}

          {tieneDatos ? (
            <div className="listaTendenciasDashboard">
              {reportesPorPeriodo.map((punto) => {
                const porcentaje = calcularPorcentaje(punto.total, maximoReportes);
                const tiempoResolucion = formatearHoras(resolucionPorPeriodo.get(punto.period));

                return (
                  <article className="itemAnaliticoDashboard tonoDashboard--principal" key={punto.period}>
                    <div className="itemAnaliticoDashboard__encabezado">
                      <div className="itemAnaliticoDashboard__texto">
                        <span className="itemAnaliticoDashboard__titulo">
                          {formatearPeriodo(punto.period)}
                        </span>

                        {tiempoResolucion ? (
                          <p className="itemAnaliticoDashboard__descripcion">{tiempoResolucion}</p>
                        ) : null}
                      </div>

                      <strong className="itemAnaliticoDashboard__valor">
                        {formatearNumero(punto.total)}
                      </strong>
                    </div>

                    <div
                      className="itemAnaliticoDashboard__pista"
                      role="progressbar"
                      aria-label={`${formatearPeriodo(punto.period)}: ${formatearNumero(
                        punto.total
                      )} reportes`}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={Math.round(porcentaje)}
                    >
                      <div
                        className="itemAnaliticoDashboard__barraRelleno"
                        style={{ width: `${porcentaje}%` }}
                      />
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <EstadoVacio
              titulo="Sin datos disponibles"
              descripcion="Aún no hay reportes registrados para mostrar una tendencia."
            />
          )}
        </div>
      )}
    </Tarjeta>
  );
}