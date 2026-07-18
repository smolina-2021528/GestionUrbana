import { User } from '../src/users/user-ref.model.js';
import { getUserRoleNames } from '../helpers/role-db.js';
import { ADMIN_ROLE } from '../helpers/role-constants.js';

const limpiarTexto = (valor) => String(valor ?? '').trim();

export const validateAssignableAdmin = async (req, res, next) => {
  try {
    const assignedTo = limpiarTexto(req.body?.assignedTo);

    if (!assignedTo) {
      return res.status(400).json({
        success: false,
        message: 'El ID del responsable municipal es obligatorio.',
      });
    }

    const user = await User.findByPk(assignedTo);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'El usuario a asignar no existe.',
      });
    }

    if (user.Status !== true) {
      return res.status(400).json({
        success: false,
        message: 'No se puede asignar el reporte a una cuenta desactivada.',
      });
    }

    const roles = await getUserRoleNames(user.Id);

    if (!roles.includes(ADMIN_ROLE)) {
      return res.status(400).json({
        success: false,
        message: 'Solo una cuenta activa con rol ADMIN_ROLE puede ser responsable de un reporte.',
      });
    }

    req.assignableAdmin = user;
    next();
  } catch (error) {
    console.error('Error en validateAssignableAdmin:', error);

    return res.status(500).json({
      success: false,
      message: 'Error validando el responsable del reporte.',
    });
  }
};