import {
  useMutation,
  useQueryClient
} from '@tanstack/react-query';

import { usarAutenticacion } from '../../authentication/hooks/usarAutenticacion';
import { usuariosServicio } from '../services/usuariosServicio';
import type {
  ParametrosCambiarRolUsuario
} from '../types/usuariosTipos';
import { clavesConsultaUsuarios } from './clavesConsultaUsuarios';

export function usarCambiarRolUsuario() {
  const queryClient = useQueryClient();

  const {
    usuario,
    refrescarPerfil
  } = usarAutenticacion();

  return useMutation({
    mutationFn: ({
      usuarioId,
      datos
    }: ParametrosCambiarRolUsuario) =>
      usuariosServicio.cambiarRolUsuario(
        usuarioId,
        datos
      ),

    onSuccess: async (respuesta, variables) => {
      if (respuesta.success === false) {
        return;
      }

      await queryClient.invalidateQueries({
        queryKey: clavesConsultaUsuarios.todos
      });

      if (usuario?.id === variables.usuarioId) {
        await refrescarPerfil();
      }
    }
  });
}