type PropiedadesCargando = {
  texto?: string;
  compacto?: boolean;
};

export function Cargando({ texto = 'Cargando información...', compacto = false }: PropiedadesCargando) {
  return (
    <div className={compacto ? 'cargando cargando--compacto' : 'cargando'} role="status">
      <span className="cargando__indicador" aria-hidden="true" />
      <span className="cargando__texto">{texto}</span>
    </div>
  );
}