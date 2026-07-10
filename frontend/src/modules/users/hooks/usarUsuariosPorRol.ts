import { useQuery } from '@tanstack/react-query';

import { usuariosServicio } from '../services/usuariosServicio';
import { clavesConsultaUsuarios } from './clavesConsultaUsuarios';
import { usarConsultaUsuariosHabilitada } from './usarConsultaUsuariosHabilitada';

type OpcionesUsuariosPorRol = {
  habilitado?: boolean;
};

function normalizarNombreRol(
  nombreRol: string | undefined
) {
  return nombreRol?.trim().toUpperCase() ?? '';
}

export function usarUsuariosPorRol(
  nombreRol: string | undefined,
  opciones?: OpcionesUsuariosPorRol
) {
  const {
    consultaAdministrativaHabilitada
  } = usarConsultaUsuariosHabilitada();

  const rolNormalizado = normalizarNombreRol(nombreRol);

  return useQuery({
    queryKey: clavesConsultaUsuarios.porRol(
      rolNormalizado
    ),
    queryFn: () =>
      usuariosServicio.obtenerUsuariosPorRol(
        rolNormalizado
      ),
    enabled:
      consultaAdministrativaHabilitada &&
      Boolean(rolNormalizado) &&
      (opciones?.habilitado ?? true)
  });
}