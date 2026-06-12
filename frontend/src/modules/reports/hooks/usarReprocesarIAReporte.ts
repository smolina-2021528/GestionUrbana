import { useMutation, useQueryClient } from '@tanstack/react-query';

import { reportesServicio } from '../services/reportesServicio';
import { clavesConsultaReportes } from './clavesConsultaReportes';

export function usarReprocesarIAReporte() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reporteId: string) => reportesServicio.reprocesarIAReporte(reporteId),
    onSuccess: (_respuesta, reporteId) => {
      void queryClient.invalidateQueries({
        queryKey: clavesConsultaReportes.detalle(reporteId)
      });

      void queryClient.invalidateQueries({
        queryKey: clavesConsultaReportes.listas()
      });
    }
  });
}