import { useMutation, useQueryClient } from '@tanstack/react-query';

import { comentariosReporteServicio } from '../services/comentariosReporteServicio';
import { clavesConsultaReportes } from './clavesConsultaReportes';

type EliminarComentarioReporteParametros = {
  reporteId: string;
  comentarioId: string;
};

export function usarEliminarComentarioReporte() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reporteId, comentarioId }: EliminarComentarioReporteParametros) =>
      comentariosReporteServicio.eliminarComentarioReporte(reporteId, comentarioId),
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