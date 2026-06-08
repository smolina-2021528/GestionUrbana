import type { ReactNode } from 'react';

type VarianteAlerta = 'informacion' | 'exito' | 'advertencia' | 'error';

type PropiedadesAlerta = {
  variante?: VarianteAlerta;
  titulo?: string;
  children: ReactNode;
};

export function Alerta({ variante = 'informacion', titulo, children }: PropiedadesAlerta) {
  return (
    <div className={`alerta alerta--${variante}`} role={variante === 'error' ? 'alert' : 'status'}>
      {titulo ? <p className="alerta__titulo">{titulo}</p> : null}
      <div className="alerta__contenido">{children}</div>
    </div>
  );
}