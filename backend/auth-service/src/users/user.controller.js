import { asyncHandler } from '../../middlewares/server-genericError-handler.js';
import { findUserById } from '../../helpers/user-db.js';
import {
  getUserRoleNames,
  getUsersByRole as repoGetUsersByRole,
  setUserSingleRole,
} from '../../helpers/role-db.js';
import { ALLOWED_ROLES } from '../../helpers/role-constants.js';
import { buildUserResponse } from '../../../report-service/utils/user-helpers.js';
import { sequelize } from '../../configs/db.js';
import { User } from './user.model.js';
import { Op } from 'sequelize';

// PUT /gestionurbana/v1/users/:userId/role
// Actualiza el rol de un usuario (solo admin)
export const updateUserRole = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { roleName } = req.body || {};

  const normalized = (roleName || '').trim().toUpperCase();
  if (!ALLOWED_ROLES.includes(normalized)) {
    return res.status(400).json({
      success: false,
      message: `Rol no permitido. Valores válidos: ${ALLOWED_ROLES.join(', ')}`,
    });
  }

  const user = await findUserById(userId);
  if (!user) {
    return res.status(404).json({ success: false, message: 'Usuario no encontrado.' });
  }

  const { updatedUser } = await setUserSingleRole(user, normalized, sequelize);

  return res.status(200).json({
    success: true,
    message: `Rol actualizado a ${normalized} exitosamente.`,
    data: buildUserResponse(updatedUser),
  });
});

// GET /gestionurbana/v1/users/:userId/roles
// Consulta los roles de un usuario específico
export const getUserRoles = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await findUserById(userId);
  if (!user) {
    return res.status(404).json({ success: false, message: 'Usuario no encontrado.' });
  }

  const roles = await getUserRoleNames(userId);
  return res.status(200).json({ success: true, data: roles });
});

// GET /gestionurbana/v1/users/by-role/:roleName
// Lista todos los usuarios con un rol específico (solo admin)
export const getUsersByRole = asyncHandler(async (req, res) => {
  const { roleName } = req.params;
  const normalized = (roleName || '').trim().toUpperCase();

  if (!ALLOWED_ROLES.includes(normalized)) {
    return res.status(400).json({
      success: false,
      message: `Rol no permitido. Valores válidos: ${ALLOWED_ROLES.join(', ')}`,
    });
  }

  const users = await repoGetUsersByRole(normalized);
  return res.status(200).json({
    success: true,
    data: users.map(buildUserResponse),
  });
});

// GET /gestionurbana/v1/users
// Lista todos los usuarios del sistema con paginación (solo admin)
export const getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search = '' } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  const whereClause = search
    ? {
        [Op.or]: [
          { Name: { [Op.iLike]: `%${search}%` } },
          { Surname: { [Op.iLike]: `%${search}%` } },
          { Username: { [Op.iLike]: `%${search}%` } },
          { Email: { [Op.iLike]: `%${search}%` } },
        ],
      }
    : {};

  const { count, rows } = await User.findAndCountAll({
    where: whereClause,
    limit: parseInt(limit),
    offset,
    order: [['created_at', 'DESC']],
  });

  return res.status(200).json({
    success: true,
    data: rows.map(buildUserResponse),
    pagination: {
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / parseInt(limit)),
    },
  });
});

// PATCH /gestionurbana/v1/users/:userId/status
// Activa o desactiva la cuenta de un usuario (solo admin)
export const toggleUserStatus = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await findUserById(userId);
  if (!user) {
    return res.status(404).json({ success: false, message: 'Usuario no encontrado.' });
  }

  // Proteger al admin activo de desactivarse a sí mismo
  if (userId === req.userId) {
    return res.status(400).json({
      success: false,
      message: 'No puedes cambiar el estado de tu propia cuenta.',
    });
  }

  await User.update(
    { Status: !user.Status },
    { where: { Id: userId } }
  );

  const updatedUser = await findUserById(userId);
  return res.status(200).json({
    success: true,
    message: `Cuenta ${updatedUser.Status ? 'activada' : 'desactivada'} exitosamente.`,
    data: buildUserResponse(updatedUser),
  });
});
