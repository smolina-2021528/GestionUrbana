import { marcaCiudadActiva } from '../design/identity/marca';
import { textosSistema } from '../design/identity/textosSistema';
import { EstadoVacio } from '../shared/components/data/EstadoVacio';
import { Alerta } from '../shared/components/feedback/Alerta';
import { Boton } from '../shared/components/ui/Boton';
import { InsigniaEstado } from '../shared/components/ui/InsigniaEstado';
import { InsigniaPrioridad } from '../shared/components/ui/InsigniaPrioridad';
import { Tarjeta } from '../shared/components/ui/Tarjeta';

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

        <Alerta variante="informacion" titulo={textosSistema.general.estadoBase}>
          {textosSistema.general.preparadoPara}
        </Alerta>

        <div className="muestraComponentes">
          <Tarjeta
            titulo="Componentes base"
            descripcion="Elementos reutilizables listos para construir las pantallas del sistema."
            acciones={<Boton variante="fantasma">Ver estructura</Boton>}
          >
            <div className="muestraComponentes__fila">
              <InsigniaEstado estado="PENDIENTE" />
              <InsigniaEstado estado="EN_PROCESO" />
              <InsigniaEstado estado="RESUELTO" />
              <InsigniaPrioridad prioridad="BAJA" />
              <InsigniaPrioridad prioridad="MEDIA" />
              <InsigniaPrioridad prioridad="ALTA" />
            </div>

            <EstadoVacio
              titulo="Base visual preparada"
              descripcion="Las siguientes pantallas usarán estos componentes para mantener consistencia visual y evitar duplicación."
              accion={<Boton variante="primario">Continuar sprint</Boton>}
            />
          </Tarjeta>
        </div>
      </section>
    </main>
  );
}