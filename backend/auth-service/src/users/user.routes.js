import { Router } from 'express';
import {
  updateUserRole,
  getUserRoles,
  getUsersByRole,
  getAllUsers,
  toggleUserStatus,
} from './user.controller.js';
import { validateJWT } from '../../middlewares/validate-JWT.js';
import { validateAdmin } from '../../middlewares/validate-admin.js';

const router = Router();

// Todas las rutas de usuarios requieren JWT y permisos administrativos.

// GET /gestionurbana/v1/users
// Lista todos los usuarios (admin)
router.get('/', validateJWT, validateAdmin, getAllUsers);

// GET /gestionurbana/v1/users/by-role/:roleName
// Lista usuarios por rol (admin)
router.get('/by-role/:roleName', validateJWT, validateAdmin, getUsersByRole);

// GET /gestionurbana/v1/users/:userId/roles
// Consulta roles de un usuario (admin)
router.get('/:userId/roles', validateJWT, validateAdmin, getUserRoles);

// PUT /gestionurbana/v1/users/:userId/role
// Cambia el rol de un usuario (admin)
router.put('/:userId/role', validateJWT, validateAdmin, updateUserRole);

// PATCH /gestionurbana/v1/users/:userId/status
// Activa/desactiva una cuenta (admin)
router.patch('/:userId/status', validateJWT, validateAdmin, toggleUserStatus);

export default router;