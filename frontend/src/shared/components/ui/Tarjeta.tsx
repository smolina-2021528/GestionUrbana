import type { HTMLAttributes, ReactNode } from 'react';

type PropiedadesTarjeta = HTMLAttributes<HTMLElement> & {
  titulo?: string;
  descripcion?: string;
  acciones?: ReactNode;
  children?: ReactNode;
};

export function Tarjeta({
  titulo,
  descripcion,
  acciones,
  children,
  className,
  ...propiedades
}: PropiedadesTarjeta) {
  const tieneEncabezado = Boolean(titulo || descripcion || acciones);

  return (
    <section className={className ? `tarjeta ${className}` : 'tarjeta'} {...propiedades}>
      {tieneEncabezado ? (
        <div className="tarjeta__encabezado">
          <div>
            {titulo ? <h2 className="tarjeta__titulo">{titulo}</h2> : null}
            {descripcion ? <p className="tarjeta__descripcion">{descripcion}</p> : null}
          </div>

          {acciones ? <div className="tarjeta__acciones">{acciones}</div> : null}
        </div>
      ) : null}

      {children ? <div className="tarjeta__contenido">{children}</div> : null}
    </section>
  );
}