import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './aplicacion/App';

const contenedorRaiz = document.getElementById('root');

if (!contenedorRaiz) {
  throw new Error('No se encontró el contenedor raíz de Ciudad Activa.');
}

createRoot(contenedorRaiz).render(
  <StrictMode>
    <App />
  </StrictMode>
);