// helpers/notification-service.js
import {
  ReportNotification,
  NOTIFICATION_TYPES,
} from "../src/reports/report-notification.model.js";

import { ReportFollower } from "../src/reports/report-follower.model.js";

/**
 * Recupera los IDs de todos los seguidores de un reporte.
 * Retorna un array vacío si la consulta falla, para no interrumpir el flujo.
 */
const getFollowerIds = async (reportId) => {
  try {
    const followers = await ReportFollower.findAll({
      where: { ReportId: reportId },
      attributes: ["UserId"],
    });
    return followers.map((f) => f.UserId);
  } catch (error) {
    console.error(
      "notification-service | Error obteniendo seguidores:",
      error.message,
    );
    return [];
  }
};

/**
 * Inserta un lote de notificaciones en una sola query.
 * Usa ignoreDuplicates para tolerar posibles colisiones sin lanzar error.
 */
const bulkInsert = async (records) => {
  if (!records.length) return;
  await ReportNotification.bulkCreate(records, { ignoreDuplicates: true });
};

export const notifyStatusChange = async (report, previousStatus, newStatus) => {
  try {
    const message = `Tu reporte '${report.Title}' cambió de estado: ${previousStatus} → ${newStatus}`;

    // destinatarios: dueño del reporte + seguidores (deduplicado)
    const recipientIds = new Set([report.UserId]);

    const followerIds = await getFollowerIds(report.Id);
    for (const id of followerIds) recipientIds.add(id);

    const records = [...recipientIds].map((userId) => ({
      UserId: userId,
      ReportId: report.Id,
      Type: NOTIFICATION_TYPES.STATUS_CHANGED,
      Message: message,
    }));

    await bulkInsert(records);
  } catch (error) {
    console.error(
      "notification-service | notifyStatusChange error:",
      error.message,
    );
  }
};

export const notifyNewComment = async (report, comment, authorId) => {
  try {
    // Si el autor es el dueño del reporte, no notificar
    if (authorId === report.UserId) return;

    // Comentario interno no genera notificación al ciudadano
    if (comment.IsInternal) return;

    await bulkInsert([
      {
        UserId: report.UserId,
        ReportId: report.Id,
        Type: NOTIFICATION_TYPES.NEW_COMMENT,
        Message: `Nuevo comentario en tu reporte '${report.Title}'`,
      },
    ]);
  } catch (error) {
    console.error(
      "notification-service | notifyNewComment error:",
      error.message,
    );
  }
};

/**
 * Notifica la asignación de un reporte a:
 *   - el personal municipal asignado
 *   - el ciudadano dueño del reporte
 *
 * Se deduplica por si assignedUserId == report.UserId (edge case).
 */
export const notifyReportAssigned = async (report, assignedUserId) => {
  try {
    const records = [
      {
        UserId: assignedUserId,
        ReportId: report.Id,
        Type: NOTIFICATION_TYPES.REPORT_ASSIGNED,
        Message: `Se te ha asignado el reporte '${report.Title}'`,
      },
      {
        UserId: report.UserId,
        ReportId: report.Id,
        Type: NOTIFICATION_TYPES.REPORT_ASSIGNED,
        Message: `Tu reporte '${report.Title}' ha sido asignado a personal municipal`,
      },
    ];

    const seen = new Set();
    const unique = records.filter(({ UserId }) => {
      if (seen.has(UserId)) return false;
      seen.add(UserId);
      return true;
    });

    await bulkInsert(unique);
  } catch (error) {
    console.error(
      "notification-service | notifyReportAssigned error:",
      error.message,
    );
  }
};
