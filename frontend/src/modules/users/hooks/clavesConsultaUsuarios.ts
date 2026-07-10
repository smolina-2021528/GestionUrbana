import type {
  FiltrosUsuarios
} from '../types/usuariosTipos';

const claveBaseUsuarios = ['usuarios'] as const;

export const clavesConsultaUsuarios = {
  todos: claveBaseUsuarios,

  listas: () =>
    [...claveBaseUsuarios, 'listas'] as const,

  listado: (filtros?: FiltrosUsuarios) =>
    [
      ...claveBaseUsuarios,
      'listado',
      filtros ?? {}
    ] as const,

  porRol: (nombreRol: string) =>
    [
      ...claveBaseUsuarios,
      'rol',
      nombreRol
    ] as const,

  detalles: () =>
    [...claveBaseUsuarios, 'detalle'] as const,

  detalle: (usuarioId: string) =>
    [
      ...claveBaseUsuarios,
      'detalle',
      usuarioId
    ] as const,

  roles: (usuarioId: string) =>
    [
      ...claveBaseUsuarios,
      'roles',
      usuarioId
    ] as const
} as const;