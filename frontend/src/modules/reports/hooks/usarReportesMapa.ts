import { useQuery } from '@tanstack/react-query';

import { reportesServicio } from '../services/reportesServicio';
import type {
  FiltrosBoundingBoxReportes,
  FiltrosHeatmapReportes,
  FiltrosReportesCercanos
} from '../types/reportesTipos';
import { clavesConsultaReportes } from './clavesConsultaReportes';
import { usarConsultaReportesHabilitada } from './usarConsultaReportesHabilitada';

type OpcionesConsultaReportes = {
  habilitado?: boolean;
};

export function usarReportesCercanos(
  filtros: FiltrosReportesCercanos,
  opciones?: OpcionesConsultaReportes
) {
  const { consultaHabilitada } = usarConsultaReportesHabilitada();

  return useQuery({
    queryKey: clavesConsultaReportes.cercanos(filtros),
    queryFn: () => reportesServicio.obtenerReportesCercanos(filtros),
    enabled: consultaHabilitada && (opciones?.habilitado ?? true)
  });
}

export function usarHeatmapReportes(
  filtros?: FiltrosHeatmapReportes,
  opciones?: OpcionesConsultaReportes
) {
  const { consultaHabilitada } = usarConsultaReportesHabilitada();

  return useQuery({
    queryKey: clavesConsultaReportes.heatmap(filtros),
    queryFn: () => reportesServicio.obtenerHeatmapReportes(filtros),
    enabled: consultaHabilitada && (opciones?.habilitado ?? true)
  });
}

export function usarReportesBoundingBox(
  filtros: FiltrosBoundingBoxReportes,
  opciones?: OpcionesConsultaReportes
) {
  const { consultaHabilitada } = usarConsultaReportesHabilitada();

  return useQuery({
    queryKey: clavesConsultaReportes.bbox(filtros),
    queryFn: () => reportesServicio.obtenerReportesBoundingBox(filtros),
    enabled: consultaHabilitada && (opciones?.habilitado ?? true)
  });
}