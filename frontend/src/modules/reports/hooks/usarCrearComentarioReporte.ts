import { useMutation, useQueryClient } from '@tanstack/react-query';

import { comentariosReporteServicio } from '../services/comentariosReporteServicio';
import type { CrearComentarioReportePayload } from '../types/interaccionesReporteTipos';
import { clavesConsultaReportes } from './clavesConsultaReportes';

type CrearComentarioReporteParametros = {
  reporteId: string;
  datos: CrearComentarioReportePayload;
};

export function usarCrearComentarioReporte() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reporteId, datos }: CrearComentarioReporteParametros) =>
      comentariosReporteServicio.crearComentarioReporte(reporteId, datos),
    onSuccess: (_respuesta, variables) => {
      void queryClient.invalidateQueries({
        queryKey: clavesConsultaReportes.comentariosReporte(variables.reporteId)
      });

      void queryClient.invalidateQueries({
        queryKey: clavesConsultaReportes.detalle(variables.reporteId)
      });
    }
  });
}