import { getReportImageUrl } from '../helpers/cloudinary-service.js';
import { PRIORITY_COLORS } from '../helpers/report-constants.js';

// Construye la respuesta normalizada de un reporte (DTO de salida).
export const buildReportResponse = (report) => {
    return {
        id: report.Id,
        title: report.Title,
        description: report.Description,
        category: report.Category,
        priority: report.Priority,
        status: report.Status,
        priorityColor: PRIORITY_COLORS[report.Priority],
        images: report.Images?.map((img) => ({
            id: img.Id,
            url: getReportImageUrl(img.ImageUrl),
            order: img.Order,
        })) ?? [],
        citizen: report.Citizen
            ? {
                id: report.Citizen.Id,
                username: report.Citizen.Username,
                name: report.Citizen.Name,
            }
            : null,
        assignedTo: report.AssignedMunicipal
            ? {
                id: report.AssignedMunicipal.Id,
                username: report.AssignedMunicipal.Username,
                name: report.AssignedMunicipal.Name,
            }
            : null,
        resolvedAt: report.ResolvedAt,

        // ── Metadatos del análisis IA ────────────────────────────────────────
        // Solo se incluyen cuando AiStatus no es null (reporte creado por flujo IA).
        ai: report.AiStatus !== null && report.AiStatus !== undefined
            ? {
                status: report.AiStatus,
                category: report.AiCategory ?? null,
                priority: report.AiPriority ?? null,
                confidence: report.AiConfidence ?? null,
                reasoning: report.AiReasoning ?? null,
                processedAt: report.AiProcessedAt ?? null,
            }
            : null,

        createdAt: report.CreatedAt,
        updatedAt: report.UpdatedAt,
    };
};