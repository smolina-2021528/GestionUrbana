import { useMutation, useQueryClient } from '@tanstack/react-query';

import { reportesServicio } from '../services/reportesServicio';
import { clavesConsultaReportes } from './clavesConsultaReportes';

export function usarEliminarReporte() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reporteId: string) => reportesServicio.eliminarReporte(reporteId),
    onSuccess: (_respuesta, reporteId) => {
      void queryClient.removeQueries({
        queryKey: clavesConsultaReportes.detalle(reporteId)
      });

      void queryClient.invalidateQueries({
        queryKey: clavesConsultaReportes.listas()
      });
    }
  });
}