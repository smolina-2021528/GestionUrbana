import { useQuery } from '@tanstack/react-query';

import { reportesService } from '../services/reportes.service';

export const clavesReportesMobile = {
  todos: ['reportes-mobile'] as const,
  misReportes: ['reportes-mobile', 'mis-reportes'] as const
};

export function useMisReportes() {
  return useQuery({
    queryKey: clavesReportesMobile.misReportes,
    queryFn: () => reportesService.obtenerMisReportes()
  });
}