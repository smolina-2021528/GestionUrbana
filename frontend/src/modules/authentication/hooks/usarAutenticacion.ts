import { useContext } from 'react';

import { ContextoAutenticacion } from '../../../app/providers/ProveedorAutenticacion';

export function usarAutenticacion() {
  const contexto = useContext(ContextoAutenticacion);

  if (!contexto) {
    throw new Error('usarAutenticacion debe utilizarse dentro de ProveedorAutenticacion.');
  }

  return contexto;
}