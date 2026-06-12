import { useQuery } from '@tanstack/react-query';

import { reportesServicio } from '../services/reportesServicio';
import { clavesConsultaReportes } from './clavesConsultaReportes';
import { usarConsultaReportesHabilitada } from './usarConsultaReportesHabilitada';

type OpcionesConsultaReporteDetalle = {
  habilitado?: boolean;
};

export function usarReporteDetalle(
  reporteId: string | undefined,
  opciones?: OpcionesConsultaReporteDetalle
) {
  const { consultaHabilitada } = usarConsultaReportesHabilitada();
  const tieneReporteId = Boolean(reporteId?.trim());

  return useQuery({
    queryKey: clavesConsultaReportes.detalle(reporteId ?? ''),
    queryFn: () => reportesServicio.obtenerReportePorId(reporteId ?? ''),
    enabled: consultaHabilitada && tieneReporteId && (opciones?.habilitado ?? true)
  });
}