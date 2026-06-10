import { LayoutAutenticacion } from '../../../app/layouts/LayoutAutenticacion';
import { textosSistema } from '../../../design/identity/textosSistema';
import { FormularioLogin } from '../components/FormularioLogin';

export function LoginPagina() {
  return (
    <LayoutAutenticacion
      titulo={textosSistema.autenticacion.tituloLogin}
      descripcion={textosSistema.autenticacion.descripcionLogin}
    >
      <FormularioLogin />
    </LayoutAutenticacion>
  );
}