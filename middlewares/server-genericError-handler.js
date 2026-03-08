import { randomUUID } from 'crypto';

// Middleware global para el manejo de errores no capturados
// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, _next) => {
  console.error('Error:', err);
  const traceId = err.traceId || randomUUID();
  const timestamp = new Date().toISOString();
  const errorCode = err.errorCode || null;

  // Error de validación de Sequelize
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Error de validación en la base de datos',
      errors: err.errors?.map((e) => ({ field: e.path, message: e.message })),
      traceId,
      timestamp,
    });
  }

  // Error de unicidad de Sequelize
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      success: false,
      message: 'Ya existe un registro con esos datos',
      traceId,
      timestamp,
    });
  }

  // Error de JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Token inválido',
      errorCode,
      traceId,
      timestamp,
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expirado',
      errorCode,
      traceId,
      timestamp,
    });
  }

  // Error de archivo demasiado grande (multer)
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'El archivo es demasiado grande',
      errorCode,
      traceId,
      timestamp,
    });
  }

  // Error personalizado con status asignado
  if (err.status) {
    return res.status(err.status).json({
      success: false,
      message: err.message || 'Error del servidor',
      errorCode: err.errorCode || null,
      traceId,
      timestamp,
    });
  }

  // Error genérico del servidor
  return res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    errorCode,
    traceId,
    timestamp,
  });
};

// Middleware para manejar rutas no encontradas (404)
export const notFound = (req, res) => {
  const traceId = randomUUID();
  const timestamp = new Date().toISOString();
  res.status(404).json({
    success: false,
    message: `Ruta ${req.originalUrl} no encontrada`,
    errorCode: null,
    traceId,
    timestamp,
  });
};

// Wrapper para capturar errores en funciones async sin try/catch explícito
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
