import { findReportById } from '../helpers/report-db.js';
import { getUserRoleNames } from '../helpers/role-db.js';
import { ADMIN_ROLE } from '../helpers/role-constants.js';

// Middleware que verifica que el reporte le pertenece al usuario autenticado.
// Si el usuario es ADMIN, siempre puede continuar.
export const validateReportOwner = async (req, res, next) => {
try {
    const { reportId } = req.params;
    const userId = req.userId;

    const report = await findReportById(reportId);

    if (!report) {
    return res.status(404).json({
        success: false,
        message: 'Reporte no encontrado.',
    });
    }

    // Verificar si el usuario es administrador
    const roles =
    req.user?.UserRoles?.map((ur) => ur.Role?.Name).filter(Boolean) ??
    (await getUserRoleNames(userId));

    const isAdmin = roles.includes(ADMIN_ROLE);

    if (!isAdmin && report.UserId !== userId) {
    return res.status(403).json({
        success: false,
        message: 'No tienes permiso para acceder a este reporte.',
    });
    }

    // Adjuntar el reporte al request para que el controlador no tenga que buscarlo de nuevo
    req.report = report;

    next();
} catch (error) {
    console.error('Error en validateReportOwner:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor.' });
}
};

