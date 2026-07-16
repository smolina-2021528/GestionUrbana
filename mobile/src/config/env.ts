type ConfiguracionEntorno = {
  authApiUrl: string;
  reportApiUrl: string;
};

const authApiUrl = process.env.EXPO_PUBLIC_AUTH_API_URL;
const reportApiUrl = process.env.EXPO_PUBLIC_REPORT_API_URL;

if (!authApiUrl) {
  console.warn(
    'EXPO_PUBLIC_AUTH_API_URL no está configurada. Revisa mobile/.env.'
  );
}

if (!reportApiUrl) {
  console.warn(
    'EXPO_PUBLIC_REPORT_API_URL no está configurada. Revisa mobile/.env.'
  );
}

export const env: ConfiguracionEntorno = {
  authApiUrl: authApiUrl ?? 'http://10.0.2.2:3006/gestionurbana/v1',
  reportApiUrl: reportApiUrl ?? 'http://10.0.2.2:3007/gestionurbana/v1'
};