import './estadoActualizacionUsuarios.css';

type PropiedadesEstadoActualizacionUsuarios = {
  visible: boolean;
};

export function EstadoActualizacionUsuarios({
  visible
}: PropiedadesEstadoActualizacionUsuarios) {
  if (!visible) {
    return null;
  }

  return (
    <div
      className="estadoActualizacionUsuarios"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <span
        className="estadoActualizacionUsuarios__indicador"
        aria-hidden="true"
      />

      <span>Actualizando directorio de usuarios...</span>
    </div>
  );
}