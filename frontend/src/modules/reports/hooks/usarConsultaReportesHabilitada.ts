import { usarAutenticacion } from '../../authentication/hooks/usarAutenticacion';

export function usarConsultaReportesHabilitada() {
  const { estaAutenticado, cargandoSesion, usuario } = usarAutenticacion();

  const consultaHabilitada = estaAutenticado && !cargandoSesion;

  return {
    consultaHabilitada,
    estaAutenticado,
    cargandoSesion,
    usuario
  };
}