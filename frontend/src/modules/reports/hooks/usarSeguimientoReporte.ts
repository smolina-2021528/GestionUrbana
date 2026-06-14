import { useMutation, useQueryClient } from '@tanstack/react-query';

import { seguimientoReporteServicio } from '../services/seguimientoReporteServicio';
import { clavesConsultaReportes } from './clavesConsultaReportes';

function invalidarConsultasSeguimiento(queryClient: ReturnType<typeof useQueryClient>, reporteId: string) {
  void queryClient.invalidateQueries({
    queryKey: clavesConsultaReportes.seguimiento(reporteId)
  });

  void queryClient.invalidateQueries({
    queryKey: clavesConsultaReportes.detalle(reporteId)
  });

  void queryClient.invalidateQueries({
    queryKey: clavesConsultaReportes.listasSeguimiento()
  });
}

export function usarSeguirReporte() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reporteId: string) => seguimientoReporteServicio.seguirReporte(reporteId),
    onSuccess: (_respuesta, reporteId) => {
      invalidarConsultasSeguimiento(queryClient, reporteId);
    }
  });
}

export function usarDejarDeSeguirReporte() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reporteId: string) => seguimientoReporteServicio.dejarDeSeguirReporte(reporteId),
    onSuccess: (_respuesta, reporteId) => {
      invalidarConsultasSeguimiento(queryClient, reporteId);
    }
  });
}