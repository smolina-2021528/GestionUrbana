import { getUserRoleNames } from '../helpers/role-db.js';
import { ADMIN_ROLE } from '../helpers/role-constants.js';

// Middleware que verifica si el usuario autenticado tiene el rol ADMIN_ROLE
// Debe usarse DESPUÉS de validateJWT
export const validateAdmin = async (req, res, next) => {
  try {
    const userId = req.userId;

    // Usar los roles ya cargados en el request o consultarlos si no están disponibles
    const roles =
      req.user?.UserRoles?.map((ur) => ur.Role?.Name).filter(Boolean) ??
      (await getUserRoleNames(userId));

    if (!roles.includes(ADMIN_ROLE)) {
      return res.status(403).json({
        success: false,
        message: 'Acceso denegado. Se requiere rol de administrador (Personal Municipal).',
      });
    }

    next();
  } catch (error) {
    console.error('Error en validateAdmin:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor.' });
  }
};
