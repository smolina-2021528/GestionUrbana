import { findReportById } from "../../helpers/report-db.js";
import {
    createComment as createCommentDB,
    findCommentsByReport,
} from "../../helpers/comment-db.js";
import { findCommentById } from "../../helpers/comment-db.js";
import { notifyNewComment } from "../../helpers/notification-service.js";
import { buildCommentResponse } from "../../utils/comment-helpers.js";
import { deleteComment as deleteCommentDB } from "../../helpers/comment-db.js";
import { findReportById } from "../../helpers/report-db.js"; // ya existe
import {
    findNotificationsByUser,
    markAsRead,
    markAllAsRead,
    countUnread,
    deleteNotification as deleteNotificationDB,
} from "../../helpers/notification-db.js";
import { buildNotificationResponse } from "../../utils/notification-helpers.js";
import {
    followReport as followReportDB,
    unfollowReport as unfollowReportDB,
    getFollowedReports as getFollowedReportsDB,
} from "../../helpers/follow-db.js";
import {
    createComment as createCommentDB,
    findCommentsByReport,
    findCommentById,
    deleteComment as deleteCommentDB,
} from "../../helpers/comment-db.js";
import { notifyStatusChange, notifyReportAssigned } from '../../helpers/notification-service.js';

// POST /api/reports/:reportId/comments
export const createComment = async (req, res) => {
    try {
    const { reportId } = req.params;
    const { content } = req.body;
    let { isInternal = false } = req.body;

    // Verificar que el reporte existe
    const report = await findReportById(reportId);
    if (!report) {
        return res.status(404).json({
        success: false,
        message: "Reporte no encontrado.",
        });
    }

    // Regla de negocio: solo admins pueden crear comentarios internos
    if (isInternal && req.userRole !== "ADMIN_ROLE") {
        isInternal = false;
    }

    const comment = await createCommentDB({
        ReportId: reportId,
        UserId: req.userId,
        Content: content,
        IsInternal: isInternal,
    });

    // Cargar el comentario con su autor para la respuesta
    const fullComment = await findCommentById(comment.Id);

    // Notificar de forma no bloqueante
    setImmediate(() => {
        notifyNewComment(report, fullComment, req.userId).catch((err) =>
        console.error("Error en notifyNewComment:", err),
        );
    });

    return res.status(201).json({
        success: true,
        message: "Comentario creado exitosamente.",
        data: buildCommentResponse(fullComment),
    });
    } catch (error) {
    console.error("Error en createComment:", error);
    return res.status(500).json({
        success: false,
        message: "Error al crear el comentario.",
    });
    }
};

// GET /api/reports/:reportId/comments
export const getCommentsByReport = async (req, res) => {
    try {
    const { reportId } = req.params;

    // Verificar que el reporte existe
    const report = await findReportById(reportId);
    if (!report) {
        return res.status(404).json({
        success: false,
        message: "Reporte no encontrado.",
        });
    }

    let { page = 1, limit = 10, includeInternal = "false" } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1) limit = 10;
    if (limit > 50) limit = 50;

    const offset = (page - 1) * limit;

    // Solo los admins pueden ver comentarios internos
    const canSeeInternal =
        req.userRole === "ADMIN_ROLE" && includeInternal === "true";

    const { count, rows } = await findCommentsByReport(reportId, {
        includeInternal: canSeeInternal,
        limit,
        offset,
    });

    const comments = rows.map((comment) => buildCommentResponse(comment));
    const totalPages = Math.ceil(count / limit);

    return res.status(200).json({
        success: true,
        data: comments,
        pagination: {
        total: count,
        page,
        limit,
        totalPages,
        },
    });
    } catch (error) {
    console.error("Error en getCommentsByReport:", error);
    return res.status(500).json({
        success: false,
        message: "Error al obtener los comentarios.",
    });
    }
};

// DELETE /api/reports/:reportId/comments/:commentId
export const deleteComment = async (req, res) => {
    try {
        const { commentId } = req.params;

        const comment = await findCommentById(commentId);
        if (!comment) {
            return res.status(404).json({
                success: false,
                message: "Comentario no encontrado.",
            });
        }

        const isAuthor = comment.UserId === req.userId;
        const isAdmin  = req.userRole === "ADMIN_ROLE";

        if (!isAuthor && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: "No tienes permiso para eliminar este comentario.",
            });
        }

        await deleteCommentDB(commentId);

        return res.status(200).json({
            success: true,
            message: "Comentario eliminado exitosamente.",
        });
    } catch (error) {
        console.error("Error en deleteComment:", error);
        return res.status(500).json({
            success: false,
            message: "Error al eliminar el comentario.",
        });
    }
};

// POST /api/reports/:reportId/follow
export const followReport = async (req, res) => {
    try {
        const { reportId } = req.params;

        const report = await findReportById(reportId);
        if (!report) {
            return res.status(404).json({
                success: false,
                message: "Reporte no encontrado.",
            });
        }

        const { alreadyFollowing } = await followReportDB(reportId, req.userId);
        if (alreadyFollowing) {
            return res.status(409).json({
                success: false,
                message: "Ya estás siguiendo este reporte.",
            });
        }

        return res.status(201).json({
            success: true,
            message: "Ahora sigues este reporte.",
        });
    } catch (error) {
        console.error("Error en followReport:", error);
        return res.status(500).json({
            success: false,
            message: "Error al seguir el reporte.",
        });
    }
};

// DELETE /api/reports/:reportId/follow
export const unfollowReport = async (req, res) => {
    try {
        const { reportId } = req.params;

        const { wasFollowing } = await unfollowReportDB(reportId, req.userId);
        if (!wasFollowing) {
            return res.status(404).json({
                success: false,
                message: "No estabas siguiendo este reporte.",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Has dejado de seguir este reporte.",
        });
    } catch (error) {
        console.error("Error en unfollowReport:", error);
        return res.status(500).json({
            success: false,
            message: "Error al dejar de seguir el reporte.",
        });
    }
};

// GET /api/reports/followed
export const getFollowedReports = async (req, res) => {
    try {
        let { page = 1, limit = 10 } = req.query;

        page  = parseInt(page);
        limit = parseInt(limit);

        if (isNaN(page)  || page  < 1) page  = 1;
        if (isNaN(limit) || limit < 1) limit = 10;
        if (limit > 50) limit = 50;

        const offset = (page - 1) * limit;

        const { count, rows } = await getFollowedReportsDB(req.userId, { limit, offset });

        const totalPages = Math.ceil(count / limit);

        return res.status(200).json({
            success: true,
            data: rows.map((r) => r.Report),
            pagination: {
                total: count,
                page,
                limit,
                totalPages,
            },
        });
    } catch (error) {
        console.error("Error en getFollowedReports:", error);
        return res.status(500).json({
            success: false,
            message: "Error al obtener los reportes seguidos.",
        });
    }
};



// GET /api/notifications
export const getMyNotifications = async (req, res) => {
    try {
        let { page = 1, limit = 10, onlyUnread = "false" } = req.query;

        page  = parseInt(page);
        limit = parseInt(limit);

        if (isNaN(page)  || page  < 1) page  = 1;
        if (isNaN(limit) || limit < 1) limit = 10;
        if (limit > 50) limit = 50;

        const offset      = (page - 1) * limit;
        const onlyUnreadB = onlyUnread === "true";

        const [{ count, rows }, unreadCount] = await Promise.all([
            findNotificationsByUser(req.userId, { onlyUnread: onlyUnreadB, limit, offset }),
            countUnread(req.userId),
        ]);

        return res.status(200).json({
            success: true,
            data: rows.map(buildNotificationResponse),
            unreadCount,
            pagination: {
                total: count,
                page,
                limit,
                totalPages: Math.ceil(count / limit),
            },
        });
    } catch (error) {
        console.error("Error en getMyNotifications:", error);
        return res.status(500).json({
            success: false,
            message: "Error al obtener las notificaciones.",
        });
    }
};

// PATCH /api/notifications/:notificationId/read
export const markNotificationAsRead = async (req, res) => {
    try {
        const { notificationId } = req.params;

        const updated = await markAsRead(notificationId, req.userId);
        if (!updated) {
            return res.status(404).json({
                success: false,
                message: "Notificación no encontrada.",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Notificación marcada como leída.",
        });
    } catch (error) {
        console.error("Error en markNotificationAsRead:", error);
        return res.status(500).json({
            success: false,
            message: "Error al marcar la notificación como leída.",
        });
    }
};

// PATCH /api/notifications/read-all
export const markAllNotificationsAsRead = async (req, res) => {
    try {
        await markAllAsRead(req.userId);

        return res.status(200).json({
            success: true,
            message: "Todas las notificaciones han sido marcadas como leídas.",
        });
    } catch (error) {
        console.error("Error en markAllNotificationsAsRead:", error);
        return res.status(500).json({
            success: false,
            message: "Error al marcar las notificaciones como leídas.",
        });
    }
};

// DELETE /api/notifications/:notificationId
export const deleteNotification = async (req, res) => {
    try {
        const { notificationId } = req.params;

        const deleted = await deleteNotificationDB(notificationId, req.userId);
        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: "Notificación no encontrada.",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Notificación eliminada exitosamente.",
        });
    } catch (error) {
        console.error("Error en deleteNotification:", error);
        return res.status(500).json({
            success: false,
            message: "Error al eliminar la notificación.",
        });
    }
};

