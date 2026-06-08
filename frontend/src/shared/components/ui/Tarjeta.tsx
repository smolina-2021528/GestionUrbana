import type { ComponentPropsWithoutRef, ReactNode } from 'react';

type PropiedadesTarjeta = {
  titulo?: string;
  descripcion?: string;
  acciones?: ReactNode;
  children: ReactNode;
} & ComponentPropsWithoutRef<'section'>;

export function Tarjeta({
  titulo,
  descripcion,
  acciones,
  children,
  className,
  ...propiedades
}: PropiedadesTarjeta) {
  const clases = ['tarjeta', className ?? ''].filter(Boolean).join(' ');

  return (
    <section className={clases} {...propiedades}>
      {titulo || descripcion || acciones ? (
        <header className="tarjeta__encabezado">
          <div>
            {titulo ? <h2 className="tarjeta__titulo">{titulo}</h2> : null}
            {descripcion ? <p className="tarjeta__descripcion">{descripcion}</p> : null}
          </div>

          {acciones ? <div className="tarjeta__acciones">{acciones}</div> : null}
        </header>
      ) : null}

      <div className="tarjeta__contenido">{children}</div>
    </section>
  );
}