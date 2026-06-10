import { LayoutAutenticacion } from '../../../app/layouts/LayoutAutenticacion';
import { textosSistema } from '../../../design/identity/textosSistema';
import { FormularioRegistro } from '../components/FormularioRegistro';

export function RegistroPagina() {
  return (
    <LayoutAutenticacion
      titulo={textosSistema.autenticacion.tituloRegistro}
      descripcion={textosSistema.autenticacion.descripcionRegistro}
    >
      <FormularioRegistro />
    </LayoutAutenticacion>
  );
}