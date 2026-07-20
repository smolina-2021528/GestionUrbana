import {
  useMutation,
  useQuery,
  useQueryClient
} from '@tanstack/react-query';

import { notificacionesService } from '../services/notificaciones.service';
import type { FiltrosNotificaciones } from '../types/notificaciones.types';

export const clavesNotificacionesMobile = {
  todas: ['notificaciones-mobile'] as const,
  listado: (filtros?: FiltrosNotificaciones) =>
    [
      'notificaciones-mobile',
      'listado',
      filtros ?? {}
    ] as const,
  resumen: ['notificaciones-mobile', 'resumen'] as const
};

export function useNotificaciones(filtros?: FiltrosNotificaciones) {
  return useQuery({
    queryKey: clavesNotificacionesMobile.listado(filtros),
    queryFn: () => notificacionesService.obtenerNotificaciones(filtros)
  });
}

export function useResumenNotificaciones() {
  return useQuery({
    queryKey: clavesNotificacionesMobile.resumen,
    queryFn: () =>
      notificacionesService.obtenerNotificaciones({
        page: 1,
        limit: 5
      }),
    staleTime: 1000 * 20
  });
}

export function useMarcarNotificacionLeida() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificacionId: string) =>
      notificacionesService.marcarComoLeida(notificacionId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: clavesNotificacionesMobile.todas
      });
    }
  });
}

export function useMarcarTodasNotificacionesLeidas() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificacionesService.marcarTodasComoLeidas(),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: clavesNotificacionesMobile.todas
      });
    }
  });
}

export function useEliminarNotificacion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificacionId: string) =>
      notificacionesService.eliminarNotificacion(notificacionId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: clavesNotificacionesMobile.todas
      });
    }
  });
}