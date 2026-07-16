import { useMutation, useQueryClient } from '@tanstack/react-query';

import { clavesConsultaDashboard } from '../../dashboard/hooks/clavesConsultaDashboard';
import { reportesServicio } from '../services/reportesServicio';
import type { CambiarEstadoReportePayload } from '../types/reportesTipos';
import { clavesConsultaReportes } from './clavesConsultaReportes';

type CambiarEstadoReporteParametros = {
  reporteId: string;
  datos: CambiarEstadoReportePayload;
};

export function usarCambiarEstadoReporte() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reporteId, datos }: CambiarEstadoReporteParametros) =>
      reportesServicio.cambiarEstadoReporte(reporteId, datos),

    onSuccess: async (respuesta, variables) => {
      if (respuesta.success === false) {
        return;
      }

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: clavesConsultaReportes.detalle(variables.reporteId)
        }),
        queryClient.invalidateQueries({
          queryKey: clavesConsultaReportes.historial(variables.reporteId)
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