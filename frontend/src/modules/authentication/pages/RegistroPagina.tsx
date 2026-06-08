import { Link } from 'react-router-dom';

import { LayoutAutenticacion } from '../../../app/layouts/LayoutAutenticacion';
import { textosSistema } from '../../../design/identity/textosSistema';
import { Boton } from '../../../shared/components/ui/Boton';

export function RegistroPagina() {
  return (
    <LayoutAutenticacion
      titulo={textosSistema.autenticacion.tituloRegistro}
      descripcion={textosSistema.autenticacion.descripcionRegistro}
    >
      <form
        className="formularioAutenticacion formularioAutenticacion--dosColumnas"
        onSubmit={(eventoFormulario) => eventoFormulario.preventDefault()}
      >
        <label className="formularioAutenticacion__campo">
          <span>Nombre</span>
          <input autoComplete="given-name" name="name" placeholder="Nombre" required type="text" />
        </label>

        <label className="formularioAutenticacion__campo">
          <span>Apellido</span>
          <input
            autoComplete="family-name"
            name="surname"
            placeholder="Apellido"
            required
            type="text"
          />
        </label>

        <label className="formularioAutenticacion__campo">
          <span>Usuario</span>
          <input autoComplete="username" name="username" placeholder="usuario" required type="text" />
        </label>

        <label className="formularioAutenticacion__campo">
          <span>Correo electrónico</span>
          <input
            autoComplete="email"
            name="email"
            placeholder="correo@ejemplo.com"
            required
            type="email"
          />
        </label>

        <label className="formularioAutenticacion__campo">
          <span>Teléfono</span>
          <input autoComplete="tel" name="phone" placeholder="55550000" required type="tel" />
        </label>

        <label className="formularioAutenticacion__campo">
          <span>Contraseña</span>
          <input
            autoComplete="new-password"
            name="password"
            placeholder="Contraseña segura"
            required
            type="password"
          />
        </label>

        <label className="formularioAutenticacion__campo formularioAutenticacion__campoCompleto">
          <span>Confirmar contraseña</span>
          <input
            autoComplete="new-password"
            name="confirmarPassword"
            placeholder="Confirma tu contraseña"
            required
            type="password"
          />
        </label>

        <div className="formularioAutenticacion__acciones">
          <Boton anchoCompleto type="submit">
            Crear cuenta
          </Boton>

          <div className="formularioAutenticacion__enlaces">
            <Link to="/login">Ya tengo cuenta</Link>
          </div>
        </div>
      </form>
    </LayoutAutenticacion>
  );
}