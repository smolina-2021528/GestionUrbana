import { BrowserRouter } from 'react-router-dom';

import { ProveedorAutenticacion } from './providers/ProveedorAutenticacion';
import { ProveedorConsultas } from './providers/ProveedorConsultas';
import { RutasAplicacion } from './rutas';

export default function App() {
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