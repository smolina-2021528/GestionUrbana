import type { ReactNode } from 'react';

import { Tarjeta } from '../../../shared/components/ui/Tarjeta';
import './dashboardComponentes.css';

export type TonoVisualDashboard =
  | 'principal'
  | 'exito'
  | 'advertencia'
  | 'error'
  | 'neutro'
  | 'pendiente'
  | 'enProceso'
  | 'resuelto'
  | 'rechazado'
  | 'prioridadAlta'
  | 'prioridadMedia'
  | 'prioridadBaja';

type TipoTendenciaMetrica = 'positiva' | 'negativa' | 'neutral';

type TendenciaMetrica = {
  texto: string;
  tipo?: TipoTendenciaMetrica;
};

export type PropiedadesTarjetaMetrica = {
  etiqueta: string;
  valor: number | string | null | undefined;
  descripcion?: string;
  prefijo?: string;
  sufijo?: string;
  icono?: ReactNode;
  tono?: TonoVisualDashboard;
  tendencia?: TendenciaMetrica;
  className?: string;
};

function formatearValorMetrica(valor: number | string | null | undefined) {
  if (valor === null || valor === undefined || valor === '') {
    return '—';
  }

  if (typeof valor === 'number') {
    return new Intl.NumberFormat('es-GT').format(valor);
  }

  return valor;
}

function construirClaseTarjeta(tono: TonoVisualDashboard, className?: string) {
  return ['tarjetaMetricaDashboard', `tonoDashboard--${tono}`, className ?? '']
    .filter(Boolean)
    .join(' ');
}

export function TarjetaMetrica({
  etiqueta,
  valor,
  descripcion,
  prefijo,
  sufijo,
  icono,
  tono = 'principal',
  tendencia,
  className
}: PropiedadesTarjetaMetrica) {
  const valorVisible = formatearValorMetrica(valor);
  const valorConFormato = `${prefijo ?? ''}${valorVisible}${sufijo ?? ''}`;
  const tipoTendencia = tendencia?.tipo ?? 'neutral';

  return (
    <Tarjeta className={construirClaseTarjeta(tono, className)} aria-label={`${etiqueta}: ${valorConFormato}`}>
      <article className="tarjetaMetricaDashboard__contenido">
        <div className="tarjetaMetricaDashboard__encabezado">
          <p className="tarjetaMetricaDashboard__etiqueta">{etiqueta}</p>

          {icono ? (
            <span className="tarjetaMetricaDashboard__icono" aria-hidden="true">
              {icono}
            </span>
          ) : null}
        </div>

        <strong className="tarjetaMetricaDashboard__valor">{valorConFormato}</strong>

        {descripcion ? <p className="tarjetaMetricaDashboard__descripcion">{descripcion}</p> : null}

        {tendencia ? (
          <div className="tarjetaMetricaDashboard__pie">
            <span
              className={`tarjetaMetricaDashboard__tendencia tarjetaMetricaDashboard__tendencia--${tipoTendencia}`}
            >
              {tendencia.texto}
            </span>
          </div>
        ) : null}
      </article>
    </Tarjeta>
  );
}