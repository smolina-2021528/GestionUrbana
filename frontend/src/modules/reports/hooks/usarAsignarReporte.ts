import { useMutation, useQueryClient } from '@tanstack/react-query';

import { clavesConsultaDashboard } from '../../dashboard/hooks/clavesConsultaDashboard';
import { reportesServicio } from '../services/reportesServicio';
import type { AsignarReportePayload } from '../types/reportesTipos';
import { clavesConsultaReportes } from './clavesConsultaReportes';

type AsignarReporteParametros = {
  reporteId: string;
  datos: AsignarReportePayload;
};

export function usarAsignarReporte() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reporteId, datos }: AsignarReporteParametros) =>
      reportesServicio.asignarReporte(reporteId, datos),

    onSuccess: async (respuesta, variables) => {
      if (respuesta.success === false) {
        return;
      }

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: clavesConsultaReportes.detalle(variables.reporteId)
        }),
        queryClient.invalidateQueries({
          queryKey: clavesConsultaReportes.listas()
        }),
        queryClient.invalidateQueries({
          queryKey: clavesConsultaDashboard.todos
        })
      ]);
    }
  });
}