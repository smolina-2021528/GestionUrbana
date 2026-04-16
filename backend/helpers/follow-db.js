import { UniqueConstraintError } from "sequelize";
import { ReportFollower } from "../src/reports/report-follower.model.js";
import { Report } from "../src/reports/report.model.js";

// ─── followReport ────────────────────────────────────────────────────────────
// Crea un registro en report_followers.
export const followReport = async (reportId, userId) => {
    try {
        await ReportFollower.create({ ReportId: reportId, UserId: userId });
        return { alreadyFollowing: false };
    } catch (error) {
        if (error instanceof UniqueConstraintError) {
        return { alreadyFollowing: true };
        }
    console.error("Error en followReport:", error);
    throw new Error("Error al seguir el reporte.");
    }
};

// ─── unfollowReport ──────────────────────────────────────────────────────────
// Elimina el registro de report_followers correspondiente al par (reportId, userId).
export const unfollowReport = async (reportId, userId) => {
    try {
        const deleted = await ReportFollower.destroy({
        where: { ReportId: reportId, UserId: userId },
    });

    return { wasFollowing: deleted > 0 };
    } catch (error) {
    console.error("Error en unfollowReport:", error);
    throw new Error("Error al dejar de seguir el reporte.");
    }
};

// ─── isFollowing ─────────────────────────────────────────────────────────────
// Retorna true si el usuario sigue el reporte, false si no.
export const isFollowing = async (reportId, userId) => {
    try {
        const record = await ReportFollower.findOne({
        where: { ReportId: reportId, UserId: userId },
    });

    return record !== null;
    } catch (error) {
        console.error("Error en isFollowing:", error);
        throw new Error("Error al verificar seguimiento del reporte.");
    }
};

// ─── getFollowerIds ───────────────────────────────────────────────────────────
// Retorna un array con los UserId de todos los seguidores de un reporte.
// Usado internamente por notification-service.js.
export const getFollowerIds = async (reportId) => {
    try {
        const followers = await ReportFollower.findAll({
        where: { ReportId: reportId },
        attributes: ["UserId"],
    });

    return followers.map((f) => f.UserId);
    } catch (error) {
        console.error("Error en getFollowerIds:", error);
        throw new Error("Error al obtener los seguidores del reporte.");
    }
};

// ─── getFollowedReports ───────────────────────────────────────────────────────
// Lista los reportes que sigue un usuario con paginación.
// Incluye los campos básicos del reporte, ordenados por created_at DESC.
export const getFollowedReports = async (userId, options = {}) => {
    try {
        const { limit = 10, offset = 0 } = options;

        const { count, rows } = await ReportFollower.findAndCountAll({
        where: { UserId: userId },
        include: [
        {
            model: Report,
            as: "Report",
            attributes: [
            "Id",
            "Title",
            "Category",
            "Priority",
            "Status",
            "CreatedAt",
            ],
        },
        ],
        order: [["created_at", "DESC"]],
        limit,
        offset,
    });

    return { count, rows };
    } catch (error) {
        console.error("Error en getFollowedReports:", error);
        throw new Error("Error al obtener los reportes seguidos.");
    }
};
