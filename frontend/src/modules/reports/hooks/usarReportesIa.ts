import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';

import { reportesIaServicio } from '../services/reportesIaServicio';
import type {
  AnalizarReporteConIaPayload,
  CrearReporteConIaPayload,
  FiltrosReportesSimilares,
  VerificarDuplicadosReportePayload
} from '../types/reportesIaTipos';
import { clavesConsultaReportes } from './clavesConsultaReportes';
import { usarConsultaReportesHabilitada } from './usarConsultaReportesHabilitada';

type OpcionesConsultaReportesIa = {
  habilitado?: boolean;
};

type VerificarDuplicadosReporteParametros = {
  datos: VerificarDuplicadosReportePayload;
  filtros?: {
    limit?: number;
    threshold?: number;
  };
};

function tieneReporteIdValido(reporteId: string | undefined) {
  return Boolean(reporteId?.trim());
}

function invalidarConsultasDespuesDeCrear(queryClient: QueryClient) {
  void queryClient.invalidateQueries({
    queryKey: clavesConsultaReportes.listas()
  });

  void queryClient.invalidateQueries({
    queryKey: clavesConsultaReportes.todos
  });
}

function invalidarConsultasDespuesDeReprocesar(queryClient: QueryClient, reporteId: string) {
  void queryClient.invalidateQueries({
    queryKey: clavesConsultaReportes.detalle(reporteId)
  });

  void queryClient.invalidateQueries({
    queryKey: clavesConsultaReportes.listas()
  });

  void queryClient.invalidateQueries({
    queryKey: clavesConsultaReportes.todos
  });

  void queryClient.invalidateQueries({
    queryKey: clavesConsultaReportes.similaresReporte(reporteId)
  });
}

export function usarAnalizarReporteConIa() {
  return useMutation({
    mutationFn: (datos: AnalizarReporteConIaPayload) =>
      reportesIaServicio.analizarReporteConIa(datos)
  });
}

export function usarCrearReporteConIa() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (datos: CrearReporteConIaPayload) => reportesIaServicio.crearReporteConIa(datos),
    onSuccess: () => {
      invalidarConsultasDespuesDeCrear(queryClient);
    }
  });
}

export function usarVerificarDuplicadosReporte() {
  return useMutation({
    mutationFn: ({ datos, filtros }: VerificarDuplicadosReporteParametros) =>
      reportesIaServicio.verificarDuplicadosReporte(datos, filtros)
  });
}

export function usarReportesSimilares(
  reporteId: string | undefined,
  filtros?: FiltrosReportesSimilares,
  opciones?: OpcionesConsultaReportesIa
) {
  const { consultaHabilitada } = usarConsultaReportesHabilitada();
  const tieneReporteId = tieneReporteIdValido(reporteId);

  return useQuery({
    queryKey: clavesConsultaReportes.reportesSimilares(reporteId ?? '', filtros),
    queryFn: () => reportesIaServicio.obtenerReportesSimilares(reporteId ?? '', filtros),
    enabled: consultaHabilitada && tieneReporteId && (opciones?.habilitado ?? true)
  });
}

export function usarReprocesarIaReporte() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reporteId: string) => reportesIaServicio.reprocesarIaReporte(reporteId),
    onSuccess: (_respuesta, reporteId) => {
      invalidarConsultasDespuesDeReprocesar(queryClient, reporteId);
    }
  });
}