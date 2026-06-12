import { useQuery } from '@tanstack/react-query';

import { reportesServicio } from '../services/reportesServicio';
import { clavesConsultaReportes } from './clavesConsultaReportes';
import { usarConsultaReportesHabilitada } from './usarConsultaReportesHabilitada';

type OpcionesConsultaHistorial = {
  habilitado?: boolean;
};

export function usarHistorialReporte(
  reporteId: string | undefined,
  opciones?: OpcionesConsultaHistorial
) {
  const { consultaHabilitada } = usarConsultaReportesHabilitada();
  const tieneReporteId = Boolean(reporteId?.trim());

  return useQuery({
    queryKey: clavesConsultaReportes.historial(reporteId ?? ''),
    queryFn: () => reportesServicio.obtenerHistorialReporte(reporteId ?? ''),
    enabled: consultaHabilitada && tieneReporteId && (opciones?.habilitado ?? true)
  });
}