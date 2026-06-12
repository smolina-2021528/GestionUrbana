import { useQuery } from '@tanstack/react-query';

import { estadisticasServicio } from '../services/estadisticasServicio';
import type { FiltrosRangoFechaEstadisticas } from '../types/estadisticasTipos';
import { clavesConsultaDashboard } from './clavesConsultaDashboard';
import { usarConsultaDashboardAdminHabilitada } from './usarConsultaDashboardAdminHabilitada';

type OpcionesConsultaDashboard = {
  habilitado?: boolean;
};

export function usarTransicionesDashboard(
  filtros?: FiltrosRangoFechaEstadisticas,
  opciones?: OpcionesConsultaDashboard
) {
  const { consultaHabilitada } = usarConsultaDashboardAdminHabilitada();

  return useQuery({
    queryKey: clavesConsultaDashboard.transiciones(filtros),
    queryFn: () => estadisticasServicio.obtenerTransicionesDashboard(filtros),
    enabled: consultaHabilitada && (opciones?.habilitado ?? true)
  });
}