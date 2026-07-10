import {
  useMutation,
  useQueryClient
} from '@tanstack/react-query';

import { usarAutenticacion } from '../../authentication/hooks/usarAutenticacion';
import { usuariosServicio } from '../services/usuariosServicio';
import {
  rolesAdministrablesUsuario,
  type ParametrosCambiarRolUsuario
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
      void queryClient.invalidateQueries({
        queryKey: clavesConsultaUsuarios.listas()
      });

      void queryClient.invalidateQueries({
        queryKey: clavesConsultaUsuarios.roles(
          variables.usuarioId
        )
      });

      void queryClient.invalidateQueries({
        queryKey: clavesConsultaUsuarios.detalle(
          variables.usuarioId
        )
      });

      rolesAdministrablesUsuario.forEach((rol) => {
        void queryClient.invalidateQueries({
          queryKey: clavesConsultaUsuarios.porRol(rol)
        });
      });

      if (
        respuesta.success === true &&
        usuario?.id === variables.usuarioId
      ) {
        await refrescarPerfil();
      }
    }
  });
}