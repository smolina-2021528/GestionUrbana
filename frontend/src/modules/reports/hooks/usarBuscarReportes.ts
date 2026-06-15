import { useQuery } from '@tanstack/react-query';

import { reportesServicio } from '../services/reportesServicio';
import type { FiltrosBusquedaReportes } from '../types/reportesTipos';
import { clavesConsultaReportes } from './clavesConsultaReportes';
import { usarConsultaReportesHabilitada } from './usarConsultaReportesHabilitada';

type OpcionesConsultaReportes = {
  habilitado?: boolean;
};

export function usarBuscarReportes(
  filtros: FiltrosBusquedaReportes,
  opciones?: OpcionesConsultaReportes
) {
  const { consultaHabilitada } = usarConsultaReportesHabilitada();
  const tieneBusquedaValida = filtros.q.trim().length >= 3;

  return useQuery({
    queryKey: clavesConsultaReportes.busqueda(filtros),
    queryFn: () => reportesServicio.buscarReportes(filtros),
    enabled: consultaHabilitada && tieneBusquedaValida && (opciones?.habilitado ?? true)
  });
}