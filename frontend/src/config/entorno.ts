type NombreVariableEntorno = 'VITE_AUTH_API_URL' | 'VITE_REPORT_API_URL';

const valoresDesarrollo: Record<NombreVariableEntorno, string> = {
  VITE_AUTH_API_URL: 'http://localhost:3006/gestionurbana/v1',
  VITE_REPORT_API_URL: 'http://localhost:3007/gestionurbana/v1'
};

function normalizarUrlBase(url: string) {
  return url.trim().replace(/\/+$/, '');
}

function obtenerVariableEntorno(nombre: NombreVariableEntorno) {
  const valorConfigurado = import.meta.env[nombre];
  const valorDesarrollo = import.meta.env.DEV ? valoresDesarrollo[nombre] : undefined;
  const valorFinal = valorConfigurado || valorDesarrollo;

  if (!valorFinal || valorFinal.trim().length === 0) {
    throw new Error(
      `Falta configurar la variable de entorno ${nombre}. Revisa el archivo frontend/.env.`
    );
  }

  return normalizarUrlBase(valorFinal);
}

export const entorno = {
  modo: import.meta.env.MODE,
  esDesarrollo: import.meta.env.DEV,
  esProduccion: import.meta.env.PROD,
  api: {
    autenticacion: obtenerVariableEntorno('VITE_AUTH_API_URL'),
    reportes: obtenerVariableEntorno('VITE_REPORT_API_URL')
  }
} as const;