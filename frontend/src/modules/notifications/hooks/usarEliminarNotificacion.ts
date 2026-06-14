import { useMutation, useQueryClient } from '@tanstack/react-query';

import { notificacionesServicio } from '../services/notificacionesServicio';
import { clavesConsultaNotificaciones } from './clavesConsultaNotificaciones';

export function usarEliminarNotificacion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificacionId: string) =>
      notificacionesServicio.eliminarNotificacion(notificacionId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: clavesConsultaNotificaciones.todos
      });
    }
  });
}