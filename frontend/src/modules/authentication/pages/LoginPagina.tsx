import { Link } from 'react-router-dom';

import { textosSistema } from '../../../design/identity/textosSistema';
import { Boton } from '../../../shared/components/ui/Boton';
import { Tarjeta } from '../../../shared/components/ui/Tarjeta';

export function LoginPagina() {
  return (
    <main className="paginaTemporal paginaTemporal--autenticacion">
      <section className="bloqueHeroTemporal">
        <span className="etiquetaInicial">{textosSistema.general.sistema}</span>
        <h1>{textosSistema.autenticacion.tituloLogin}</h1>
        <p>{textosSistema.autenticacion.descripcionLogin}</p>
      </section>

      <Tarjeta
        titulo="Acceso al sistema"
        descripcion="Formulario visual preparado para conectarse al servicio de autenticación en el Sprint 2."
      >
        <form className="formularioTemporal">
          <label className="campoTemporal">
            <span>Correo o usuario</span>
            <input placeholder="admin@gestionurbana.com" type="text" />
          </label>

          <label className="campoTemporal">
            <span>Contraseña</span>
            <input placeholder="Ingresa tu contraseña" type="password" />
          </label>

          <Boton anchoCompleto type="button">
            Ingresar
          </Boton>

          <div className="accionesTextoTemporal">
            <Link to="/registro">Crear cuenta ciudadana</Link>
            <Link to="/login">Recuperar contraseña</Link>
          </div>
        </form>
      </Tarjeta>
    </main>
  );
}