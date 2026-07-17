import { useMutation, useQueryClient } from '@tanstack/react-query';

import { clienteReportes } from '../../../shared/services/clienteHttp';
import { clavesReportesMobile } from './useMisReportes';

type EliminarReporteResponse = {
  success: boolean;
  message?: string;
};

async function eliminarReporte(reporteId: string) {
  const respuesta = await clienteReportes.delete<EliminarReporteResponse>(
    `/reports/${encodeURIComponent(reporteId)}`
  );

  return respuesta.data;
}

export function useEliminarReporte() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: eliminarReporte,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: clavesReportesMobile.todos
      });
    }
  });
}