import { useQuery } from '@tanstack/react-query';

import { reportesServicio } from '../services/reportesServicio';
import type { FiltrosListadoReportes } from '../types/reportesTipos';
import { clavesConsultaReportes } from './clavesConsultaReportes';
import { usarConsultaReportesHabilitada } from './usarConsultaReportesHabilitada';

type OpcionesConsultaReportes = {
  habilitado?: boolean;
};

export function usarReportes(
  filtros?: FiltrosListadoReportes,
  opciones?: OpcionesConsultaReportes
) {
  const { consultaHabilitada } = usarConsultaReportesHabilitada();

  return useQuery({
    queryKey: clavesConsultaReportes.listado(filtros),
    queryFn: () => reportesServicio.obtenerReportes(filtros),
    enabled: consultaHabilitada && (opciones?.habilitado ?? true)
  });
}