import { useMutation, useQueryClient } from '@tanstack/react-query';

import { reportesServicio } from '../services/reportesServicio';
import { clavesConsultaReportes } from './clavesConsultaReportes';

type EliminarImagenReporteParametros = {
  reporteId: string;
  imagenId: string;
};

export function usarEliminarImagenReporte() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reporteId, imagenId }: EliminarImagenReporteParametros) =>
      reportesServicio.eliminarImagenReporte(reporteId, imagenId),
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