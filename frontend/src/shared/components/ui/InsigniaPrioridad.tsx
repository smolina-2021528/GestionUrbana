import { prioridadesReporte } from '../../../design/identity/estadosVisuales';
import type { PrioridadReporte } from '../../../design/identity/estadosVisuales';

type PropiedadesInsigniaPrioridad = {
  prioridad: PrioridadReporte;
  mostrarPunto?: boolean;
};

export function InsigniaPrioridad({
  prioridad,
  mostrarPunto = true
}: PropiedadesInsigniaPrioridad) {
  const configuracionPrioridad = prioridadesReporte[prioridad];

  return (
    <span className={`insignia insignia--prioridad ${configuracionPrioridad.clase}`}>
      {mostrarPunto ? <span className="insignia__punto" aria-hidden="true" /> : null}
      {configuracionPrioridad.etiqueta}
    </span>
  );
}