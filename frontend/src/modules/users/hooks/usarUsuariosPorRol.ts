import { useQuery } from '@tanstack/react-query';

import { rolesSistema } from '../../../config/constantesSistema';
import { usarAutenticacion } from '../../authentication/hooks/usarAutenticacion';
import { usuariosServicio } from '../services/usuariosServicio';
import { clavesConsultaUsuarios } from './clavesConsultaUsuarios';

type OpcionesUsuariosPorRol = {
  habilitado?: boolean;
};

function tieneRolValido(nombreRol: string | undefined) {
  return Boolean(nombreRol?.trim());
}

export function usarUsuariosPorRol(nombreRol: string | undefined, opciones?: OpcionesUsuariosPorRol) {
  const { estaAutenticado, cargandoSesion, roles } = usarAutenticacion();

  const esAdministrador = roles.includes(rolesSistema.administrador);
  const consultaHabilitada =
    estaAutenticado &&
    !cargandoSesion &&
    esAdministrador &&
    tieneRolValido(nombreRol) &&
    (opciones?.habilitado ?? true);

  return useQuery({
    queryKey: clavesConsultaUsuarios.porRol(nombreRol ?? ''),
    queryFn: () => usuariosServicio.obtenerUsuariosPorRol(nombreRol ?? ''),
    enabled: consultaHabilitada
  });
}