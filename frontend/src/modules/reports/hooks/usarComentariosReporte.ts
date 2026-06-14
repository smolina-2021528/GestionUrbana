import { useQuery } from '@tanstack/react-query';

import { comentariosReporteServicio } from '../services/comentariosReporteServicio';
import type { FiltrosComentariosReporte } from '../types/interaccionesReporteTipos';
import { clavesConsultaReportes } from './clavesConsultaReportes';
import { usarConsultaReportesHabilitada } from './usarConsultaReportesHabilitada';

type OpcionesConsultaComentarios = {
  habilitado?: boolean;
};

export function usarComentariosReporte(
  reporteId: string | undefined,
  filtros?: FiltrosComentariosReporte,
  opciones?: OpcionesConsultaComentarios
) {
  const { consultaHabilitada } = usarConsultaReportesHabilitada();
  const tieneReporteId = Boolean(reporteId?.trim());

  return useQuery({
    queryKey: clavesConsultaReportes.comentarios(reporteId ?? '', filtros),
    queryFn: () => comentariosReporteServicio.obtenerComentariosReporte(reporteId ?? '', filtros),
    enabled: consultaHabilitada && tieneReporteId && (opciones?.habilitado ?? true)
  });
}