import type { ReactNode } from 'react';

import { EstadoVacio } from '../../../shared/components/data/EstadoVacio';
import { Tarjeta } from '../../../shared/components/ui/Tarjeta';
import { BarraDistribucion } from './BarraDistribucion';
import type { TonoVisualDashboard } from './TarjetaMetrica';
import './dashboardComponentes.css';

export type ElementoDistribucionDashboard = {
  id: string;
  etiqueta: string;
  valor: number;
  descripcion?: string;
  detalle?: string;
  tono?: TonoVisualDashboard;
};

type PropiedadesBloqueDistribucion = {
  titulo: string;
  descripcion?: string;
  elementos: ElementoDistribucionDashboard[];
  total?: number;
  acciones?: ReactNode;
  tituloVacio?: string;
  descripcionVacia?: string;
  mostrarResumen?: boolean;
  etiquetaTotal?: string;
};

function obtenerTotalDistribucion(elementos: ElementoDistribucionDashboard[], total?: number) {
  if (typeof total === 'number') {
    return total;
  }

  return elementos.reduce((acumulado, elemento) => acumulado + elemento.valor, 0);
}

function formatearNumero(valor: number) {
  return new Intl.NumberFormat('es-GT').format(valor);
}

export function BloqueDistribucion({
  titulo,
  descripcion,
  elementos,
  total,
  acciones,
  tituloVacio = 'Sin datos disponibles',
  descripcionVacia = 'Aún no hay reportes registrados para mostrar indicadores.',
  mostrarResumen = true,
  etiquetaTotal = 'Total'
}: PropiedadesBloqueDistribucion) {
  const totalDistribucion = obtenerTotalDistribucion(elementos, total);
  const tieneDatos = elementos.length > 0 && totalDistribucion > 0;

  return (
    <Tarjeta titulo={titulo} descripcion={descripcion} acciones={acciones}>
      {tieneDatos ? (
        <div className="bloqueDistribucionDashboard">
          <div className="bloqueDistribucionDashboard__lista">
            {elementos.map((elemento) => (
              <BarraDistribucion
                key={elemento.id}
                etiqueta={elemento.etiqueta}
                valor={elemento.valor}
                total={totalDistribucion}
                descripcion={elemento.descripcion}
                detalle={elemento.detalle}
                tono={elemento.tono}
              />
            ))}
          </div>

          {mostrarResumen ? (
            <div className="bloqueDistribucionDashboard__resumen">
              <span>{etiquetaTotal}</span>
              <strong>{formatearNumero(totalDistribucion)}</strong>
            </div>
          ) : null}
        </div>
      ) : (
        <EstadoVacio titulo={tituloVacio} descripcion={descripcionVacia} />
      )}
    </Tarjeta>
  );
}