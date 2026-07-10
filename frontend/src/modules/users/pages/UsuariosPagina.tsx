import {
  useMemo,
  useState
} from 'react';

import { textosSistema } from '../../../design/identity/textosSistema';
import { EstadoVacio } from '../../../shared/components/data/EstadoVacio';
import { Alerta } from '../../../shared/components/feedback/Alerta';
import { Cargando } from '../../../shared/components/feedback/Cargando';
import { Boton } from '../../../shared/components/ui/Boton';
import { Tarjeta } from '../../../shared/components/ui/Tarjeta';
import { esErrorApi } from '../../../shared/types/errorApi';
import { usarAutenticacion } from '../../authentication/hooks/usarAutenticacion';
import { EstadoActualizacionUsuarios } from '../components/EstadoActualizacionUsuarios';
import {
  FiltrosUsuarios,
  type FiltroEstadoUsuarios,
  type FiltroRolUsuarios
} from '../components/FiltrosUsuarios';
import { ListadoUsuarios } from '../components/ListadoUsuarios';
import { usarUsuarios } from '../hooks/usarUsuarios';
import type {
  FiltrosUsuarios as FiltrosConsultaUsuarios,
  UsuarioSistema
} from '../types/usuariosTipos';
import './usuariosPagina.css';

const filtrosIniciales: FiltrosConsultaUsuarios = {
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

function filtrarUsuariosLocalmente(
  usuarios: UsuarioSistema[],
  rol: FiltroRolUsuarios,
  estado: FiltroEstadoUsuarios
) {
  return usuarios.filter((usuario) => {
    if (
      rol !== 'TODOS' &&
      usuario.role !== rol
    ) {
      return false;
    }

    if (
      estado === 'ACTIVOS' &&
      !usuario.status
    ) {
      return false;
    }

    if (
      estado === 'INACTIVOS' &&
      usuario.status
    ) {
      return false;
    }

    return true;
  });
}

function obtenerPaginasVisibles(
  paginaActual: number,
  totalPaginas: number
) {
  if (totalPaginas <= 5) {
    return Array.from(
      { length: totalPaginas },
      (_, indice) => indice + 1
    );
  }

  const inicio = Math.max(
    Math.min(
      paginaActual - 2,
      totalPaginas - 4
    ),
    1
  );

  return Array.from(
    { length: 5 },
    (_, indice) => inicio + indice
  );
}

export function UsuariosPagina() {
  const { usuario } = usarAutenticacion();

  const [filtros, setFiltros] =
    useState<FiltrosConsultaUsuarios>(
      filtrosIniciales
    );

  const [filtroRol, setFiltroRol] =
    useState<FiltroRolUsuarios>('TODOS');

  const [filtroEstado, setFiltroEstado] =
    useState<FiltroEstadoUsuarios>('TODOS');

  const consultaUsuarios = usarUsuarios(filtros);

  const respuestaUsuarios = consultaUsuarios.data;

  const usuarios =
    respuestaUsuarios?.success === true
      ? respuestaUsuarios.data
      : [];

  const paginacion =
    respuestaUsuarios?.success === true
      ? respuestaUsuarios.pagination
      : undefined;

  const usuariosFiltrados = useMemo(
    () =>
      filtrarUsuariosLocalmente(
        usuarios,
        filtroRol,
        filtroEstado
      ),
    [usuarios, filtroRol, filtroEstado]
  );

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

  const paginaActual =
    paginacion?.page ?? filtros.page ?? 1;

  const totalPaginas =
    paginacion?.totalPages ?? 0;

  const paginasVisibles = obtenerPaginasVisibles(
    paginaActual,
    totalPaginas
  );

  const actualizandoUsuarios =
    consultaUsuarios.isFetching &&
    !consultaUsuarios.isLoading;

  const actualizarUsuarios = () => {
    void consultaUsuarios.refetch();
  };

  const cambiarPagina = (pagina: number) => {
    if (
      pagina < 1 ||
      pagina > totalPaginas ||
      pagina === paginaActual
    ) {
      return;
    }

    setFiltros((filtrosActuales) => ({
      ...filtrosActuales,
      page: pagina
    }));
  };

  const aplicarBusqueda = (busqueda: string) => {
    setFiltros((filtrosActuales) => {
      const filtrosActualizados:
        FiltrosConsultaUsuarios = {
          ...filtrosActuales,
          page: 1
        };

      if (busqueda) {
        return {
          ...filtrosActualizados,
          search: busqueda
        };
      }

      delete filtrosActualizados.search;

      return filtrosActualizados;
    });
  };

  const cambiarLimite = (limite: number) => {
    setFiltros((filtrosActuales) => ({
      ...filtrosActuales,
      page: 1,
      limit: limite
    }));
  };

  const limpiarFiltros = () => {
    setFiltros(filtrosIniciales);
    setFiltroRol('TODOS');
    setFiltroEstado('TODOS');
  };

  if (
    consultaUsuarios.isLoading &&
    !respuestaUsuarios
  ) {
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
              Gestiona usuarios, roles y estado de las
              cuentas registradas.
            </p>
          </div>
        </section>

        <Tarjeta className="usuariosPagina__estado">
          <Cargando texto="Cargando usuarios registrados..." />
        </Tarjeta>
      </main>
    );
  }

  if (
    mensajeError &&
    usuarios.length === 0
  ) {
    return (
      <main className="paginaTemporal usuariosPagina">
        <section className="encabezadoPaginaTemporal">
          <div>
            <span className="etiquetaInicial">
              Administración
            </span>

            <h1>{textosSistema.navegacion.usuarios}</h1>

            <p>
              Gestiona usuarios, roles y estado de las
              cuentas registradas.
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
      aria-busy={actualizandoUsuarios}
    >
      <section className="encabezadoPaginaTemporal">
        <div>
          <span className="etiquetaInicial">
            Administración
          </span>

          <h1>{textosSistema.navegacion.usuarios}</h1>

          <p>
            Busca cuentas registradas y administra sus
            roles, permisos y acceso a la plataforma.
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

      <EstadoActualizacionUsuarios
        visible={actualizandoUsuarios}
      />

      <Tarjeta
        titulo="Modelo de acceso"
        descripcion="Referencia rápida para administrar roles y cuentas de forma segura."
      >
        <div className="usuariosPagina__modeloAcceso">
          <article>
            <span>ADMIN_ROLE</span>
            <strong>Administrador</strong>
            <p>
              Gestiona reportes, usuarios, responsables,
              estados y herramientas administrativas.
            </p>
          </article>

          <article>
            <span>USER_ROLE</span>
            <strong>Ciudadano</strong>
            <p>
              Crea reportes, consulta su actividad y utiliza
              las funciones ciudadanas disponibles.
            </p>
          </article>

          <article>
            <span>Cuenta inactiva</span>
            <strong>Acceso suspendido</strong>
            <p>
              Conserva su rol y datos, pero no puede iniciar
              sesión hasta que sea reactivada.
            </p>
          </article>
        </div>
      </Tarjeta>

      <FiltrosUsuarios
        busqueda={filtros.search ?? ''}
        rol={filtroRol}
        estado={filtroEstado}
        limite={filtros.limit ?? 20}
        bloqueado={consultaUsuarios.isFetching}
        alBuscar={aplicarBusqueda}
        alCambiarRol={setFiltroRol}
        alCambiarEstado={setFiltroEstado}
        alCambiarLimite={cambiarLimite}
        alLimpiar={limpiarFiltros}
      />

      <Tarjeta
        titulo="Directorio de usuarios"
        descripcion="Cuentas encontradas y datos principales de acceso al sistema."
      >
        <div className="usuariosPagina__contextoListado">
          <div>
            <span>Página actual</span>

            <strong>
              {usuariosFiltrados.length} de{' '}
              {usuarios.length} usuarios visibles
            </strong>
          </div>

          <div>
            <span>Resultado de búsqueda</span>

            <strong>
              {paginacion?.total ?? usuarios.length}{' '}
              usuarios encontrados
            </strong>
          </div>
        </div>

        {usuariosFiltrados.length > 0 ? (
          <ListadoUsuarios
            usuarios={usuariosFiltrados}
            totalUsuarios={
              paginacion?.total ?? usuarios.length
            }
            usuarioActualId={usuario?.id}
          />
        ) : usuarios.length > 0 ? (
          <EstadoVacio
            titulo="Sin coincidencias en esta página"
            descripcion="Los filtros locales de rol o estado no coinciden con los usuarios de la página actual."
            accion={
              <Boton
                variante="secundario"
                onClick={() => {
                  setFiltroRol('TODOS');
                  setFiltroEstado('TODOS');
                }}
              >
                Limpiar filtros locales
              </Boton>
            }
          />
        ) : (
          <EstadoVacio
            titulo="Sin usuarios encontrados"
            descripcion={
              filtros.search
                ? 'No se encontraron usuarios que coincidan con la búsqueda.'
                : 'No se encontraron cuentas registradas en el sistema.'
            }
            accion={
              filtros.search ? (
                <Boton
                  variante="secundario"
                  onClick={() => aplicarBusqueda('')}
                >
                  Limpiar búsqueda
                </Boton>
              ) : (
                <Boton
                  variante="secundario"
                  onClick={actualizarUsuarios}
                >
                  Actualizar listado
                </Boton>
              )
            }
          />
        )}
      </Tarjeta>

      {totalPaginas > 1 ? (
        <nav
          className="usuariosPagina__paginacion"
          aria-label="Paginación de usuarios"
        >
          <div>
            <span>Página</span>
            <strong>
              {paginaActual} de {totalPaginas}
            </strong>
          </div>

          <div className="usuariosPagina__paginacionControles">
            <Boton
              variante="secundario"
              tamano="sm"
              disabled={
                paginaActual <= 1 ||
                consultaUsuarios.isFetching
              }
              onClick={() =>
                cambiarPagina(paginaActual - 1)
              }
            >
              Anterior
            </Boton>

            <div className="usuariosPagina__paginas">
              {paginasVisibles.map((pagina) => (
                <button
                  type="button"
                  key={pagina}
                  aria-label={`Ir a la página ${pagina}`}
                  aria-current={
                    pagina === paginaActual
                      ? 'page'
                      : undefined
                  }
                  disabled={consultaUsuarios.isFetching}
                  onClick={() => cambiarPagina(pagina)}
                >
                  {pagina}
                </button>
              ))}
            </div>

            <Boton
              variante="secundario"
              tamano="sm"
              disabled={
                paginaActual >= totalPaginas ||
                consultaUsuarios.isFetching
              }
              onClick={() =>
                cambiarPagina(paginaActual + 1)
              }
            >
              Siguiente
            </Boton>
          </div>
        </nav>
      ) : null}
    </main>
  );
}