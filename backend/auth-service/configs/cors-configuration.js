'use strict';

const DEFAULT_ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://127.0.0.1:5173'
];

function obtenerOrigenesDesdeEnv() {
  const frontendUrl = process.env.FRONTEND_URL;
  const corsAllowedOrigins = process.env.CORS_ALLOWED_ORIGINS;

  const origenes = [
    frontendUrl,
    ...(corsAllowedOrigins ? corsAllowedOrigins.split(',') : [])
  ];

  return origenes
    .map((origin) => origin?.trim())
    .filter(Boolean);
}

function obtenerOrigenesPermitidos() {
  const origenesEnv = obtenerOrigenesDesdeEnv();

  return Array.from(
    new Set([
      ...DEFAULT_ALLOWED_ORIGINS,
      ...origenesEnv
    ])
  );
}

function esOrigenLocalPermitidoEnDesarrollo(origin) {
  if (process.env.NODE_ENV === 'production') {
    return false;
  }

  try {
    const url = new URL(origin);
    const hostname = url.hostname;

    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return false;
    }

    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return true;
    }

    if (/^192\.168\.\d{1,3}\.\d{1,3}$/.test(hostname)) {
      return true;
    }

    if (/^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) {
      return true;
    }

    if (/^172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}$/.test(hostname)) {
      return true;
    }

    return false;
  } catch {
    return false;
  }
}

function validateOrigin(origin, callback) {
  const allowedOrigins = obtenerOrigenesPermitidos();

  // Permite requests sin Origin: Postman, curl, apps móviles nativas, health checks.
  if (!origin) {
    callback(null, true);
    return;
  }

  if (allowedOrigins.includes(origin)) {
    callback(null, true);
    return;
  }

  if (esOrigenLocalPermitidoEnDesarrollo(origin)) {
    console.warn(`[CORS] Origen local permitido en desarrollo: ${origin}`);
    callback(null, true);
    return;
  }

  console.error('[CORS] Origen rechazado:', origin);
  console.error('[CORS] Orígenes permitidos:', allowedOrigins);

  callback(new Error(`Origen no permitido por CORS: ${origin}`));
}

export const corsOptions = {
  origin: validateOrigin,
  credentials: true,
  methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204
};