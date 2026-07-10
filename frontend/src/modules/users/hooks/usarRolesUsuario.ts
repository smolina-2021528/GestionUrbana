import { useQuery } from '@tanstack/react-query';

import { usuariosServicio } from '../services/usuariosServicio';
import { clavesConsultaUsuarios } from './clavesConsultaUsuarios';
import { usarConsultaUsuariosHabilitada } from './usarConsultaUsuariosHabilitada';

type OpcionesRolesUsuario = {
  habilitado?: boolean;
};

function normalizarUsuarioId(
  usuarioId: string | undefined
) {
  return usuarioId?.trim() ?? '';
}

export function usarRolesUsuario(
  usuarioId: string | undefined,
  opciones?: OpcionesRolesUsuario
) {
  const {
    consultaAutenticadaHabilitada
  } = usarConsultaUsuariosHabilitada();

  const idNormalizado = normalizarUsuarioId(usuarioId);

  return useQuery({
    queryKey: clavesConsultaUsuarios.roles(
      idNormalizado
    ),
    queryFn: () =>
      usuariosServicio.obtenerRolesUsuario(
        idNormalizado
      ),
    enabled:
      consultaAutenticadaHabilitada &&
      Boolean(idNormalizado) &&
      (opciones?.habilitado ?? true)
  });
}