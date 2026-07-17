import { useQuery } from '@tanstack/react-query';

import { reportesService } from '../services/reportes.service';

export const clavesReportesMobile = {
  todos: ['reportes-mobile'] as const,
  misReportes: ['reportes-mobile', 'mis-reportes'] as const,
  detalle: (reporteId: string) => ['reportes-mobile', 'detalle', reporteId] as const
};

export function useMisReportes() {
  return useQuery({
    queryKey: clavesReportesMobile.misReportes,
    queryFn: () => reportesService.obtenerMisReportes()
  });
}

export function useReporteDetalle(reporteId: string) {
  return useQuery({
    queryKey: clavesReportesMobile.detalle(reporteId),
    queryFn: () => reportesService.obtenerReporteDetalle(reporteId),
    enabled: reporteId.trim().length > 0
  });
}