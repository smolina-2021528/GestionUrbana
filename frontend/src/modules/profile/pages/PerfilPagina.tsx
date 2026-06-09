import { textosSistema } from '../../../design/identity/textosSistema';
import { EstadoVacio } from '../../../shared/components/data/EstadoVacio';
import { Boton } from '../../../shared/components/ui/Boton';
import { Tarjeta } from '../../../shared/components/ui/Tarjeta';

export function PerfilPagina() {
  return (
    <main className="paginaTemporal">
      <section className="encabezadoPaginaTemporal">
        <div>
          <span className="etiquetaInicial">Cuenta</span>
          <h1>{textosSistema.navegacion.perfil}</h1>
          <p>Consulta y actualiza la información de tu cuenta.</p>
        </div>
      </section>

      <section className="gridPerfilTemporal">
        <Tarjeta titulo="Datos personales" descripcion="Información principal del usuario.">
          <form className="formularioTemporal">
            <label className="campoTemporal">
              <span>Nombre completo</span>
              <input placeholder="Nombre del usuario" type="text" />
            </label>

            <label className="campoTemporal">
              <span>Correo electrónico</span>
              <input placeholder="correo@ejemplo.com" type="email" />
            </label>

            <Boton type="button">Guardar cambios</Boton>
          </form>
        </Tarjeta>

        <Tarjeta titulo="Seguridad" descripcion="Opciones de protección de la cuenta.">
          <EstadoVacio
            titulo="Seguridad de cuenta"
            descripcion="Administra la contraseña y revisa la configuración de acceso."
            accion={<Boton variante="secundario">Cambiar contraseña</Boton>}
          />
        </Tarjeta>
      </section>
    </main>
  );
}