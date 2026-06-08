import { marcaCiudadActiva } from '../design/identity/marca';
import { textosSistema } from '../design/identity/textosSistema';

export default function App() {
  return (
    <main className="contenedorInicial">
      <section className="tarjetaInicial">
        <div className="marcaInicial">
          <img
            className="logoInicial"
            src={marcaCiudadActiva.rutaLogo}
            alt={marcaCiudadActiva.textoAlternativoLogo}
          />
          <span className="etiquetaInicial">{textosSistema.general.sistema}</span>
        </div>

        <h1>{marcaCiudadActiva.nombre}</h1>

        <p className="descripcionInicial">{marcaCiudadActiva.conceptoCentral}</p>

        <p className="notaInicial">
          {textosSistema.general.estadoBase}. {textosSistema.general.preparadoPara}
        </p>
      </section>
    </main>
  );
}