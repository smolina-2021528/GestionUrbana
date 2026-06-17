import { useMutation, useQueryClient, type QueryClient } from '@tanstack/react-query';

import { reportesServicio } from '../services/reportesServicio';
import type { ActualizarUbicacionReportePayload } from '../types/reportesTipos';
import { clavesConsultaReportes } from './clavesConsultaReportes';

type ActualizarUbicacionReporteParametros = {
  reporteId: string;
  datos: ActualizarUbicacionReportePayload;
};

function invalidarConsultasUbicacion(queryClient: QueryClient, reporteId: string) {
  void queryClient.invalidateQueries({
    queryKey: clavesConsultaReportes.detalle(reporteId)
  });

  void queryClient.invalidateQueries({
    queryKey: clavesConsultaReportes.todos
  });
}

export function usarActualizarUbicacionReporte() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reporteId, datos }: ActualizarUbicacionReporteParametros) =>
      reportesServicio.actualizarUbicacionReporte(reporteId, datos),
    onSuccess: (_respuesta, variables) => {
      invalidarConsultasUbicacion(queryClient, variables.reporteId);
    }
  });
}

export function usarEliminarUbicacionReporte() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reporteId: string) => reportesServicio.eliminarUbicacionReporte(reporteId),
    onSuccess: (_respuesta, reporteId) => {
      invalidarConsultasUbicacion(queryClient, reporteId);
    }
  });
}