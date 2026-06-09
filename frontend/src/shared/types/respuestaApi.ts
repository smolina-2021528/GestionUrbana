export type RespuestaApiExitosa<TDatos> = {
  success: true;
  message?: string;
  data?: TDatos;
};

export type RespuestaApiFallida = {
  success: false;
  message?: string;
  error?: string;
  errors?: unknown;
};

export type RespuestaApi<TDatos = unknown> = RespuestaApiExitosa<TDatos> | RespuestaApiFallida;

export type RespuestaPaginada<TElemento> = {
  items: TElemento[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};