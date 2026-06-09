import { rolesSistema } from '../../config/constantesSistema';
import type { RolSistema } from '../../config/constantesSistema';

const rolesActivos: RolSistema[] = [rolesSistema.administrador];

export function usarPermisos() {
  const esAdministrador = rolesActivos.includes(rolesSistema.administrador);
  const esCiudadano = rolesActivos.includes(rolesSistema.ciudadano);

  function puedeVerRuta(rolesPermitidos: readonly RolSistema[]) {
    return rolesPermitidos.some((rolPermitido) => rolesActivos.includes(rolPermitido));
  }

  return {
    rolesUsuario: rolesActivos,
    rolPrincipal: esAdministrador ? rolesSistema.administrador : rolesSistema.ciudadano,
    esAdministrador,
    esCiudadano,
    puedeVerRuta
  };
}