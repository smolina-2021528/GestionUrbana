import { LayoutAutenticacion } from '../../../app/layouts/LayoutAutenticacion';
import { FormularioRecuperarPassword } from '../components/FormularioRecuperarPassword';

export function RecuperarPasswordPagina() {
  return (
    <LayoutAutenticacion
      titulo="Recuperar contraseña"
      descripcion="Ingresa tu correo electrónico para recibir las instrucciones de recuperación."
    >
      <FormularioRecuperarPassword />
    </LayoutAutenticacion>
  );
}