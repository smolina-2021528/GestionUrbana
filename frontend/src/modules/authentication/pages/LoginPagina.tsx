import { Link } from 'react-router-dom';

import { LayoutAutenticacion } from '../../../app/layouts/LayoutAutenticacion';
import { textosSistema } from '../../../design/identity/textosSistema';
import { Boton } from '../../../shared/components/ui/Boton';

export function LoginPagina() {
  return (
    <LayoutAutenticacion
      titulo={textosSistema.autenticacion.tituloLogin}
      descripcion={textosSistema.autenticacion.descripcionLogin}
    >
      <form
        className="formularioAutenticacion"
        onSubmit={(eventoFormulario) => eventoFormulario.preventDefault()}
      >
        <label className="formularioAutenticacion__campo">
          <span>Correo o usuario</span>
          <input
            autoComplete="username"
            name="identificador"
            placeholder="admin@gestionurbana.com"
            required
            type="text"
          />
        </label>

        <label className="formularioAutenticacion__campo">
          <span>Contraseña</span>
          <input
            autoComplete="current-password"
            name="password"
            placeholder="Ingresa tu contraseña"
            required
            type="password"
          />
        </label>

        <div className="formularioAutenticacion__acciones">
          <Boton anchoCompleto type="submit">
            Ingresar
          </Boton>

          <div className="formularioAutenticacion__enlaces">
            <Link to="/registro">Crear cuenta</Link>
            <Link to="/login">Recuperar contraseña</Link>
          </div>
        </div>
      </form>
    </LayoutAutenticacion>
  );
}