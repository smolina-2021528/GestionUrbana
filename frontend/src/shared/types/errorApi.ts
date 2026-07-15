export type CodigoErrorApi =
  | 'ERROR_VALIDACION'
  | 'NO_AUTENTICADO'
  | 'CUENTA_DESACTIVADA'
  | 'NO_AUTORIZADO'
  | 'RECURSO_NO_ENCONTRADO'
  | 'CONFLICTO'
  | 'ERROR_SERVIDOR'
  | 'ERROR_RED'
  | 'ERROR_DESCONOCIDO';

export type ErrorApi = {
  codigo: CodigoErrorApi;
  mensaje: string;
  estadoHttp?: number;
  detalles?: unknown;
};

export function esErrorApi(error: unknown): error is ErrorApi {
  if (!error || typeof error !== 'object') {
    return false;
  }

  return 'codigo' in error && 'mensaje' in error;
}