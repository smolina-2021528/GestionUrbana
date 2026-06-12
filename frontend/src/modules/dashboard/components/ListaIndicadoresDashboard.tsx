import type { ReactNode } from 'react';

import { EstadoVacio } from '../../../shared/components/data/EstadoVacio';
import { Tarjeta } from '../../../shared/components/ui/Tarjeta';
import type { TonoVisualDashboard } from './TarjetaMetrica';
import './dashboardComponentes.css';

export type IndicadorDashboard = {
  id: string;
  etiqueta: string;
  valor: number | string | null | undefined;
  descripcion?: string;
  prefijo?: string;
  sufijo?: string;
  tono?: TonoVisualDashboard;
};

type PropiedadesListaIndicadoresDashboard = {
  titulo: string;
  descripcion?: string;
  indicadores: IndicadorDashboard[];
  acciones?: ReactNode;
  tituloVacio?: string;
  descripcionVacia?: string;
};

function formatearValorIndicador(valor: number | string | null | undefined) {
  if (valor === null || valor === undefined || valor === '') {
    return '—';
  }

  if (typeof valor === 'number') {
    return new Intl.NumberFormat('es-GT').format(valor);
  }

  return valor;
}

function indicadorTieneValor(indicador: IndicadorDashboard) {
  return indicador.valor !== null && indicador.valor !== undefined && indicador.valor !== '';
}

export function ListaIndicadoresDashboard({
  titulo,
  descripcion,
  indicadores,
  acciones,
  tituloVacio = 'Sin datos disponibles',
  descripcionVacia = 'Aún no hay información suficiente para mostrar esta sección.'
}: PropiedadesListaIndicadoresDashboard) {
  const tieneIndicadores = indicadores.length > 0 && indicadores.some(indicadorTieneValor);

  return (
    <Tarjeta titulo={titulo} descripcion={descripcion} acciones={acciones}>
      {tieneIndicadores ? (
        <div className="listaIndicadoresDashboard">
          <dl className="listaIndicadoresDashboard__lista">
            {indicadores.map((indicador) => {
              const valorVisible = formatearValorIndicador(indicador.valor);
              const valorConFormato = `${indicador.prefijo ?? ''}${valorVisible}${indicador.sufijo ?? ''}`;

              return (
                <div
                  className={`listaIndicadoresDashboard__item tonoDashboard--${indicador.tono ?? 'principal'}`}
                  key={indicador.id}
                >
                  <div className="listaIndicadoresDashboard__texto">
                    <dt className="listaIndicadoresDashboard__etiqueta">{indicador.etiqueta}</dt>
                    {indicador.descripcion ? (
                      <dd className="listaIndicadoresDashboard__descripcion">
                        {indicador.descripcion}
                      </dd>
                    ) : null}
                  </div>

                  <dd className="listaIndicadoresDashboard__valor">{valorConFormato}</dd>
                </div>
              );
            })}
          </dl>
        </div>
      ) : (
        <EstadoVacio titulo={tituloVacio} descripcion={descripcionVacia} />
      )}
    </Tarjeta>
  );
}