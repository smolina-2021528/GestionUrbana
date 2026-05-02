import { ADMIN_ROLE } from '../helpers/role-constants.js';
import { getUserRoleNames } from '../helpers/role-db.js';

export const validateAdmin = async (req, res, next) => {
  try {
    const userId = req.userId || req.user?.Id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado.',
      });
    }

    const roles = req.userRole
      ? [req.userRole]
      : await getUserRoleNames(userId);

    if (!roles.includes(ADMIN_ROLE)) {
      return res.status(403).json({
        success: false,
        message: 'Acceso denegado. Se requiere rol de administrador.',
      });
    }

    next();
  } catch (error) {
    console.error('Error en validateAdmin:', error);

    return res.status(500).json({
      success: false,
      message: 'Error validando permisos de administrador.',
    });
  }
};
