import { Cargando } from '../../../shared/components/feedback/Cargando';
import { Tarjeta } from '../../../shared/components/ui/Tarjeta';
import { usarAutenticacion } from '../../authentication/hooks/usarAutenticacion';
import { FormularioCambioPassword } from '../components/FormularioCambioPassword';
import { FormularioPerfil } from '../components/FormularioPerfil';

function obtenerNombreCompleto(name?: string, surname?: string) {
  const nombreCompleto = `${name ?? ''} ${surname ?? ''}`.trim();
  return nombreCompleto.length > 0 ? nombreCompleto : 'Usuario de Ciudad Activa';
}

function obtenerTextoRoles(roles: readonly string[]) {
  if (roles.includes('ADMIN_ROLE')) {
    return 'Administrador';
  }

  if (roles.includes('USER_ROLE')) {
    return 'Ciudadano';
  }

  return 'Usuario';
}

export function PerfilPagina() {
  const { usuario, roles, cargandoSesion } = usarAutenticacion();

  if (cargandoSesion) {
    return <Cargando texto="Cargando perfil..." />;
  }

  if (!usuario) {
    return (
      <Tarjeta
        titulo="Perfil no disponible"
        descripcion="No fue posible cargar la información de la cuenta."
      >
        <p>Vuelve a iniciar sesión para consultar tu perfil.</p>
      </Tarjeta>
    );
  }

  return (
    <section className="gridPerfilTemporal">
      <Tarjeta
        titulo="Información de cuenta"
        descripcion="Datos principales de tu usuario en Ciudad Activa."
      >
        <div className="bloquesCrearReporteTemporal">
          <div className="bloquePlaceholderTemporal">
            <strong>{obtenerNombreCompleto(usuario.name, usuario.surname)}</strong>
            <p>{usuario.email}</p>
          </div>

          <div className="bloquePlaceholderTemporal">
            <strong>Usuario</strong>
            <p>{usuario.username}</p>
          </div>

          <div className="bloquePlaceholderTemporal">
            <strong>Rol</strong>
            <p>{obtenerTextoRoles(roles)}</p>
          </div>

          <div className="bloquePlaceholderTemporal">
            <strong>Estado de correo</strong>
            <p>{usuario.isEmailVerified ? 'Correo verificado' : 'Pendiente de verificación'}</p>
          </div>

          <div className="bloquePlaceholderTemporal">
            <strong>Estado de cuenta</strong>
            <p>{usuario.status === false ? 'Cuenta inactiva' : 'Cuenta activa'}</p>
          </div>
        </div>
      </Tarjeta>

      <Tarjeta
        titulo="Actualizar perfil"
        descripcion="Modifica tu información personal y datos de contacto."
      >
        <FormularioPerfil />
      </Tarjeta>

      <Tarjeta titulo="Seguridad" descripcion="Actualiza tu contraseña de acceso.">
        <FormularioCambioPassword />
      </Tarjeta>
    </section>
  );
}