import './estadoActualizacionReporte.css';

type PropiedadesEstadoActualizacionReporte = {
  visible: boolean;
  texto?: string;
};

export function EstadoActualizacionReporte({
  visible,
  texto = 'Actualizando información del reporte...'
}: PropiedadesEstadoActualizacionReporte) {
  if (!visible) {
    return null;
  }

  return (
    <div
      className="estadoActualizacionReporte"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <span
        className="estadoActualizacionReporte__indicador"
        aria-hidden="true"
      />

      <span>{texto}</span>
    </div>
  );
}