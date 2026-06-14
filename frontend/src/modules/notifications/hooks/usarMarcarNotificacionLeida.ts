import { useMutation, useQueryClient } from '@tanstack/react-query';

import { notificacionesServicio } from '../services/notificacionesServicio';
import { clavesConsultaNotificaciones } from './clavesConsultaNotificaciones';

export function usarMarcarNotificacionLeida() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificacionId: string) =>
      notificacionesServicio.marcarNotificacionLeida(notificacionId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: clavesConsultaNotificaciones.todos
      });
    }
  });
}