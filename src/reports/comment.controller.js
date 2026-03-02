import { findReportById } from "../../helpers/report-db.js";
import {
    createComment as createCommentDB,
    findCommentsByReport,
} from "../../helpers/comment-db.js";
import { findCommentById } from "../../helpers/comment-db.js";
import { notifyNewComment } from "../../helpers/notification-service.js";
import { buildCommentResponse } from "../../utils/comment-helpers.js";

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
