import { useQuery } from '@tanstack/react-query';

import { usuariosServicio } from '../services/usuariosServicio';
import type {
  FiltrosUsuarios
} from '../types/usuariosTipos';
import { clavesConsultaUsuarios } from './clavesConsultaUsuarios';
import { usarConsultaUsuariosHabilitada } from './usarConsultaUsuariosHabilitada';

type OpcionesConsultaUsuarios = {
  habilitado?: boolean;
};

function normalizarEnteroPositivo(
  valor: number | undefined
) {
  if (
    typeof valor !== 'number' ||
    !Number.isInteger(valor) ||
    valor <= 0
  ) {
    return undefined;
  }

  return valor;
}

function normalizarFiltrosUsuarios(
  filtros?: FiltrosUsuarios
): FiltrosUsuarios {
  const filtrosNormalizados: FiltrosUsuarios = {};

  const page = normalizarEnteroPositivo(filtros?.page);
  const limit = normalizarEnteroPositivo(filtros?.limit);
  const search = filtros?.search?.trim();

  if (page !== undefined) {
    filtrosNormalizados.page = page;
  }

  if (limit !== undefined) {
    filtrosNormalizados.limit = limit;
  }

  if (search) {
    filtrosNormalizados.search = search;
  }

  return filtrosNormalizados;
}

export function usarUsuarios(
  filtros?: FiltrosUsuarios,
  opciones?: OpcionesConsultaUsuarios
) {
  const {
    consultaAdministrativaHabilitada
  } = usarConsultaUsuariosHabilitada();

  const filtrosNormalizados =
    normalizarFiltrosUsuarios(filtros);

  return useQuery({
    queryKey: clavesConsultaUsuarios.listado(
      filtrosNormalizados
    ),
    queryFn: () =>
      usuariosServicio.obtenerUsuarios(
        filtrosNormalizados
      ),
    enabled:
      consultaAdministrativaHabilitada &&
      (opciones?.habilitado ?? true)
  });
}