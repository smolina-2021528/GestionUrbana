const BASE_PATH = '/gestionurbana/v1';

function limpiarUrl(url?: string) {
  return url?.trim().replace(/\/$/, '') ?? '';
}

function construirUrlPorDefecto(puerto: number) {
  return `http://localhost:${puerto}${BASE_PATH}`;
}

function validarUrl(nombre: string, valor: string) {
  if (!valor) {
    console.warn(`[ENV] ${nombre} no está configurada.`);
    return;
  }

  if (!valor.startsWith('http://') && !valor.startsWith('https://')) {
    console.warn(`[ENV] ${nombre} debe iniciar con http:// o https://`);
  }

  if (valor.includes('localhost')) {
    console.warn(
      `[ENV] ${nombre} usa localhost. En iPhone físico debes usar la IPv4 de tu computadora.`
    );
  }
}

const authApiUrl = limpiarUrl(
  process.env.EXPO_PUBLIC_AUTH_API_URL || construirUrlPorDefecto(3006)
);

const reportApiUrl = limpiarUrl(
  process.env.EXPO_PUBLIC_REPORT_API_URL || construirUrlPorDefecto(3007)
);

validarUrl('EXPO_PUBLIC_AUTH_API_URL', authApiUrl);
validarUrl('EXPO_PUBLIC_REPORT_API_URL', reportApiUrl);

export const env = {
  authApiUrl,
  reportApiUrl,
  timeoutMs: 15000,
  esDesarrollo: process.env.NODE_ENV !== 'production'
};