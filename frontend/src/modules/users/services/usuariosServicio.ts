import { rutasApi } from '../../../config/rutasApi';
import { clienteAuth, obtenerDatosRespuesta } from '../../../shared/services/clienteHttp';
import type { RespuestaUsuarios } from '../types/usuariosTipos';

function limpiarTexto(valor: string) {
  return valor.trim();
}

export const usuariosServicio = {
  async obtenerUsuariosPorRol(nombreRol: string): Promise<RespuestaUsuarios> {
    return obtenerDatosRespuesta<RespuestaUsuarios>(
      clienteAuth.get(rutasApi.usuarios.porRol(limpiarTexto(nombreRol)))
    );
  }
};