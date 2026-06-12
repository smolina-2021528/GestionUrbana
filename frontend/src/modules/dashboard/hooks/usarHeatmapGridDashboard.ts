import { useQuery } from '@tanstack/react-query';

import { estadisticasServicio } from '../services/estadisticasServicio';
import type { FiltrosHeatmapGridEstadisticas } from '../types/estadisticasTipos';
import { clavesConsultaDashboard } from './clavesConsultaDashboard';
import { usarConsultaDashboardAdminHabilitada } from './usarConsultaDashboardAdminHabilitada';

type OpcionesConsultaDashboard = {
  habilitado?: boolean;
};

export function usarHeatmapGridDashboard(
  filtros?: FiltrosHeatmapGridEstadisticas,
  opciones?: OpcionesConsultaDashboard
) {
  const { consultaHabilitada } = usarConsultaDashboardAdminHabilitada();

  return useQuery({
    queryKey: clavesConsultaDashboard.heatmapGrid(filtros),
    queryFn: () => estadisticasServicio.obtenerHeatmapGrid(filtros),
    enabled: consultaHabilitada && (opciones?.habilitado ?? true)
  });
}