import { useQuery } from '@tanstack/react-query';

import { reportesServicio } from '../services/reportesServicio';
import type { FiltrosMisReportes } from '../types/reportesTipos';
import { clavesConsultaReportes } from './clavesConsultaReportes';
import { usarConsultaReportesHabilitada } from './usarConsultaReportesHabilitada';

type OpcionesConsultaReportes = {
  habilitado?: boolean;
};

export function usarMisReportes(
  filtros?: FiltrosMisReportes,
  opciones?: OpcionesConsultaReportes
) {
  const { consultaHabilitada } = usarConsultaReportesHabilitada();

  return useQuery({
    queryKey: clavesConsultaReportes.misReportes(filtros),
    queryFn: () => reportesServicio.obtenerMisReportes(filtros),
    enabled: consultaHabilitada && (opciones?.habilitado ?? true)
  });
}