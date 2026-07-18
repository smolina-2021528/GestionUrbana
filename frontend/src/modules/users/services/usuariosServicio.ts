import { rutasApi } from '../../../config/rutasApi';
import {
  clienteAuth,
  obtenerDatosRespuesta
} from '../../../shared/services/clienteHttp';
import type {
  CambiarRolUsuarioPayload,
  FiltrosUsuarios,
  RespuestaActualizarUsuario,
  RespuestaListadoUsuarios,
  RespuestaRolesUsuario,
  RespuestaUsuariosPorRol
} from '../types/usuariosTipos';

type ParametrosConsultaUsuarios = {
  page?: number;
  limit?: number;
  search?: string;
};

type OpcionesUsuariosPorRol = {
  activeOnly?: boolean;
};

function limpiarTexto(valor: string) {
  return valor.trim();
}

function normalizarEnteroPositivo(
  valor: number | undefined
) {
  if (
    typeof valor !== 'number' ||
    !Number.isInteger(valor) ||
    valor <= 0
  ) {
    return undefined;
  }

  return valor;
}

function construirParametrosUsuarios(
  filtros?: FiltrosUsuarios
): ParametrosConsultaUsuarios {
  const parametros: ParametrosConsultaUsuarios = {};

  const page = normalizarEnteroPositivo(filtros?.page);
  const limit = normalizarEnteroPositivo(filtros?.limit);
  const search = limpiarTexto(filtros?.search ?? '');

  if (page !== undefined) {
    parametros.page = page;
  }

  if (limit !== undefined) {
    parametros.limit = limit;
  }

  if (search) {
    parametros.search = search;
  }

  return parametros;
}

function construirParametrosUsuariosPorRol(
  opciones?: OpcionesUsuariosPorRol
) {
  if (typeof opciones?.activeOnly !== 'boolean') {
    return undefined;
  }

  return {
    activeOnly: opciones.activeOnly
  };
}

function validarIdentificador(
  identificador: string,
  nombreCampo: string
) {
  const valor = limpiarTexto(identificador);

  if (!valor) {
    throw new Error(
      `${nombreCampo} es obligatorio para completar la solicitud.`
    );
  }

  return valor;
}

export const usuariosServicio = {
  async obtenerUsuarios(
    filtros?: FiltrosUsuarios
  ): Promise<RespuestaListadoUsuarios> {
    return obtenerDatosRespuesta<RespuestaListadoUsuarios>(
      clienteAuth.get(rutasApi.usuarios.listar, {
        params: construirParametrosUsuarios(filtros)
      })
    );
  },

  async obtenerUsuariosPorRol(
    nombreRol: string,
    opciones?: OpcionesUsuariosPorRol
  ): Promise<RespuestaUsuariosPorRol> {
    const rol = validarIdentificador(
      nombreRol,
      'El rol'
    );

    return obtenerDatosRespuesta<RespuestaUsuariosPorRol>(
      clienteAuth.get(rutasApi.usuarios.porRol(rol), {
        params: construirParametrosUsuariosPorRol(opciones)
      })
    );
  },

  async obtenerRolesUsuario(
    usuarioId: string
  ): Promise<RespuestaRolesUsuario> {
    const id = validarIdentificador(
      usuarioId,
      'El identificador del usuario'
    );

    return obtenerDatosRespuesta<RespuestaRolesUsuario>(
      clienteAuth.get(rutasApi.usuarios.rolesUsuario(id))
    );
  },

  async cambiarRolUsuario(
    usuarioId: string,
    datos: CambiarRolUsuarioPayload
  ): Promise<RespuestaActualizarUsuario> {
    const id = validarIdentificador(
      usuarioId,
      'El identificador del usuario'
    );

    return obtenerDatosRespuesta<RespuestaActualizarUsuario>(
      clienteAuth.put(
        rutasApi.usuarios.cambiarRol(id),
        {
          roleName: datos.roleName
        }
      )
    );
  },

  async cambiarEstadoUsuario(
    usuarioId: string
  ): Promise<RespuestaActualizarUsuario> {
    const id = validarIdentificador(
      usuarioId,
      'El identificador del usuario'
    );

    return obtenerDatosRespuesta<RespuestaActualizarUsuario>(
      clienteAuth.patch(
        rutasApi.usuarios.cambiarEstado(id)
      )
    );
  }
};