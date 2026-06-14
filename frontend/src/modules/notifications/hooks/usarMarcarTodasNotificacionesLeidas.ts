import { useMutation, useQueryClient } from '@tanstack/react-query';

import { notificacionesServicio } from '../services/notificacionesServicio';
import { clavesConsultaNotificaciones } from './clavesConsultaNotificaciones';

export function usarMarcarTodasNotificacionesLeidas() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificacionesServicio.marcarTodasNotificacionesLeidas(),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: clavesConsultaNotificaciones.todos
      });
    }
  });
}