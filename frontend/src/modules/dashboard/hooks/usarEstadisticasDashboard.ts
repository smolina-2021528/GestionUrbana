import { useQuery } from '@tanstack/react-query';

import { estadisticasServicio } from '../services/estadisticasServicio';
import type { FiltrosDashboardEstadisticas } from '../types/estadisticasTipos';
import { clavesConsultaDashboard } from './clavesConsultaDashboard';
import { usarConsultaDashboardAdminHabilitada } from './usarConsultaDashboardAdminHabilitada';

type OpcionesConsultaDashboard = {
  habilitado?: boolean;
};

export function usarEstadisticasDashboard(
  filtros?: FiltrosDashboardEstadisticas,
  opciones?: OpcionesConsultaDashboard
) {
  const { consultaHabilitada } = usarConsultaDashboardAdminHabilitada();

  return useQuery({
    queryKey: clavesConsultaDashboard.estadisticas(filtros),
    queryFn: () => estadisticasServicio.obtenerEstadisticasDashboard(filtros),
    enabled: consultaHabilitada && (opciones?.habilitado ?? true)
  });
}