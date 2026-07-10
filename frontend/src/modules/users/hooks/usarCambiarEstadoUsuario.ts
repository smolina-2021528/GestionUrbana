import {
  useMutation,
  useQueryClient
} from '@tanstack/react-query';

import { usuariosServicio } from '../services/usuariosServicio';
import { clavesConsultaUsuarios } from './clavesConsultaUsuarios';

export function usarCambiarEstadoUsuario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (usuarioId: string) =>
      usuariosServicio.cambiarEstadoUsuario(
        usuarioId
      ),

    onSuccess: async (respuesta) => {
      if (respuesta.success === false) {
        return;
      }

      await queryClient.invalidateQueries({
        queryKey: clavesConsultaUsuarios.todos
      });
    }
  });
}