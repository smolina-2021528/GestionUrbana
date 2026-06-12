import { EstadoVacio } from '../../../shared/components/data/EstadoVacio';
import { Alerta } from '../../../shared/components/feedback/Alerta';
import { Cargando } from '../../../shared/components/feedback/Cargando';
import { Tarjeta } from '../../../shared/components/ui/Tarjeta';
import type { RankingZonasEstadisticas, ZonaEstadisticas } from '../types/estadisticasTipos';
import './analisisDashboard.css';

type PropiedadesBloqueZonas = {
  zonas?: RankingZonasEstadisticas;
  cargando?: boolean;
  mensajeError?: string;
};

function formatearNumero(valor: number) {
  return new Intl.NumberFormat('es-GT').format(valor);
}

function formatearCoordenada(valor: number) {
  return new Intl.NumberFormat('es-GT', {
    maximumFractionDigits: 5
  }).format(valor);
}

function obtenerTituloZona(zona: ZonaEstadisticas, tipo: 'spatial' | 'address') {
  if (tipo === 'address' && zona.zone) {
    return zona.zone;
  }

  if (zona.center) {
    return `Centro ${formatearCoordenada(zona.center.latitude)}, ${formatearCoordenada(
      zona.center.longitude
    )}`;
  }

  return 'Ubicación sin nombre';
}

function obtenerDescripcionZona(zona: ZonaEstadisticas) {
  const detalles = [
    zona.dominantCategory ? `Categoría dominante: ${zona.dominantCategory}` : null,
    zona.dominantPriority ? `Prioridad dominante: ${zona.dominantPriority}` : null
  ].filter(Boolean);

  return detalles.length > 0 ? detalles.join(' · ') : 'Sin clasificación dominante.';
}

function calcularPorcentaje(valor: number, maximo: number) {
  if (maximo <= 0) {
    return 0;
  }

  return Math.min(Math.max((valor / maximo) * 100, 0), 100);
}

function ListaRankingZonas({
  titulo,
  zonas,
  tipo,
  maximo
}: {
  titulo: string;
  zonas: ZonaEstadisticas[];
  tipo: 'spatial' | 'address';
  maximo: number;
}) {
  if (zonas.length === 0) {
    return null;
  }

  return (
    <section className="seccionRankingDashboard">
      <h4 className="seccionRankingDashboard__titulo">{titulo}</h4>

      <div className="listaRankingDashboard">
        {zonas.map((zona) => {
          const porcentaje = calcularPorcentaje(zona.reportCount, maximo);
          const llaveZona = `${tipo}-${zona.rank}-${zona.reportCount}-${zona.zone ?? zona.clusterId ?? 'zona'}`;

          return (
            <article className="itemAnaliticoDashboard tonoDashboard--advertencia" key={llaveZona}>
              <div className="itemAnaliticoDashboard__encabezado">
                <div className="itemAnaliticoDashboard__texto">
                  <span className="itemAnaliticoDashboard__titulo">
                    #{zona.rank} · {obtenerTituloZona(zona, tipo)}
                  </span>
                  <p className="itemAnaliticoDashboard__descripcion">
                    {obtenerDescripcionZona(zona)}
                  </p>
                </div>

                <strong className="itemAnaliticoDashboard__valor">
                  {formatearNumero(zona.reportCount)}
                </strong>
              </div>

              <div
                className="itemAnaliticoDashboard__pista"
                role="progressbar"
                aria-label={`${obtenerTituloZona(zona, tipo)}: ${formatearNumero(
                  zona.reportCount
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
    </section>
  );
}

export function BloqueZonas({ zonas, cargando = false, mensajeError }: PropiedadesBloqueZonas) {
  const zonasEspaciales = zonas?.spatial ?? [];
  const zonasPorDireccion = zonas?.byAddress ?? [];
  const maximoReportes = Math.max(
    ...zonasEspaciales.map((zona) => zona.reportCount),
    ...zonasPorDireccion.map((zona) => zona.reportCount),
    0
  );

  const tieneDatos =
    zonasEspaciales.some((zona) => zona.reportCount > 0) ||
    zonasPorDireccion.some((zona) => zona.reportCount > 0);

  return (
    <Tarjeta
      titulo="Zonas con mayor concentración"
      descripcion="Áreas donde se agrupan más reportes urbanos."
    >
      {cargando ? (
        <div className="bloqueAnaliticoDashboard__carga">
          <Cargando texto="Cargando zonas con mayor actividad..." />
        </div>
      ) : (
        <div className="bloqueAnaliticoDashboard">
          {mensajeError ? (
            <Alerta variante="advertencia" titulo="No se pudieron cargar las zonas">
              <p>{mensajeError}</p>
            </Alerta>
          ) : null}

          {tieneDatos ? (
            <>
              <ListaRankingZonas
                titulo="Agrupación geográfica"
                zonas={zonasEspaciales}
                tipo="spatial"
                maximo={maximoReportes}
              />

              <ListaRankingZonas
                titulo="Agrupación por dirección"
                zonas={zonasPorDireccion}
                tipo="address"
                maximo={maximoReportes}
              />
            </>
          ) : (
            <EstadoVacio
              titulo="Sin datos disponibles"
              descripcion="Aún no hay reportes con información territorial suficiente para mostrar zonas."
            />
          )}
        </div>
      )}
    </Tarjeta>
  );
}