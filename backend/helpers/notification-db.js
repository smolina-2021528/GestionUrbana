import { ReportNotification } from '../src/reports/report-notification.model.js';
import { Report } from '../src/reports/report.model.js';

/**
 * Lista las notificaciones de un usuario.
 */
export const findNotificationsByUser = async (userId, options = {}) => {
    try {
        const { onlyUnread = false, limit = 10, offset = 0 } = options;

        const where = { UserId: userId };

        if (onlyUnread) {
            where.IsRead = false;
        }

        const notifications = await ReportNotification.findAndCountAll({
            where,
            include: [
                {
                    model: Report,
                    as: 'Report',
                    attributes: ['Id', 'Title'],
                },
            ],
            order: [['created_at', 'DESC']],
            limit,
            offset,
        });

        return notifications;
    } catch (error) {
        console.error('Error buscando notificaciones por usuario:', error);
        throw new Error('Error al buscar notificaciones');
    }
};

/**
 * Marca una notificación como leída verificando la pertenencia al usuario.
 */
export const markAsRead = async (notificationId, userId) => {
    try {
        // Verificar primero que la notificación pertenece al usuario
        const notification = await ReportNotification.findOne({
            where: { Id: notificationId, UserId: userId },
        });

        if (!notification) return null; // No existe o no pertenece al usuario

        if (notification.IsRead) return 'already_read'; // Ya estaba leída

        await notification.update({ IsRead: true });
        return 'updated';
    } catch (error) {
        console.error('Error marcando notificación como leída:', error);
        throw new Error('Error al actualizar la notificación');
    }
};

/**
 * Marca todas las notificaciones no leídas de un usuario como leídas.
 */
export const markAllAsRead = async (userId) => {
    try {
        const [affectedRows] = await ReportNotification.update(
            { IsRead: true },
            {
                where: {
                    UserId: userId,
                    IsRead: false,
                },
            }
        );

        return affectedRows;
    } catch (error) {
        console.error('Error marcando todas las notificaciones como leídas:', error);
        throw new Error('Error al actualizar las notificaciones');
    }
};

/**
 * Cuenta las notificaciones no leídas de un usuario.
 */
export const countUnread = async (userId) => {
    try {
        const count = await ReportNotification.count({
            where: {
                UserId: userId,
                IsRead: false,
            },
        });

        return count;
    } catch (error) {
        console.error('Error contando notificaciones no leídas:', error);
        throw new Error('Error al contar notificaciones');
    }
};

/**
 * Elimina una notificación verificando que pertenezca al usuario.
 */
export const deleteNotification = async (notificationId, userId) => {
    try {
        const deletedRows = await ReportNotification.destroy({
            where: {
                Id: notificationId,
                UserId: userId,
            },
        });

        return deletedRows > 0;
    } catch (error) {
        console.error('Error eliminando notificación:', error);
        throw new Error('Error al eliminar la notificación');
    }
};