import {
  useId,
  useMemo,
  useState
} from 'react';

import { Alerta } from '../../../shared/components/feedback/Alerta';
import { Cargando } from '../../../shared/components/feedback/Cargando';
import { Boton } from '../../../shared/components/ui/Boton';
import { esErrorApi } from '../../../shared/types/errorApi';
import type {
  RolUsuario
} from '../../authentication/types/autenticacionTipos';
import { usarRolesUsuario } from '../hooks/usarRolesUsuario';
import type {
  UsuarioSistema
} from '../types/usuariosTipos';
import './permisosUsuario.css';

type PropiedadesPermisosUsuario = {
  usuario: UsuarioSistema;
};

const etiquetasRol: Record<RolUsuario, string> = {
  ADMIN_ROLE: 'Administrador',
  USER_ROLE: 'Ciudadano'
};

const permisosPorRol: Record<RolUsuario, string[]> = {
  ADMIN_ROLE: [
    'Consultar y gestionar todos los reportes',
    'Asignar responsables y cambiar estados',
    'Administrar usuarios, roles y accesos',
    'Consultar herramientas operativas y administrativas'
  ],
  USER_ROLE: [
    'Crear reportes ciudadanos',
    'Consultar y dar seguimiento a su actividad',
    'Participar mediante comentarios y seguimiento',
    'Administrar la información de su perfil'
  ]
};

function obtenerMensajeError(error: unknown) {
  if (esErrorApi(error)) {
    return error.mensaje;
  }

  return 'No fue posible consultar los permisos del usuario.';
}

function obtenerPermisosUnicos(roles: RolUsuario[]) {
  return Array.from(
    new Set(
      roles.flatMap((rol) => permisosPorRol[rol])
    )
  );
}

export function PermisosUsuario({
  usuario
}: PropiedadesPermisosUsuario) {
  const identificadorReact = useId();

  const panelId = `permisos-usuario-${identificadorReact.replace(
    /:/g,
    ''
  )}`;

  const [abierto, setAbierto] = useState(false);

  const consultaRoles = usarRolesUsuario(
    usuario.id,
    {
      habilitado: abierto
    }
  );

  const respuestaRoles = consultaRoles.data;

  const roles = useMemo<RolUsuario[]>(() => {
    if (
      respuestaRoles?.success === true &&
      respuestaRoles.data.length > 0
    ) {
      return respuestaRoles.data;
    }

    return [usuario.role];
  }, [respuestaRoles, usuario.role]);

  const permisos = useMemo(
    () => obtenerPermisosUnicos(roles),
    [roles]
  );

  const mensajeRespuestaFallida =
    respuestaRoles?.success === false
      ? respuestaRoles.message ??
        respuestaRoles.error ??
        'No fue posible consultar los roles del usuario.'
      : null;

  const mensajeError =
    consultaRoles.error !== null
      ? obtenerMensajeError(consultaRoles.error)
      : mensajeRespuestaFallida;

  const alternarPanel = () => {
    setAbierto((estadoActual) => !estadoActual);
  };

  const actualizarRoles = () => {
    void consultaRoles.refetch();
  };

  return (
    <div className="permisosUsuario">
      <Boton
        variante="fantasma"
        tamano="sm"
        aria-expanded={abierto}
        aria-controls={panelId}
        onClick={alternarPanel}
      >
        {abierto ? 'Ocultar permisos' : 'Ver permisos'}
      </Boton>

      {abierto ? (
        <section
          id={panelId}
          className="permisosUsuario__panel"
          aria-label={`Permisos de ${usuario.username}`}
          aria-busy={consultaRoles.isFetching}
        >
          <div className="permisosUsuario__encabezado">
            <div>
              <span>Acceso actual</span>
              <strong>
                {usuario.status
                  ? 'Cuenta habilitada'
                  : 'Cuenta suspendida'}
              </strong>
            </div>

            <span
              className={
                usuario.status
                  ? 'permisosUsuario__estado permisosUsuario__estado--activo'
                  : 'permisosUsuario__estado permisosUsuario__estado--inactivo'
              }
            >
              {usuario.status ? 'Activa' : 'Inactiva'}
            </span>
          </div>

          {consultaRoles.isLoading ? (
            <Cargando
              texto="Consultando permisos..."
              compacto
            />
          ) : null}

          {mensajeError ? (
            <Alerta
              variante="advertencia"
              titulo="No se pudieron confirmar los roles"
            >
              <div className="permisosUsuario__error">
                <p>{mensajeError}</p>

                <Boton
                  variante="secundario"
                  tamano="sm"
                  disabled={consultaRoles.isFetching}
                  onClick={actualizarRoles}
                >
                  {consultaRoles.isFetching
                    ? 'Consultando...'
                    : 'Reintentar'}
                </Boton>
              </div>
            </Alerta>
          ) : null}

          <div className="permisosUsuario__roles">
            <span>Roles asignados</span>

            <div>
              {roles.map((rol) => (
                <span
                  key={rol}
                  className={
                    rol === 'ADMIN_ROLE'
                      ? 'permisosUsuario__rol permisosUsuario__rol--administrador'
                      : 'permisosUsuario__rol permisosUsuario__rol--ciudadano'
                  }
                >
                  {etiquetasRol[rol]}
                </span>
              ))}
            </div>
          </div>

          <div className="permisosUsuario__lista">
            <span>Permisos asociados</span>

            <ul>
              {permisos.map((permiso) => (
                <li key={permiso}>{permiso}</li>
              ))}
            </ul>
          </div>

          {!usuario.status ? (
            <div className="permisosUsuario__suspension">
              <strong>Acceso temporalmente suspendido</strong>

              <p>
                La cuenta conserva sus roles, pero no podrá
                iniciar sesión mientras permanezca inactiva.
              </p>
            </div>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}