import { useQuery } from '@tanstack/react-query';

import { seguimientoReporteServicio } from '../services/seguimientoReporteServicio';
import type { FiltrosReportesSeguidos } from '../types/interaccionesReporteTipos';
import { clavesConsultaReportes } from './clavesConsultaReportes';
import { usarConsultaReportesHabilitada } from './usarConsultaReportesHabilitada';

type OpcionesConsultaReportesSeguidos = {
  habilitado?: boolean;
};

export function usarReportesSeguidos(
  filtros?: FiltrosReportesSeguidos,
  opciones?: OpcionesConsultaReportesSeguidos
) {
  const { consultaHabilitada } = usarConsultaReportesHabilitada();

  return useQuery({
    queryKey: clavesConsultaReportes.reportesSeguidos(filtros),
    queryFn: () => seguimientoReporteServicio.obtenerReportesSeguidos(filtros),
    enabled: consultaHabilitada && (opciones?.habilitado ?? true)
  });
}