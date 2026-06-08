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
        <Tarjeta titulo="Datos personales" descripcion="Formulario visual preparado para Sprint 2.">
          <form className="formularioTemporal">
            <label className="campoTemporal">
              <span>Nombre completo</span>
              <input placeholder="Usuario autenticado" type="text" />
            </label>

            <label className="campoTemporal">
              <span>Correo electrónico</span>
              <input placeholder="correo@ejemplo.com" type="email" />
            </label>

            <Boton type="button">Guardar cambios</Boton>
          </form>
        </Tarjeta>

        <Tarjeta titulo="Seguridad" descripcion="Cambio de contraseña pendiente de conexión.">
          <EstadoVacio
            titulo="Seguridad de cuenta"
            descripcion="Aquí se integrará el formulario para cambiar contraseña y revisar estado de la sesión."
            accion={<Boton variante="secundario">Cambiar contraseña</Boton>}
          />
        </Tarjeta>
      </section>
    </main>
  );
}