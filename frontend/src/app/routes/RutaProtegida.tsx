import type { ReactNode } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

import {
  obtenerRutaInicioPorRoles,
  rutasAplicacion,
  rolesSistema
} from '../../config/constantesSistema';
import type { RolSistema } from '../../config/constantesSistema';
import { usarAutenticacion } from '../../modules/authentication/hooks/usarAutenticacion';
import { Cargando } from '../../shared/components/feedback/Cargando';

type PropiedadesRutaProtegida = {
  children?: ReactNode;
  rolesPermitidos?: readonly RolSistema[];
};

function usuarioTienePermiso(rolesUsuario: readonly string[], rolesPermitidos?: readonly RolSistema[]) {
  if (!rolesPermitidos || rolesPermitidos.length === 0) {
    return true;
  }

  return rolesPermitidos.some((rolPermitido) => rolesUsuario.includes(rolPermitido));
}

export function RutaProtegida({ children, rolesPermitidos }: PropiedadesRutaProtegida) {
  const ubicacion = useLocation();
  const { estaAutenticado, cargandoSesion, roles } = usarAutenticacion();

  if (cargandoSesion) {
    return (
      <main className="paginaTemporal">
        <Cargando texto="Validando sesión..." />
      </main>
    );
  }

  if (!estaAutenticado) {
    return <Navigate replace state={{ desde: ubicacion.pathname }} to={rutasAplicacion.login} />;
  }

  if (!usuarioTienePermiso(roles, rolesPermitidos)) {
    const rutaInicio = obtenerRutaInicioPorRoles(roles);

    return (
      <Navigate
        replace
        to={rutaInicio === rutasAplicacion.login ? rutasAplicacion.login : rutaInicio}
      />
    );
  }

  return children ?? <Outlet />;
}

export const rolesAdministrador = [rolesSistema.administrador] as const;

export const rolesUsuarioAutenticado = [rolesSistema.administrador, rolesSistema.ciudadano] as const;