import { LayoutAutenticacion } from '../../../app/layouts/LayoutAutenticacion';
import { Tarjeta } from '../../../shared/components/ui/Tarjeta';
import { FormularioReenviarVerificacion } from '../components/FormularioReenviarVerificacion';
import { FormularioVerificarCorreo } from '../components/FormularioVerificarCorreo';

export function VerificarCorreoPagina() {
  return (
    <LayoutAutenticacion
      titulo="Verificar correo"
      descripcion="Confirma tu cuenta con el token recibido o solicita un nuevo enlace de verificación."
    >
      <div className="grupoFormulariosAutenticacion">
        <FormularioVerificarCorreo />

        <Tarjeta
          titulo="¿No recibiste el correo?"
          descripcion="Puedes solicitar nuevamente las instrucciones de verificación."
        >
          <FormularioReenviarVerificacion />
        </Tarjeta>
      </div>
    </LayoutAutenticacion>
  );
}