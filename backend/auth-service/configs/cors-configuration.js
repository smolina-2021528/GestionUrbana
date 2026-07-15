const DEFAULT_DEVELOPMENT_ORIGINS = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

const isProduction = () => process.env.NODE_ENV === 'production';

const parseAllowedOrigins = () => {
  const configuredOrigins = process.env.CORS_ALLOWED_ORIGINS || process.env.FRONTEND_URL || '';

  return configuredOrigins
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
};

const getAllowedOrigins = () => [
  ...new Set([
    ...(isProduction() ? [] : DEFAULT_DEVELOPMENT_ORIGINS),
    ...parseAllowedOrigins(),
  ]),
];

const isLocalDevelopmentOrigin = (origin) => {
  if (isProduction()) return false;

  return /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
};

const validateOrigin = (origin, callback) => {
  if (!origin) {
    return callback(null, true);
  }

  const allowedOrigins = getAllowedOrigins();

  if (allowedOrigins.includes(origin) || isLocalDevelopmentOrigin(origin)) {
    return callback(null, true);
  }

  return callback(new Error(`Origen no permitido por CORS: ${origin}`));
};

export const corsOptions = {
  origin: validateOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-token'],
  optionsSuccessStatus: 204,
};