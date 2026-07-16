import type { ChangeEvent } from 'react';

import { rolesSistema } from '../../../config/constantesSistema';
import { Alerta } from '../../../shared/components/feedback/Alerta';
import { Cargando } from '../../../shared/components/feedback/Cargando';
import { Boton } from '../../../shared/components/ui/Boton';
import { esErrorApi } from '../../../shared/types/errorApi';
import { usarUsuariosPorRol } from '../../users/hooks/usarUsuariosPorRol';
import type { UsuarioSistema } from '../../users/types/usuariosTipos';
import type { UsuarioResumenReporte } from '../types/reportesTipos';
import './selectorResponsableReporte.css';

type PropiedadesSelectorResponsableReporte = {
  responsableId: string;
  responsableActual?: UsuarioResumenReporte | null;
  bloqueado?: boolean;
  alCambiarResponsable: (responsableId: string) => void;
};

function limpiarTexto(valor: string) {
  return valor.trim();
}

function obtenerNombreUsuario(usuario: UsuarioSistema | UsuarioResumenReporte) {
  const nombreCompleto = [usuario.name, usuario.surname].filter(Boolean).join(' ').trim();

  return nombreCompleto || usuario.username || 'Usuario';
}

function obtenerDetalleUsuario(usuario: UsuarioSistema | UsuarioResumenReporte) {
  if ('email' in usuario && usuario.email) {
    return usuario.email;
  }

  return usuario.username;
}

function obtenerMensajeError(error: unknown) {
  if (esErrorApi(error)) {
    return error.mensaje;
  }

  return 'No fue posible cargar los responsables. Puedes volver a intentar.';
}

function usuarioEstaActivo(usuario: UsuarioSistema) {
  return usuario.status !== false;
}

function construirUsuarioDesdeResumen(usuario: UsuarioResumenReporte): UsuarioSistema {
  return {
    id: usuario.id,
    name: usuario.name,
    surname: usuario.surname,
    username: usuario.username,
    email: '',
    role: rolesSistema.administrador,
    status: false
  };
}

function obtenerUsuariosAsignables(
  usuarios: UsuarioSistema[],
  responsableActual?: UsuarioResumenReporte | null
) {
  const usuariosActivos = usuarios.filter(usuarioEstaActivo);
  const responsableActualExiste =
    responsableActual &&
    usuariosActivos.some((usuario) => usuario.id === responsableActual.id);

  if (responsableActual && !responsableActualExiste) {
    return [construirUsuarioDesdeResumen(responsableActual), ...usuariosActivos];
  }

  return usuariosActivos;
}

function obtenerEtiquetaOpcion(usuario: UsuarioSistema) {
  const nombre = obtenerNombreUsuario(usuario);
  const detalle = obtenerDetalleUsuario(usuario);

  if (!usuario.status) {
    return `${nombre} · ${detalle} · actual no disponible`;
  }

  return `${nombre} · ${detalle}`;
}

export function SelectorResponsableReporte({
  responsableId,
  responsableActual,
  bloqueado = false,
  alCambiarResponsable
}: PropiedadesSelectorResponsableReporte) {
  const consultaUsuarios = usarUsuariosPorRol(rolesSistema.administrador);

  const respuestaUsuarios = consultaUsuarios.data;
  const usuarios =
    respuestaUsuarios?.success === true && Array.isArray(respuestaUsuarios.data)
      ? respuestaUsuarios.data
      : [];

  const usuariosAsignables = obtenerUsuariosAsignables(usuarios, responsableActual);
  const mensajeRespuestaFallida =
    respuestaUsuarios?.success === false
      ? respuestaUsuarios.message ??
        respuestaUsuarios.error ??
        'No fue posible cargar el listado de responsables.'
      : null;

  const mensajeErrorConsulta = consultaUsuarios.error
    ? obtenerMensajeError(consultaUsuarios.error)
    : null;

  const cambiarResponsable = (evento: ChangeEvent<HTMLSelectElement>) => {
    alCambiarResponsable(evento.target.value);
  };

  const actualizarResponsables = () => {
    void consultaUsuarios.refetch();
  };

  const responsableSeleccionado = usuariosAsignables.find(
    (usuario) => usuario.id === limpiarTexto(responsableId)
  );

  const responsableActualFueraCatalogo =
    Boolean(responsableActual) &&
    !usuarios.some((usuario) => usuario.id === responsableActual?.id);

  return (
    <div className="selectorResponsableReporte">
      <label className="accionesReporte__campo">
        <span>Responsable municipal</span>
        <select
          value={responsableId}
          disabled={bloqueado || consultaUsuarios.isLoading}
          onChange={cambiarResponsable}
        >
          <option value="">Selecciona un responsable</option>
          {usuariosAsignables.map((usuario) => (
            <option key={usuario.id} value={usuario.id} disabled={!usuario.status}>
              {obtenerEtiquetaOpcion(usuario)}
            </option>
          ))}
        </select>
      </label>

      {consultaUsuarios.isLoading ? (
        <div className="selectorResponsableReporte__estado">
          <Cargando texto="Cargando responsables..." compacto />
        </div>
      ) : null}

      {mensajeRespuestaFallida || mensajeErrorConsulta ? (
        <Alerta variante="advertencia" titulo="Responsables no disponibles">
          <div className="selectorResponsableReporte__alerta">
            <p>
              {mensajeRespuestaFallida ??
                mensajeErrorConsulta ??
                'No fue posible cargar los responsables. Puedes volver a intentar.'}
            </p>

            <Boton
              variante="secundario"
              tamano="sm"
              disabled={bloqueado || consultaUsuarios.isFetching}
              onClick={actualizarResponsables}
            >
              {consultaUsuarios.isFetching ? 'Actualizando...' : 'Reintentar'}
            </Boton>
          </div>
        </Alerta>
      ) : null}

      {!consultaUsuarios.isLoading && !mensajeRespuestaFallida && usuariosAsignables.length === 0 ? (
        <Alerta variante="informacion" titulo="Sin responsables activos">
          <p>No se encontraron usuarios administradores activos para asignar este reporte.</p>
        </Alerta>
      ) : null}

      {responsableActualFueraCatalogo ? (
        <Alerta variante="advertencia" titulo="Responsable actual no disponible">
          <p>
            El responsable actual ya no aparece como administrador activo. Selecciona otro
            responsable para continuar la gestión operativa.
          </p>
        </Alerta>
      ) : null}

      {responsableSeleccionado ? (
        <div className="selectorResponsableReporte__seleccion">
          <span>Responsable seleccionado</span>
          <strong>{obtenerNombreUsuario(responsableSeleccionado)}</strong>
          <small>{obtenerDetalleUsuario(responsableSeleccionado)}</small>
        </div>
      ) : (
        <div className="selectorResponsableReporte__ayuda">
          <span>Selecciona una persona con rol administrativo para dar seguimiento al caso.</span>
        </div>
      )}
    </div>
  );
}