import { useMutation, useQueryClient } from '@tanstack/react-query';

import { reportesServicio } from '../services/reportesServicio';
import type { CrearReportePayload } from '../types/reportesTipos';
import { clavesConsultaReportes } from './clavesConsultaReportes';

export function usarCrearReporte() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (datos: CrearReportePayload) => reportesServicio.crearReporte(datos),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: clavesConsultaReportes.listas()
      });

      void queryClient.invalidateQueries({
        queryKey: clavesConsultaReportes.todos
      });
    }
  });
}