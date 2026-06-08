import { BrowserRouter } from 'react-router-dom';

import { RutasAplicacion } from './rutas';

export default function App() {
  return (
    <BrowserRouter>
      <RutasAplicacion />
    </BrowserRouter>
  );
}