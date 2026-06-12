import { EstadoVacio } from '../../../shared/components/data/EstadoVacio';
import { Alerta } from '../../../shared/components/feedback/Alerta';
import { Cargando } from '../../../shared/components/feedback/Cargando';
import { Tarjeta } from '../../../shared/components/ui/Tarjeta';
import type { TransicionEstadoEstadisticas } from '../types/estadisticasTipos';
import type { TonoVisualDashboard } from './TarjetaMetrica';
import './analisisDashboard.css';

type PropiedadesBloqueTransiciones = {
  transiciones?: TransicionEstadoEstadisticas[];
  cargando?: boolean;
  mensajeError?: string;
};

function formatearNumero(valor: number) {
  return new Intl.NumberFormat('es-GT').format(valor);
}

function normalizarEstadoTexto(estado: string | null | undefined) {
  if (!estado) {
    return 'Sin estado previo';
  }

  const texto = estado.replaceAll('_', ' ').toLowerCase();

  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function obtenerTonoPorEstado(estado: string | null | undefined): TonoVisualDashboard {
  switch (estado) {
    case 'PENDIENTE':
      return 'pendiente';
    case 'EN_PROCESO':
      return 'enProceso';
    case 'RESUELTO':
      return 'resuelto';
    case 'RECHAZADO':
      return 'rechazado';
    default:
      return 'neutro';
  }
}

function calcularPorcentaje(valor: number, maximo: number) {
  if (maximo <= 0) {
    return 0;
  }

  return Math.min(Math.max((valor / maximo) * 100, 0), 100);
}

export function BloqueTransiciones({
  transiciones,
  cargando = false,
  mensajeError
}: PropiedadesBloqueTransiciones) {
  const transicionesDisponibles = transiciones ?? [];
  const maximoTransiciones = Math.max(
    ...transicionesDisponibles.map((transicion) => transicion.count),
    0
  );
  const tieneDatos = transicionesDisponibles.some((transicion) => transicion.count > 0);

  return (
    <Tarjeta
      titulo="Movimientos de estado"
      descripcion="Cambios registrados durante la gestión de reportes."
    >
      {cargando ? (
        <div className="bloqueAnaliticoDashboard__carga">
          <Cargando texto="Cargando movimientos de estado..." />
        </div>
      ) : (
        <div className="bloqueAnaliticoDashboard">
          {mensajeError ? (
            <Alerta variante="advertencia" titulo="No se pudieron cargar los movimientos">
              <p>{mensajeError}</p>
            </Alerta>
          ) : null}

          {tieneDatos ? (
            <div className="listaTransicionesDashboard">
              {transicionesDisponibles.map((transicion) => {
                const porcentaje = calcularPorcentaje(transicion.count, maximoTransiciones);
                const tono = obtenerTonoPorEstado(transicion.newStatus);
                const estadoAnterior = normalizarEstadoTexto(transicion.previousStatus);
                const estadoNuevo = normalizarEstadoTexto(transicion.newStatus);
                const llave = `${transicion.previousStatus ?? 'inicial'}-${transicion.newStatus}`;

                return (
                  <article className={`itemAnaliticoDashboard tonoDashboard--${tono}`} key={llave}>
                    <div className="itemAnaliticoDashboard__encabezado">
                      <div className="itemAnaliticoDashboard__texto">
                        <span className="itemAnaliticoDashboard__titulo">
                          {estadoAnterior} → {estadoNuevo}
                        </span>

                        <p className="itemAnaliticoDashboard__descripcion">
                          Cambios de estado registrados en reportes.
                        </p>
                      </div>

                      <strong className="itemAnaliticoDashboard__valor">
                        {formatearNumero(transicion.count)}
                      </strong>
                    </div>

                    <div
                      className="itemAnaliticoDashboard__pista"
                      role="progressbar"
                      aria-label={`${estadoAnterior} a ${estadoNuevo}: ${formatearNumero(
                        transicion.count
                      )} movimientos`}
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
              descripcion="Aún no hay movimientos de estado registrados para mostrar."
            />
          )}
        </div>
      )}
    </Tarjeta>
  );
}