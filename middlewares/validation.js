import { body, query, validationResult } from 'express-validator';
import { REPORT_CATEGORIES, REPORT_PRIORITIES, REPORT_STATUSES } from '../helpers/report-constants.js';

import {
  DATE_RANGES,
  GROUPBY_OPTIONS,
  EXPORT_FORMATS,
  ZONE_RADIUS_OPTIONS,
} from '../helpers/stats-constants.js';


// Maneja los errores de validación y retorna respuesta formateada
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Errores de validación',
      errors: errors.array().map((error) => ({
        field: error.path,
        message: error.msg,
        value: error.value,
      })),
    });
  }
  next();
};

// Validaciones para registro de usuario
export const validateRegister = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('El nombre es obligatorio')
    .isLength({ max: 25 })
    .withMessage('El nombre no puede tener más de 25 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('El nombre solo puede contener letras y espacios'),

  body('surname')
    .trim()
    .notEmpty()
    .withMessage('El apellido es obligatorio')
    .isLength({ max: 25 })
    .withMessage('El apellido no puede tener más de 25 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('El apellido solo puede contener letras y espacios'),

  body('username')
    .trim()
    .notEmpty()
    .withMessage('El nombre de usuario es obligatorio')
    .isLength({ max: 50 })
    .withMessage('El nombre de usuario no puede tener más de 50 caracteres'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('El correo electrónico es obligatorio')
    .isEmail()
    .withMessage('El correo electrónico no tiene un formato válido')
    .isLength({ max: 150 })
    .withMessage('El correo electrónico no puede tener más de 150 caracteres'),

  body('password')
    .notEmpty()
    .withMessage('La contraseña es obligatoria')
    .isLength({ min: 8, max: 255 })
    .withMessage('La contraseña debe tener entre 8 y 255 caracteres')
    .matches(/[A-Z]/)
    .withMessage('La contraseña debe contener al menos una letra mayúscula')
    .matches(/[a-z]/)
    .withMessage('La contraseña debe contener al menos una letra minúscula')
    .matches(/[0-9]/)
    .withMessage('La contraseña debe contener al menos un número'),

  body('phone')
    .notEmpty()
    .withMessage('El número de teléfono es obligatorio')
    .matches(/^\d{8}$/)
    .withMessage('El número de teléfono debe tener exactamente 8 dígitos'),

  handleValidationErrors,
];

// Validaciones para login
export const validateLogin = [
  body('emailOrUsername')
    .trim()
    .notEmpty()
    .withMessage('Email o nombre de usuario es requerido'),

  body('password').notEmpty().withMessage('La contraseña es requerida'),

  handleValidationErrors,
];

// Validaciones para verificar email
export const validateVerifyEmail = [
  body('token').notEmpty().withMessage('El token de verificación es requerido'),
  handleValidationErrors,
];

// Validaciones para reenviar verificación
export const validateResendVerification = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('El email es obligatorio')
    .isEmail()
    .withMessage('Debe proporcionar un email válido'),
  handleValidationErrors,
];

// Validaciones para recuperar contraseña
export const validateForgotPassword = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('El email es obligatorio')
    .isEmail()
    .withMessage('Debe proporcionar un email válido'),
  handleValidationErrors,
];

// Validaciones para resetear contraseña
export const validateResetPassword = [
  body('token').notEmpty().withMessage('El token de recuperación es requerido'),

  body('newPassword')
    .notEmpty()
    .withMessage('La nueva contraseña es obligatoria')
    .isLength({ min: 8, max: 255 })
    .withMessage('La nueva contraseña debe tener entre 8 y 255 caracteres')
    .matches(/[A-Z]/)
    .withMessage('La nueva contraseña debe contener al menos una letra mayúscula')
    .matches(/[a-z]/)
    .withMessage('La nueva contraseña debe contener al menos una letra minúscula')
    .matches(/[0-9]/)
    .withMessage('La nueva contraseña debe contener al menos un número'),

  handleValidationErrors,
];

// Validaciones para actualizar perfil
export const validateUpdateProfile = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('El nombre no puede estar vacío')
    .isLength({ max: 25 })
    .withMessage('El nombre no puede tener más de 25 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('El nombre solo puede contener letras y espacios'),

  body('surname')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('El apellido no puede estar vacío')
    .isLength({ max: 25 })
    .withMessage('El apellido no puede tener más de 25 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('El apellido solo puede contener letras y espacios'),

  body('username')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('El nombre de usuario no puede estar vacío')
    .isLength({ max: 50 })
    .withMessage('El nombre de usuario no puede tener más de 50 caracteres'),

  body('phone')
    .optional()
    .matches(/^\d{8}$/)
    .withMessage('El número de teléfono debe tener exactamente 8 dígitos'),

  handleValidationErrors,
];

// Validaciones para cambiar contraseña
export const validateChangePassword = [
  body('currentPassword')
    .notEmpty()
    .withMessage('La contraseña actual es obligatoria'),

  body('newPassword')
    .notEmpty()
    .withMessage('La nueva contraseña es obligatoria')
    .isLength({ min: 8, max: 255 })
    .withMessage('La nueva contraseña debe tener entre 8 y 255 caracteres')
    .matches(/[A-Z]/)
    .withMessage('La nueva contraseña debe contener al menos una letra mayúscula')
    .matches(/[a-z]/)
    .withMessage('La nueva contraseña debe contener al menos una letra minúscula')
    .matches(/[0-9]/)
    .withMessage('La nueva contraseña debe contener al menos un número'),

  handleValidationErrors,
];

// ── Validaciones geográficas reutilizables ─────────────────────────────────────
const geoValidations = [
  body('latitude')
    .optional({ nullable: true })
    .isFloat({ min: -90, max: 90 })
    .withMessage('La latitud debe ser un número entre -90 y 90')
    .custom((value, { req }) => {
      // Si se envió latitude debe acompañarse de longitude
      const hasLat = value !== undefined && value !== null && value !== '';
      const hasLng =
        req.body.longitude !== undefined &&
        req.body.longitude !== null &&
        req.body.longitude !== '';

      if (hasLat && !hasLng) {
        throw new Error(
          'Si se proporciona latitude también debe proporcionarse longitude'
        );
      }
      return true;
    }),

  body('longitude')
    .optional({ nullable: true })
    .isFloat({ min: -180, max: 180 })
    .withMessage('La longitud debe ser un número entre -180 y 180')
    .custom((value, { req }) => {
      // Si se envió longitude debe acompañarse de latitude
      const hasLng = value !== undefined && value !== null && value !== '';
      const hasLat =
        req.body.latitude !== undefined &&
        req.body.latitude !== null &&
        req.body.latitude !== '';

      if (hasLng && !hasLat) {
        throw new Error(
          'Si se proporciona longitude también debe proporcionarse latitude'
        );
      }
      return true;
    }),

  body('address')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 500 })
    .withMessage('La dirección no puede superar los 500 caracteres'),
];

// Validaciones para crear un reporte
export const validateCreateReport = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('El título es obligatorio')
    .isLength({ min: 3, max: 150 })
    .withMessage('El título debe tener entre 3 y 150 caracteres'),

  body('description')
    .trim()
    .notEmpty()
    .withMessage('La descripción es obligatoria')
    .isLength({ min: 10, max: 2000 })
    .withMessage('La descripción debe tener entre 10 y 2000 caracteres'),

  body('category')
    .trim()
    .notEmpty()
    .withMessage('La categoría es obligatoria')
    .isIn(REPORT_CATEGORIES)
    .withMessage('Categoría inválida. Valores permitidos: INFRAESTRUCTURA, SEGURIDAD, LIMPIEZA'),

  // Campos geográficos opcionales
  ...geoValidations,

  handleValidationErrors,
];

// Validaciones para actualizar un reporte
export const validateUpdateReport = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 150 })
    .withMessage('El título debe tener entre 3 y 150 caracteres'),

  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('La descripción debe tener entre 10 y 2000 caracteres'),

  body('category')
    .optional()
    .trim()
    .isIn(REPORT_CATEGORIES)
    .withMessage('Categoría inválida. Valores permitidos: INFRAESTRUCTURA, SEGURIDAD, LIMPIEZA'),

  // Campos geográficos opcionales
  ...geoValidations,

  handleValidationErrors,
];

// Validaciones para cambiar el estado de un reporte
export const validateChangeReportStatus = [
  body('status')
    .trim()
    .notEmpty()
    .withMessage('El estado es obligatorio')
    .isIn(REPORT_STATUSES)
    .withMessage('Estado inválido. Valores: PENDIENTE, EN_PROCESO, RESUELTO, RECHAZADO'),

  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Las notas no pueden superar los 500 caracteres'),

  handleValidationErrors,
];

// Validaciones para actualizar exclusivamente la ubicación de un reporte
export const validateUpdateLocation = [
  body('latitude')
    .notEmpty()
    .withMessage('La latitud es obligatoria')
    .isFloat({ min: -90, max: 90 })
    .withMessage('La latitud debe ser un número entre -90 y 90'),

  body('longitude')
    .notEmpty()
    .withMessage('La longitud es obligatoria')
    .isFloat({ min: -180, max: 180 })
    .withMessage('La longitud debe ser un número entre -180 y 180'),

  body('address')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 500 })
    .withMessage('La dirección no puede superar los 500 caracteres'),

  handleValidationErrors,
];

// Validaciones para asignar un reporte a personal municipal
export const validateAssignReport = [
  body('assignedTo')
    .trim()
    .notEmpty()
    .withMessage('El ID del personal municipal es requerido')
    .isString()
    .withMessage('El ID del personal municipal es requerido'),

  handleValidationErrors,
];

// Validaciones para crear un comentario en un reporte
export const validateCreateComment = [
  body('content')
    .trim()
    .notEmpty()
    .withMessage('El contenido del comentario es obligatorio')
    .isLength({ min: 1, max: 1000 })
    .withMessage('El contenido debe tener entre 1 y 1000 caracteres'),

  body('isInternal')
    .optional()
    .isBoolean()
    .withMessage('isInternal debe ser un valor booleano'),

  handleValidationErrors,
];

// Validaciones para obtener comentarios de un reporte
export const validateGetComments = [
  query('includeInternal')
    .optional()
    .isBoolean()
    .withMessage('includeInternal debe ser un valor booleano'),

  handleValidationErrors,
];
// Validaciones para crear un reporte que acepta campos opcionales si viene imagen
export const validateCreateReportOrAI = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 150 })
    .withMessage('El título debe tener entre 3 y 150 caracteres'),

  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('La descripción debe tener entre 10 y 2000 caracteres'),

  body('category')
    .optional()
    .trim()
    .isIn(REPORT_CATEGORIES)
    .withMessage('Categoría inválida. Valores permitidos: INFRAESTRUCTURA, SEGURIDAD, LIMPIEZA'),

  // Campos geográficos opcionales
  ...geoValidations,

  // Validación final: si no viene imagen, los tres campos son obligatorios
  body('title').custom((value, { req }) => {
    const hasImage = req.files && req.files.length > 0;
    if (!hasImage && (!value || value.trim() === '')) {
      throw new Error('El título es obligatorio cuando no se adjunta una imagen');
    }
    return true;
  }),

  body('description').custom((value, { req }) => {
    const hasImage = req.files && req.files.length > 0;
    if (!hasImage && (!value || value.trim() === '')) {
      throw new Error('La descripción es obligatoria cuando no se adjunta una imagen');
    }
    return true;
  }),

  body('category').custom((value, { req }) => {
    const hasImage = req.files && req.files.length > 0;
    if (!hasImage && (!value || value.trim() === '')) {
      throw new Error('La categoría es obligatoria cuando no se adjunta una imagen');
    }
    return true;
  }),

  handleValidationErrors,
];

// Validaciones para analizar un reporte con IA (imagen + dirección)
export const validateAnalyzeReport = [
  body('address')
    .trim()
    .notEmpty()
    .withMessage('La dirección es obligatoria')
    .isLength({ max: 500 })
    .withMessage('La dirección no puede superar los 500 caracteres'),

  handleValidationErrors,
];

// Validaciones para crear un reporte generado por IA
export const validateAiCreateReport = [
  body('address')
    .trim()
    .notEmpty()
    .withMessage('La dirección es obligatoria')
    .isLength({ max: 500 })
    .withMessage('La dirección no puede superar los 500 caracteres'),

  handleValidationErrors,
];

// ── Validaciones de rango de fechas
export const validateDateRangeQuery = [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('startDate debe ser una fecha ISO 8601 válida')
    .custom((value, { req }) => {
      if (value && req.query.endDate) {
        if (new Date(value) > new Date(req.query.endDate)) {
          throw new Error('startDate no puede ser mayor que endDate');
        }
      }
      return true;
    }),

  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('endDate debe ser una fecha ISO 8601 válida')
    .custom((value, { req }) => {
      if (value && req.query.startDate) {
        if (new Date(value) < new Date(req.query.startDate)) {
          throw new Error('endDate no puede ser menor que startDate');
        }
      }
      return true;
    }),

  query('dateRange')
    .optional()
    .isIn(Object.keys(DATE_RANGES))
    .withMessage(
      `dateRange debe ser uno de: ${Object.keys(DATE_RANGES).join(', ')}`
    ),

  query('groupBy')
    .optional()
    .isIn(GROUPBY_OPTIONS)
    .withMessage(`groupBy debe ser uno de: ${GROUPBY_OPTIONS.join(', ')}`),

  handleValidationErrors,
];

// ── Validaciones para el endpoint de exportación
export const validateExportQuery = [
  query('format')
    .optional()
    .isIn(EXPORT_FORMATS)
    .withMessage(`format debe ser uno de: ${EXPORT_FORMATS.join(', ')}`),

  query('category')
    .optional()
    .isIn(REPORT_CATEGORIES)
    .withMessage(`category debe ser uno de: ${REPORT_CATEGORIES.join(', ')}`),

  query('priority')
    .optional()
    .isIn(REPORT_PRIORITIES)
    .withMessage(`priority debe ser uno de: ${REPORT_PRIORITIES.join(', ')}`),

  query('status')
    .optional()
    .isIn(REPORT_STATUSES)
    .withMessage(`status debe ser uno de: ${REPORT_STATUSES.join(', ')}`),

  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('startDate debe ser una fecha ISO 8601 válida')
    .custom((value, { req }) => {
      if (value && req.query.endDate) {
        if (new Date(value) > new Date(req.query.endDate)) {
          throw new Error('startDate no puede ser mayor que endDate');
        }
      }
      return true;
    }),

  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('endDate debe ser una fecha ISO 8601 válida')
    .custom((value, { req }) => {
      if (value && req.query.startDate) {
        if (new Date(value) < new Date(req.query.startDate)) {
          throw new Error('endDate no puede ser menor que startDate');
        }
      }
      return true;
    }),

  handleValidationErrors,
];

// ── Validaciones para el endpoint de ranking de zonas
export const validateZoneRankingQuery = [
  query('radius')
    .optional()
    .isInt()
    .withMessage('radius debe ser un número entero')
    .toInt()
    .isIn(ZONE_RADIUS_OPTIONS)
    .withMessage(
      `radius debe ser uno de: ${ZONE_RADIUS_OPTIONS.join(', ')} (metros)`
    ),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 20 })
    .withMessage('limit debe ser un entero entre 1 y 20')
    .toInt(),

  query('category')
    .optional()
    .isIn(REPORT_CATEGORIES)
    .withMessage(`category debe ser uno de: ${REPORT_CATEGORIES.join(', ')}`),

  query('status')
    .optional()
    .isIn(REPORT_STATUSES)
    .withMessage(`status debe ser uno de: ${REPORT_STATUSES.join(', ')}`),

  handleValidationErrors,
];

// Validaciones para GET /stats/heatmap-grid
export const validateHeatmapGridQuery = [
  query('cellDegrees')
    .optional()
    .isFloat({ min: 0.001, max: 0.1 })
    .withMessage('cellDegrees debe ser un número decimal entre 0.001 y 0.1 (grados)')
    .toFloat(),

  query('category')
    .optional()
    .isIn(REPORT_CATEGORIES)
    .withMessage(`category debe ser uno de: ${REPORT_CATEGORIES.join(', ')}`),

  query('priority')
    .optional()
    .isIn(REPORT_PRIORITIES)
    .withMessage(`priority debe ser uno de: ${REPORT_PRIORITIES.join(', ')}`),

  query('status')
    .optional()
    .isIn(REPORT_STATUSES)
    .withMessage(`status debe ser uno de: ${REPORT_STATUSES.join(', ')}`),

  handleValidationErrors,
];