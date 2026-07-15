import { ADMIN_ROLE } from '../helpers/role-constants.js';
import { getUserRoleNames } from '../helpers/role-db.js';

const obtenerRolesDesdeRequest = (req) => {
  if (Array.isArray(req.userRoles) && req.userRoles.length > 0) {
    return req.userRoles;
  }

  const rolesUsuario = req.user?.UserRoles?.map((userRole) => userRole.Role?.Name).filter(Boolean) ?? [];

  if (rolesUsuario.length > 0) {
    return rolesUsuario;
  }

  if (req.userRole) {
    return [req.userRole];
  }

  return null;
};

export const validateAdmin = async (req, res, next) => {
  try {
    const userId = req.userId || req.user?.Id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado.',
      });
    }

    const roles = obtenerRolesDesdeRequest(req) ?? (await getUserRoleNames(userId));

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