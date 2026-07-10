import { textosSistema } from '../../../design/identity/textosSistema';
import { EstadoVacio } from '../../../shared/components/data/EstadoVacio';
import { Alerta } from '../../../shared/components/feedback/Alerta';
import { Cargando } from '../../../shared/components/feedback/Cargando';
import { Boton } from '../../../shared/components/ui/Boton';
import { Tarjeta } from '../../../shared/components/ui/Tarjeta';
import { esErrorApi } from '../../../shared/types/errorApi';
import { usarAutenticacion } from '../../authentication/hooks/usarAutenticacion';
import { ListadoUsuarios } from '../components/ListadoUsuarios';
import { usarUsuarios } from '../hooks/usarUsuarios';
import type { FiltrosUsuarios } from '../types/usuariosTipos';
import './usuariosPagina.css';

const filtrosIniciales: FiltrosUsuarios = {
  page: 1,
  limit: 20
};

function obtenerMensajeError(error: unknown) {
  if (esErrorApi(error)) {
    return error.mensaje;
  }

  return 'No fue posible cargar los usuarios. Intenta nuevamente.';
}

function obtenerMensajeRespuestaFallida(
  mensaje?: string,
  error?: string
) {
  return (
    mensaje ??
    error ??
    'No fue posible cargar los usuarios. Intenta nuevamente.'
  );
}

export function UsuariosPagina() {
  const { usuario } = usarAutenticacion();
  const consultaUsuarios = usarUsuarios(filtrosIniciales);

  const respuestaUsuarios = consultaUsuarios.data;

  const usuarios =
    respuestaUsuarios?.success === true
      ? respuestaUsuarios.data
      : [];

  const paginacion =
    respuestaUsuarios?.success === true
      ? respuestaUsuarios.pagination
      : undefined;

  const mensajeRespuestaFallida =
    respuestaUsuarios?.success === false
      ? obtenerMensajeRespuestaFallida(
          respuestaUsuarios.message,
          respuestaUsuarios.error
        )
      : undefined;

  const mensajeError =
    consultaUsuarios.error !== null
      ? obtenerMensajeError(consultaUsuarios.error)
      : mensajeRespuestaFallida;

  const actualizarUsuarios = () => {
    void consultaUsuarios.refetch();
  };

  if (consultaUsuarios.isLoading) {
    return (
      <main
        className="paginaTemporal usuariosPagina"
        aria-busy="true"
      >
        <section className="encabezadoPaginaTemporal">
          <div>
            <span className="etiquetaInicial">
              Administración
            </span>

            <h1>{textosSistema.navegacion.usuarios}</h1>

            <p>
              Gestiona usuarios, roles y estado de las cuentas
              registradas.
            </p>
          </div>
        </section>

        <Tarjeta className="usuariosPagina__estado">
          <Cargando texto="Cargando usuarios registrados..." />
        </Tarjeta>
      </main>
    );
  }

  if (mensajeError && usuarios.length === 0) {
    return (
      <main className="paginaTemporal usuariosPagina">
        <section className="encabezadoPaginaTemporal">
          <div>
            <span className="etiquetaInicial">
              Administración
            </span>

            <h1>{textosSistema.navegacion.usuarios}</h1>

            <p>
              Gestiona usuarios, roles y estado de las cuentas
              registradas.
            </p>
          </div>
        </section>

        <Alerta
          variante="error"
          titulo="No se pudo cargar el directorio"
        >
          <div className="usuariosPagina__alerta">
            <p>{mensajeError}</p>

            <Boton
              variante="secundario"
              onClick={actualizarUsuarios}
            >
              Reintentar
            </Boton>
          </div>
        </Alerta>
      </main>
    );
  }

  return (
    <main
      className="paginaTemporal usuariosPagina"
      aria-busy={consultaUsuarios.isFetching}
    >
      <section className="encabezadoPaginaTemporal">
        <div>
          <span className="etiquetaInicial">
            Administración
          </span>

          <h1>{textosSistema.navegacion.usuarios}</h1>

          <p>
            Consulta las cuentas registradas y revisa su rol,
            estado y verificación.
          </p>
        </div>

        <div className="usuariosPagina__accionesEncabezado">
          <Boton
            variante="secundario"
            disabled={consultaUsuarios.isFetching}
            onClick={actualizarUsuarios}
          >
            {consultaUsuarios.isFetching
              ? 'Actualizando...'
              : 'Actualizar usuarios'}
          </Boton>
        </div>
      </section>

      {mensajeError ? (
        <Alerta
          variante="advertencia"
          titulo="Los datos pueden no estar actualizados"
        >
          <p>{mensajeError}</p>
        </Alerta>
      ) : null}

      <Tarjeta
        titulo="Directorio de usuarios"
        descripcion="Cuentas registradas y datos principales de acceso al sistema."
      >
        {usuarios.length > 0 ? (
          <ListadoUsuarios
            usuarios={usuarios}
            totalUsuarios={
              paginacion?.total ?? usuarios.length
            }
            usuarioActualId={usuario?.id}
          />
        ) : (
          <EstadoVacio
            titulo="Sin usuarios para mostrar"
            descripcion="No se encontraron cuentas registradas en el sistema."
            accion={
              <Boton
                variante="secundario"
                onClick={actualizarUsuarios}
              >
                Actualizar listado
              </Boton>
            }
          />
        )}
      </Tarjeta>
    </main>
  );
}