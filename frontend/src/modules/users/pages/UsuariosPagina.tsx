import { textosSistema } from '../../../design/identity/textosSistema';
import { EstadoVacio } from '../../../shared/components/data/EstadoVacio';
import { Boton } from '../../../shared/components/ui/Boton';
import { Tarjeta } from '../../../shared/components/ui/Tarjeta';

export function UsuariosPagina() {
  return (
    <main className="paginaTemporal">
      <section className="encabezadoPaginaTemporal">
        <div>
          <span className="etiquetaInicial">Administración</span>
          <h1>{textosSistema.navegacion.usuarios}</h1>
          <p>Gestiona usuarios, roles y estado de las cuentas registradas.</p>
        </div>
      </section>

      <Tarjeta
        titulo="Gestión de usuarios"
        descripcion="Consulta usuarios registrados y administra su acceso al sistema."
        acciones={<Boton variante="secundario">Filtrar por rol</Boton>}
      >
        <EstadoVacio
          titulo="Sin usuarios para mostrar"
          descripcion="Cuando existan usuarios registrados, podrás consultarlos desde esta pantalla."
        />
      </Tarjeta>
    </main>
  );
}