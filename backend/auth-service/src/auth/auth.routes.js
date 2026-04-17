import { Router } from 'express';
import {
  register,
  login,
  logout,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  getProfile,
} from './auth.controller.js';
import { validateJWT } from '../../middlewares/validate-JWT.js';
import {
  authRateLimit,
  requestLimit,
  emailRateLimit,
} from '../../middlewares/request-limit.js';
import { upload, handleUploadError } from '../../../shared/file-upload.js';
import {
  validateRegister,
  validateLogin,
  validateVerifyEmail,
  validateResendVerification,
  validateForgotPassword,
  validateResetPassword,
} from '../../middlewares/validation.js';

const router = Router();

/* ============================================================
   RUTAS PÚBLICAS
   ============================================================ */

// POST /gestionurbana/v1/auth/register
// Registro de ciudadano (foto de perfil opcional)
router.post(
  '/register',
  authRateLimit,
  upload.single('profilePicture'),
  handleUploadError,
  validateRegister,
  register
);

// POST /gestionurbana/v1/auth/login
router.post('/login', authRateLimit, validateLogin, login);

// POST /gestionurbana/v1/auth/verify-email
router.post('/verify-email', requestLimit, validateVerifyEmail, verifyEmail);

// POST /gestionurbana/v1/auth/resend-verification
router.post(
  '/resend-verification',
  emailRateLimit,
  validateResendVerification,
  resendVerification
);

// POST /gestionurbana/v1/auth/forgot-password
router.post(
  '/forgot-password',
  emailRateLimit,
  validateForgotPassword,
  forgotPassword
);

// POST /gestionurbana/v1/auth/reset-password
router.post(
  '/reset-password',
  authRateLimit,
  validateResetPassword,
  resetPassword
);

/* ============================================================
  RUTAS PROTEGIDAS (requieren JWT válido)
   ============================================================ */

// GET /gestionurbana/v1/auth/profile
router.get('/profile', validateJWT, getProfile);

// POST /gestionurbana/v1/auth/logout
// Invalida el JWT actual agregando su jti a la blacklist en memoria.
router.post('/logout', validateJWT, logout);

export default router;