import { rolesSistema } from '../../../config/constantesSistema';
import { usarAutenticacion } from '../../authentication/hooks/usarAutenticacion';

export function usarConsultaDashboardAdminHabilitada() {
  const { estaAutenticado, cargandoSesion, roles } = usarAutenticacion();

  const esAdministrador = roles.includes(rolesSistema.administrador);
  const consultaHabilitada = estaAutenticado && !cargandoSesion && esAdministrador;

  return {
    consultaHabilitada,
    estaAutenticado,
    cargandoSesion,
    esAdministrador
  };
}