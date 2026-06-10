import type { ReactNode } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { obtenerRutaInicioPorRoles } from '../../config/constantesSistema';
import { usarAutenticacion } from '../../modules/authentication/hooks/usarAutenticacion';
import { Cargando } from '../../shared/components/feedback/Cargando';

type EstadoNavegacion = {
  desde?: string;
};

type PropiedadesRutaPublica = {
  children?: ReactNode;
};

export function RutaPublica({ children }: PropiedadesRutaPublica) {
  const ubicacion = useLocation();
  const { estaAutenticado, cargandoSesion, roles } = usarAutenticacion();
  const estadoNavegacion = ubicacion.state as EstadoNavegacion | null;

  if (cargandoSesion) {
    return (
      <main className="paginaTemporal">
        <Cargando texto="Validando sesión..." />
      </main>
    );
  }

  if (estaAutenticado) {
    return <Navigate replace to={estadoNavegacion?.desde ?? obtenerRutaInicioPorRoles(roles)} />;
  }

  return children ?? <Outlet />;
}