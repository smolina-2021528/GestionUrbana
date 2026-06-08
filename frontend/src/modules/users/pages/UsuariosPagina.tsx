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
          <p>Gestión visual reservada para administradores del sistema.</p>
        </div>
      </section>

      <Tarjeta
        titulo="Gestión de usuarios"
        descripcion="Tabla futura para listar usuarios, roles y estado de la cuenta."
        acciones={<Boton variante="secundario">Filtrar por rol</Boton>}
      >
        <EstadoVacio
          titulo="Módulo administrativo pendiente"
          descripcion="En el sprint de gestión administrativa se conectará la lista de usuarios, cambio de roles y activación o desactivación."
        />
      </Tarjeta>
    </main>
  );
}