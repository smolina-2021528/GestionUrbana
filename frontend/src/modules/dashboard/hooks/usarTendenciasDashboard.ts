import { useQuery } from '@tanstack/react-query';

import { estadisticasServicio } from '../services/estadisticasServicio';
import type { FiltrosTendenciasEstadisticas } from '../types/estadisticasTipos';
import { clavesConsultaDashboard } from './clavesConsultaDashboard';
import { usarConsultaDashboardAdminHabilitada } from './usarConsultaDashboardAdminHabilitada';

type OpcionesConsultaDashboard = {
  habilitado?: boolean;
};

export function usarTendenciasDashboard(
  filtros?: FiltrosTendenciasEstadisticas,
  opciones?: OpcionesConsultaDashboard
) {
  const { consultaHabilitada } = usarConsultaDashboardAdminHabilitada();

  return useQuery({
    queryKey: clavesConsultaDashboard.tendencias(filtros),
    queryFn: () => estadisticasServicio.obtenerTendenciasDashboard(filtros),
    enabled: consultaHabilitada && (opciones?.habilitado ?? true)
  });
}