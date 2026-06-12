import { useMutation, useQueryClient } from '@tanstack/react-query';

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
    onSuccess: (_respuesta, variables) => {
      void queryClient.invalidateQueries({
        queryKey: clavesConsultaReportes.detalle(variables.reporteId)
      });

      void queryClient.invalidateQueries({
        queryKey: clavesConsultaReportes.historial(variables.reporteId)
      });

      void queryClient.invalidateQueries({
        queryKey: clavesConsultaReportes.listas()
      });
    }
  });
}