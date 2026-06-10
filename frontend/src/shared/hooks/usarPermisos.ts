import {
  rolesSistema,
  rutasNavegacionPrincipal
} from '../../config/constantesSistema';
import type { RolSistema } from '../../config/constantesSistema';
import { usarAutenticacion } from '../../modules/authentication/hooks/usarAutenticacion';

export function usarPermisos() {
  const { roles } = usarAutenticacion();

  const rolesUsuario = roles as RolSistema[];
  const esAdministrador = rolesUsuario.includes(rolesSistema.administrador);
  const esCiudadano = rolesUsuario.includes(rolesSistema.ciudadano);

  function puedeVerRuta(rolesPermitidos: readonly RolSistema[]) {
    return rolesPermitidos.some((rolPermitido) => rolesUsuario.includes(rolPermitido));
  }

  function puedeVerUsuarios() {
    return esAdministrador;
  }

  function obtenerRutasVisibles() {
    return rutasNavegacionPrincipal.filter((ruta) => puedeVerRuta(ruta.roles));
  }

  return {
    rolesUsuario,
    rolPrincipal: esAdministrador ? rolesSistema.administrador : rolesSistema.ciudadano,
    esAdministrador,
    esCiudadano,
    puedeVerRuta,
    puedeVerUsuarios,
    obtenerRutasVisibles
  };
}