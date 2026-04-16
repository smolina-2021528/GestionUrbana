import { Router } from 'express';
import { updateProfile, changePassword } from './profile.controller.js';
import { validateJWT } from '../../middlewares/validate-JWT.js';
import { upload, handleUploadError } from '../../helpers/file-upload.js';
import {
  validateUpdateProfile,
  validateChangePassword,
} from '../../middlewares/validation.js';

const router = Router();

// PUT /gestionurbana/v1/profile
// Actualiza nombre, apellido, username, teléfono y foto del usuario autenticado
router.put(
  '/',
  validateJWT,
  upload.single('profilePicture'),
  handleUploadError,
  validateUpdateProfile,
  updateProfile
);

// PUT /gestionurbana/v1/profile/change-password
// Cambia la contraseña verificando la actual
router.put('/change-password', validateJWT, validateChangePassword, changePassword);

export default router;
