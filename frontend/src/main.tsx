import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import 'leaflet/dist/leaflet.css';

import App from './app/App';
import './modules/reports/config/mapaConfig';
import './styles/global.css';

const contenedorRaiz = document.getElementById('root');

if (!contenedorRaiz) {
  throw new Error('No se encontró el contenedor raíz de Ciudad Activa.');
}

createRoot(contenedorRaiz).render(
  <StrictMode>
    <App />
  </StrictMode>
);