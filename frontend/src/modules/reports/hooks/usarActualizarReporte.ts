import { useMutation, useQueryClient } from '@tanstack/react-query';

import { reportesServicio } from '../services/reportesServicio';
import type { ActualizarReportePayload } from '../types/reportesTipos';
import { clavesConsultaReportes } from './clavesConsultaReportes';

type ActualizarReporteParametros = {
  reporteId: string;
  datos: ActualizarReportePayload;
};

export function usarActualizarReporte() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reporteId, datos }: ActualizarReporteParametros) =>
      reportesServicio.actualizarReporte(reporteId, datos),
    onSuccess: (_respuesta, variables) => {
      void queryClient.invalidateQueries({
        queryKey: clavesConsultaReportes.detalle(variables.reporteId)
      });

      void queryClient.invalidateQueries({
        queryKey: clavesConsultaReportes.listas()
      });
    }
  });
}