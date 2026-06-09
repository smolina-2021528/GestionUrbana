import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import { obtenerInformacionRuta } from '../../config/constantesSistema';
import { marcaCiudadActiva } from '../../design/identity/marca';

export function usarTituloPagina() {
  const ubicacion = useLocation();

  useEffect(() => {
    const informacionRuta = obtenerInformacionRuta(ubicacion.pathname);
    document.title = `${informacionRuta.titulo} | ${marcaCiudadActiva.nombre}`;
  }, [ubicacion.pathname]);
}