import {
  useMutation,
  useQueryClient
} from '@tanstack/react-query';

import { usuariosServicio } from '../services/usuariosServicio';
import {
  rolesAdministrablesUsuario
} from '../types/usuariosTipos';
import { clavesConsultaUsuarios } from './clavesConsultaUsuarios';

export function usarCambiarEstadoUsuario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (usuarioId: string) =>
      usuariosServicio.cambiarEstadoUsuario(
        usuarioId
      ),

    onSuccess: (_respuesta, usuarioId) => {
      void queryClient.invalidateQueries({
        queryKey: clavesConsultaUsuarios.listas()
      });

      void queryClient.invalidateQueries({
        queryKey: clavesConsultaUsuarios.detalle(
          usuarioId
        )
      });

      void queryClient.invalidateQueries({
        queryKey: clavesConsultaUsuarios.roles(
          usuarioId
        )
      });

      rolesAdministrablesUsuario.forEach((rol) => {
        void queryClient.invalidateQueries({
          queryKey: clavesConsultaUsuarios.porRol(rol)
        });
      });
    }
  });
}