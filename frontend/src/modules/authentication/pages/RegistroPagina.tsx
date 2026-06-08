import { Link } from 'react-router-dom';

import { textosSistema } from '../../../design/identity/textosSistema';
import { Boton } from '../../../shared/components/ui/Boton';
import { Tarjeta } from '../../../shared/components/ui/Tarjeta';

export function RegistroPagina() {
  return (
    <main className="paginaTemporal paginaTemporal--autenticacion">
      <section className="bloqueHeroTemporal">
        <span className="etiquetaInicial">{textosSistema.general.sistema}</span>
        <h1>{textosSistema.autenticacion.tituloRegistro}</h1>
        <p>{textosSistema.autenticacion.descripcionRegistro}</p>
      </section>

      <Tarjeta
        titulo="Datos de registro"
        descripcion="Estructura visual inicial para crear una cuenta ciudadana."
      >
        <form className="formularioTemporal formularioTemporal--dosColumnas">
          <label className="campoTemporal">
            <span>Nombre</span>
            <input placeholder="Nombre" type="text" />
          </label>

          <label className="campoTemporal">
            <span>Apellido</span>
            <input placeholder="Apellido" type="text" />
          </label>

          <label className="campoTemporal">
            <span>Usuario</span>
            <input placeholder="usuario" type="text" />
          </label>

          <label className="campoTemporal">
            <span>Correo electrónico</span>
            <input placeholder="correo@ejemplo.com" type="email" />
          </label>

          <label className="campoTemporal">
            <span>Teléfono</span>
            <input placeholder="55550000" type="tel" />
          </label>

          <label className="campoTemporal">
            <span>Contraseña</span>
            <input placeholder="Contraseña segura" type="password" />
          </label>

          <div className="formularioTemporal__acciones">
            <Boton type="button">Crear cuenta</Boton>
            <Link to="/login">Ya tengo cuenta</Link>
          </div>
        </form>
      </Tarjeta>
    </main>
  );
}