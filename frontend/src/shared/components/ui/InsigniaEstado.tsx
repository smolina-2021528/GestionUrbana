import { estadosReporte } from '../../../design/identity/estadosVisuales';
import type { EstadoReporte } from '../../../design/identity/estadosVisuales';

type PropiedadesInsigniaEstado = {
  estado: EstadoReporte;
  mostrarPunto?: boolean;
};

export function InsigniaEstado({ estado, mostrarPunto = true }: PropiedadesInsigniaEstado) {
  const configuracionEstado = estadosReporte[estado];

  return (
    <span className={`insignia insignia--estado ${configuracionEstado.clase}`}>
      {mostrarPunto ? <span className="insignia__punto" aria-hidden="true" /> : null}
      {configuracionEstado.etiqueta}
    </span>
  );
}