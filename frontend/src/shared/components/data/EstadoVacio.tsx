import type { ReactNode } from 'react';

type PropiedadesEstadoVacio = {
  titulo: string;
  descripcion: string;
  accion?: ReactNode;
};

export function EstadoVacio({ titulo, descripcion, accion }: PropiedadesEstadoVacio) {
  return (
    <div className="estadoVacio">
      <div className="estadoVacio__icono" aria-hidden="true">
        CA
      </div>

      <div>
        <h2 className="estadoVacio__titulo">{titulo}</h2>
        <p className="estadoVacio__descripcion">{descripcion}</p>
      </div>

      {accion ? <div className="estadoVacio__accion">{accion}</div> : null}
    </div>
  );
}