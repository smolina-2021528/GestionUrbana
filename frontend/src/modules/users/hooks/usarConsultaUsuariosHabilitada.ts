import { rolesSistema } from '../../../config/constantesSistema';
import { usarAutenticacion } from '../../authentication/hooks/usarAutenticacion';

export function usarConsultaUsuariosHabilitada() {
  const {
    estaAutenticado,
    cargandoSesion,
    roles,
    usuario
  } = usarAutenticacion();

  const esAdministrador = roles.includes(
    rolesSistema.administrador
  );

  const consultaAutenticadaHabilitada =
    estaAutenticado && !cargandoSesion;

  const consultaAdministrativaHabilitada =
    consultaAutenticadaHabilitada && esAdministrador;

  return {
    consultaAutenticadaHabilitada,
    consultaAdministrativaHabilitada,
    estaAutenticado,
    cargandoSesion,
    esAdministrador,
    usuario
  };
}