import { body, validationResult } from 'express-validator';

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Errores de validacion',
      errors: errors.array().map((error) => ({
        field: error.path,
        message: error.msg,
        value: error.value,
      })),
    });
  }

  next();
};

export const validateRegister = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('El nombre es obligatorio')
    .isLength({ max: 25 })
    .withMessage('El nombre no puede tener mas de 25 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('El nombre solo puede contener letras y espacios'),

  body('surname')
    .trim()
    .notEmpty()
    .withMessage('El apellido es obligatorio')
    .isLength({ max: 25 })
    .withMessage('El apellido no puede tener mas de 25 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('El apellido solo puede contener letras y espacios'),

  body('username')
    .trim()
    .notEmpty()
    .withMessage('El nombre de usuario es obligatorio')
    .isLength({ max: 50 })
    .withMessage('El nombre de usuario no puede tener mas de 50 caracteres'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('El correo electronico es obligatorio')
    .isEmail()
    .withMessage('El correo electronico no tiene un formato valido')
    .isLength({ max: 150 })
    .withMessage('El correo electronico no puede tener mas de 150 caracteres'),

  body('password')
    .notEmpty()
    .withMessage('La contrasena es obligatoria')
    .isLength({ min: 8, max: 255 })
    .withMessage('La contrasena debe tener entre 8 y 255 caracteres')
    .matches(/[A-Z]/)
    .withMessage('La contrasena debe contener al menos una letra mayuscula')
    .matches(/[a-z]/)
    .withMessage('La contrasena debe contener al menos una letra minuscula')
    .matches(/[0-9]/)
    .withMessage('La contrasena debe contener al menos un numero'),

  body('phone')
    .notEmpty()
    .withMessage('El numero de telefono es obligatorio')
    .matches(/^\d{8}$/)
    .withMessage('El numero de telefono debe tener exactamente 8 digitos'),

  handleValidationErrors,
];

export const validateLogin = [
  body('emailOrUsername')
    .trim()
    .notEmpty()
    .withMessage('Email o nombre de usuario es requerido'),

  body('password')
    .notEmpty()
    .withMessage('La contrasena es requerida'),

  handleValidationErrors,
];

export const validateVerifyEmail = [
  body('token')
    .notEmpty()
    .withMessage('El token de verificacion es requerido'),

  handleValidationErrors,
];

export const validateResendVerification = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('El email es obligatorio')
    .isEmail()
    .withMessage('Debe proporcionar un email valido'),

  handleValidationErrors,
];

export const validateForgotPassword = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('El email es obligatorio')
    .isEmail()
    .withMessage('Debe proporcionar un email valido'),

  handleValidationErrors,
];

export const validateResetPassword = [
  body('token')
    .notEmpty()
    .withMessage('El token de recuperacion es requerido'),

  body('newPassword')
    .notEmpty()
    .withMessage('La nueva contrasena es obligatoria')
    .isLength({ min: 8, max: 255 })
    .withMessage('La nueva contrasena debe tener entre 8 y 255 caracteres')
    .matches(/[A-Z]/)
    .withMessage('La nueva contrasena debe contener al menos una letra mayuscula')
    .matches(/[a-z]/)
    .withMessage('La nueva contrasena debe contener al menos una letra minuscula')
    .matches(/[0-9]/)
    .withMessage('La nueva contrasena debe contener al menos un numero'),

  handleValidationErrors,
];

export const validateUpdateProfile = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('El nombre no puede estar vacio')
    .isLength({ max: 25 })
    .withMessage('El nombre no puede tener mas de 25 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('El nombre solo puede contener letras y espacios'),

  body('surname')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('El apellido no puede estar vacio')
    .isLength({ max: 25 })
    .withMessage('El apellido no puede tener mas de 25 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('El apellido solo puede contener letras y espacios'),

  body('username')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('El nombre de usuario no puede estar vacio')
    .isLength({ max: 50 })
    .withMessage('El nombre de usuario no puede tener mas de 50 caracteres'),

  body('phone')
    .optional()
    .matches(/^\d{8}$/)
    .withMessage('El numero de telefono debe tener exactamente 8 digitos'),

  handleValidationErrors,
];

export const validateChangePassword = [
  body('currentPassword')
    .notEmpty()
    .withMessage('La contrasena actual es obligatoria'),

  body('newPassword')
    .notEmpty()
    .withMessage('La nueva contrasena es obligatoria')
    .isLength({ min: 8, max: 255 })
    .withMessage('La nueva contrasena debe tener entre 8 y 255 caracteres')
    .matches(/[A-Z]/)
    .withMessage('La nueva contrasena debe contener al menos una letra mayuscula')
    .matches(/[a-z]/)
    .withMessage('La nueva contrasena debe contener al menos una letra minuscula')
    .matches(/[0-9]/)
    .withMessage('La nueva contrasena debe contener al menos un numero'),

  handleValidationErrors,
];
