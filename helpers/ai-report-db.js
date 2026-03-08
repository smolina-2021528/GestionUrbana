import { Report } from '../src/reports/report.model.js';
import { ReportImage } from '../src/reports/report-image.model.js';
import { ReportStatusHistory } from '../src/reports/report-status-history.model.js';
import { buildLocationData } from './report-db.js';
import { DEFAULT_STATUS } from './report-constants.js';

// Crea un reporte generado por IA dentro de una transacción existente.
export const createAiReport = async (aiData, userId, transaction) => {
    const {
        title,
        description,
        category,
        priority,
        latitude,
        longitude,
        address,
        imageUrl,
        imagePublicId,
        aiRaw = null,
    } = aiData;

    // Campos de geolocalización 
    const locationData = buildLocationData(latitude, longitude, address);

    // Crear el reporte
    const report = await Report.create(
        {
            Title: title,
            Description: description,
            Category: category,
            Priority: priority,
            Status: DEFAULT_STATUS,
            UserId: userId,

            AiStatus: 'OK',
            AiCategory: category,
            AiPriority: priority,
            AiProcessedAt: new Date(),
            AiRaw: aiRaw,

            ...locationData,
        },
        { transaction }
    );

    // Crear la imagen asociada si se dio
    if (imageUrl && imagePublicId) {
        await ReportImage.create(
            {
                ReportId: report.Id,
                ImageUrl: imageUrl,
                PublicId: imagePublicId,
                Order: 0,
            },
            { transaction }
        );
    }

    // Registrar el estado inicial en el historial
    await ReportStatusHistory.create(
        {
            ReportId: report.Id,
            PreviousStatus: null,
            NewStatus: DEFAULT_STATUS,
            ChangedBy: userId,
        },
        { transaction }
    );

    // Retornar solo el Id para que el controlador haga el findReportById completo 
    return report.Id;
};

export const markReportAIPending = async (reportId) => {
    const [affectedRows] = await Report.update(
        {
            AiStatus:      'PENDING',
            AiCategory:    null,
            AiPriority:    null,
            AiConfidence:  null,
            AiReasoning:   null,
            AiProcessedAt: null,
            AiRaw:         null,
        },
        { where: { Id: reportId } }
    );

    return affectedRows > 0;
};