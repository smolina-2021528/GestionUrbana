import { LayoutAutenticacion } from '../../../app/layouts/LayoutAutenticacion';
import { FormularioRestablecerPassword } from '../components/FormularioRestablecerPassword';

export function RestablecerPasswordPagina() {
  return (
    <LayoutAutenticacion
      titulo="Restablecer contraseña"
      descripcion="Ingresa el token de recuperación y define una nueva contraseña para tu cuenta."
    >
      <FormularioRestablecerPassword />
    </LayoutAutenticacion>
  );
}