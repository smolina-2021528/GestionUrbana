import { useQuery } from '@tanstack/react-query';

import { usarAutenticacion } from '../../authentication/hooks/usarAutenticacion';
import { notificacionesServicio } from '../services/notificacionesServicio';
import type { FiltrosNotificaciones } from '../types/notificacionesTipos';
import { clavesConsultaNotificaciones } from './clavesConsultaNotificaciones';

type OpcionesConsultaNotificaciones = {
  habilitado?: boolean;
};

export function usarNotificaciones(
  filtros?: FiltrosNotificaciones,
  opciones?: OpcionesConsultaNotificaciones
) {
  const { estaAutenticado, cargandoSesion } = usarAutenticacion();

  return useQuery({
    queryKey: clavesConsultaNotificaciones.listado(filtros),
    queryFn: () => notificacionesServicio.obtenerNotificaciones(filtros),
    enabled: estaAutenticado && !cargandoSesion && (opciones?.habilitado ?? true)
  });
}