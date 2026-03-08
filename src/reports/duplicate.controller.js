import { findReportById }          from '../../helpers/report-db.js';
import { buildReportGeoResponse }  from '../../utils/geo-helpers.js';
import {
    findSimilarReports,
    checkDraftForDuplicates,
    SIMILARITY_THRESHOLD,
    DUPLICATE_THRESHOLD,
} from '../../helpers/duplicate-service.js';

// ─── GET /reports/:reportId/similar ──────────────────────────────────────────
// Endpoint para obtener reportes similares a uno existente
export const getSimilarReports = async (req, res) => {
    try {
        const { reportId } = req.params;

        let limit     = parseInt(req.query.limit ?? 5, 10);
        let threshold = parseFloat(req.query.threshold ?? SIMILARITY_THRESHOLD);

        if (isNaN(limit)     || limit < 1)  limit     = 5;
        if (limit > 20) limit = 20;
        if (isNaN(threshold) || threshold < 0 || threshold > 1) threshold = SIMILARITY_THRESHOLD;

        // Verificar que el reporte existe
        const baseReport = await findReportById(reportId);
        if (!baseReport) {
            return res.status(404).json({
                success: false,
                message: `No se encontró ningún reporte con id "${reportId}".`,
            });
        }

        const results = await findSimilarReports(baseReport, { limit, threshold });

        return res.status(200).json({
            success: true,
            data: {
                baseReport: {
                    id:       baseReport.Id,
                    title:    baseReport.Title,
                    category: baseReport.Category,
                },
                similar: results.map(({ report, score, isDuplicate, distanceM }) => ({
                    ...buildReportGeoResponse(report),
                    similarity: {
                        score,
                        isDuplicate,
                        distanceM,
                        label: isDuplicate
                            ? 'Duplicado probable'
                            : score >= 0.60
                            ? 'Muy similar'
                            : 'Similar',
                    },
                })),
            },
            meta: {
                total:     results.length,
                threshold,
                duplicateThreshold: DUPLICATE_THRESHOLD,
            },
        });
    } catch (error) {
        console.error('Error en getSimilarReports:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al buscar reportes similares.',
        });
    }
};

// ─── POST /reports/check-duplicates ──────────────────────────────────────────
// Endpoint para verificar si un nuevo reporte (aún no guardado) podría ser un duplicado de uno existente.
export const checkDuplicates = async (req, res) => {
    try {
        const { title, description, category, latitude, longitude } = req.body;

        if (!title || !description || !category) {
            return res.status(400).json({
                success: false,
                message: 'Los campos title, description y category son obligatorios.',
            });
        }

        let limit     = parseInt(req.query.limit     ?? 3,                   10);
        let threshold = parseFloat(req.query.threshold ?? SIMILARITY_THRESHOLD);

        if (isNaN(limit)     || limit < 1)  limit     = 3;
        if (limit > 10) limit = 10;
        if (isNaN(threshold) || threshold < 0 || threshold > 1) threshold = SIMILARITY_THRESHOLD;

        const draft = {
            title,
            description,
            category,
            latitude:  latitude  != null ? parseFloat(latitude)  : null,
            longitude: longitude != null ? parseFloat(longitude) : null,
        };

        const { hasDuplicates, candidates } = await checkDraftForDuplicates(draft, {
            limit,
            threshold,
        });

        return res.status(200).json({
            success: true,
            data: {
                hasDuplicates,
                message: hasDuplicates
                    ? 'Se encontraron reportes que podrían ser duplicados. Revisa la lista antes de continuar.'
                    : 'No se encontraron reportes duplicados. Puedes continuar con la creación.',
                candidates: candidates.map(({ report, score, isDuplicate, distanceM }) => ({
                    ...buildReportGeoResponse(report),
                    similarity: {
                        score,
                        isDuplicate,
                        distanceM,
                        label: isDuplicate
                            ? 'Duplicado probable'
                            : score >= 0.60
                            ? 'Muy similar'
                            : 'Similar',
                    },
                })),
            },
            meta: {
                threshold,
                duplicateThreshold: DUPLICATE_THRESHOLD,
            },
        });
    } catch (error) {
        console.error('Error en checkDuplicates:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al verificar duplicados.',
        });
    }
};