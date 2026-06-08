import type { ComponentPropsWithoutRef, ReactNode } from 'react';

type VarianteBoton = 'primario' | 'secundario' | 'peligro' | 'fantasma';

type TamanoBoton = 'sm' | 'md' | 'lg';

type PropiedadesBoton = {
  variante?: VarianteBoton;
  tamano?: TamanoBoton;
  anchoCompleto?: boolean;
  iconoIzquierdo?: ReactNode;
  iconoDerecho?: ReactNode;
} & ComponentPropsWithoutRef<'button'>;

function construirClasesBoton({
  variante,
  tamano,
  anchoCompleto,
  className
}: {
  variante: VarianteBoton;
  tamano: TamanoBoton;
  anchoCompleto: boolean;
  className?: string;
}) {
  return [
    'boton',
    `boton--${variante}`,
    `boton--${tamano}`,
    anchoCompleto ? 'boton--anchoCompleto' : '',
    className ?? ''
  ]
    .filter(Boolean)
    .join(' ');
}

export function Boton({
  children,
  variante = 'primario',
  tamano = 'md',
  anchoCompleto = false,
  iconoIzquierdo,
  iconoDerecho,
  className,
  type = 'button',
  ...propiedades
}: PropiedadesBoton) {
  return (
    <button
      className={construirClasesBoton({ variante, tamano, anchoCompleto, className })}
      type={type}
      {...propiedades}
    >
      {iconoIzquierdo ? <span className="boton__icono">{iconoIzquierdo}</span> : null}
      <span>{children}</span>
      {iconoDerecho ? <span className="boton__icono">{iconoDerecho}</span> : null}
    </button>
  );
}