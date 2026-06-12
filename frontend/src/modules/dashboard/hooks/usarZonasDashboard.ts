import { useQuery } from '@tanstack/react-query';

import { estadisticasServicio } from '../services/estadisticasServicio';
import type { FiltrosZonasEstadisticas } from '../types/estadisticasTipos';
import { clavesConsultaDashboard } from './clavesConsultaDashboard';
import { usarConsultaDashboardAdminHabilitada } from './usarConsultaDashboardAdminHabilitada';

type OpcionesConsultaDashboard = {
  habilitado?: boolean;
};

export function usarZonasDashboard(
  filtros?: FiltrosZonasEstadisticas,
  opciones?: OpcionesConsultaDashboard
) {
  const { consultaHabilitada } = usarConsultaDashboardAdminHabilitada();

  return useQuery({
    queryKey: clavesConsultaDashboard.zonas(filtros),
    queryFn: () => estadisticasServicio.obtenerZonasDashboard(filtros),
    enabled: consultaHabilitada && (opciones?.habilitado ?? true)
  });
}