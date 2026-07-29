import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';

import { ProveedorAutenticacion } from './providers/ProveedorAutenticacion';
import { ProveedorConsultas } from './providers/ProveedorConsultas';
import { RutasAplicacion } from './rutas';

export default function App() {
  useEffect(() => {
    const temaGuardado = localStorage.getItem('tema') || 'light';
    document.documentElement.setAttribute('data-theme', temaGuardado);
  }, []);

  return (
    <ProveedorConsultas>
      <BrowserRouter>
        <ProveedorAutenticacion>
          <RutasAplicacion />
        </ProveedorAutenticacion>
      </BrowserRouter>
    </ProveedorConsultas>
  );
}