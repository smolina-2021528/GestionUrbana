import { useMutation, useQueryClient } from '@tanstack/react-query';

import { reportesServicio } from '../services/reportesServicio';
import type { ActualizarUbicacionReportePayload } from '../types/reportesTipos';
import { clavesConsultaReportes } from './clavesConsultaReportes';

type ActualizarUbicacionReporteParametros = {
  reporteId: string;
  datos: ActualizarUbicacionReportePayload;
};

export function usarActualizarUbicacionReporte() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reporteId, datos }: ActualizarUbicacionReporteParametros) =>
      reportesServicio.actualizarUbicacionReporte(reporteId, datos),
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

export function usarEliminarUbicacionReporte() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reporteId: string) => reportesServicio.eliminarUbicacionReporte(reporteId),
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