import { Report } from '../src/reports/report.model.js';
import { ReportImage } from '../src/reports/report-image.model.js';
import { ReportStatusHistory } from '../src/reports/report-status-history.model.js';
import { User } from '../src/users/user.model.js';

// Incluye todas las asociaciones para cargar un reporte completo
const getReportIncludes = () => [
    {
        model: ReportImage,
        as: 'Images',
    },
    {
        model: User,
        as: 'Citizen',
        attributes: ['Id', 'Username', 'Name'],
    },
    {
        model: User,
        as: 'AssignedMunicipal',
        attributes: ['Id', 'Username', 'Name'],
    },
    {
        model: ReportStatusHistory,
        as: 'StatusHistory',
        include: [
            {
                model: User,
                as: 'ChangedByUser',
                attributes: ['Id', 'Username', 'Name'],
            },
        ],
    },
];

// Busca un reporte por su ID primario con todos los includes
export const findReportById = async (reportId) => {
    try {
        const report = await Report.findByPk(reportId, {
            include: getReportIncludes(),
            order: [[{ model: ReportImage, as: 'Images' }, 'order', 'ASC']],
        });
        return report;
    } catch (error) {
        console.error('Error buscando reporte por ID:', error);
        throw new Error('Error al buscar reporte');
    }
};

// Lista los reportes de un usuario con paginación
export const findReportsByUser = async (userId, options = {}) => {
    try {
        const { limit = 10, offset = 0 } = options;
        const reports = await Report.findAndCountAll({
            where: { UserId: userId },
            include: getReportIncludes(),
            order: [
                ['created_at', 'DESC'],
                [{ model: ReportImage, as: 'Images' }, 'order', 'ASC'],
            ],
            limit,
            offset,
        });
        return reports;
    } catch (error) {
        console.error('Error buscando reportes del usuario:', error);
        throw new Error('Error al buscar reportes del usuario');
    }
};

// Lista reportes con filtros opcionales y paginación
export const findAllReports = async (filters = {}, options = {}) => {
    try {
        const { category, priority, status } = filters;
        const { limit = 10, offset = 0 } = options;

        const where = {};
        if (category) where.Category = category;
        if (priority) where.Priority = priority;
        if (status) where.Status = status;

        const reports = await Report.findAndCountAll({
            where,
            include: getReportIncludes(),
            order: [
                ['created_at', 'DESC'],
                [{ model: ReportImage, as: 'Images' }, 'order', 'ASC'],
            ],
            limit,
            offset,
        });
        return reports;
    } catch (error) {
        console.error('Error buscando reportes:', error);
        throw new Error('Error al buscar reportes');
    }
};

// Crea el registro del reporte (sin imágenes, se manejan por separado)
export const createReport = async (data, transaction) => {
    try {
        const report = await Report.create(data, { transaction });
        return report;
    } catch (error) {
        console.error('Error creando reporte:', error);
        throw new Error('Error al crear reporte');
    }
};

// Actualiza el estado del reporte y registra el cambio en el historial
export const updateReportStatus = async (reportId, newStatus, changedBy, notes, transaction) => {
    try {
        const report = await Report.findByPk(reportId, { transaction });
        if (!report) throw new Error('Reporte no encontrado');

        const previousStatus = report.Status;

        const updateData = { Status: newStatus };
        if (newStatus === 'RESUELTO') {
            updateData.ResolvedAt = new Date();
        }

        await Report.update(updateData, {
            where: { Id: reportId },
            transaction,
        });

        await ReportStatusHistory.create(
            {
                ReportId: reportId,
                PreviousStatus: previousStatus,
                NewStatus: newStatus,
                ChangedBy: changedBy,
                Notes: notes ?? null,
            },
            { transaction }
        );

        return await findReportById(reportId);
    } catch (error) {
        console.error('Error actualizando estado del reporte:', error);
        throw new Error('Error al actualizar estado del reporte');
    }
};

// Elimina un reporte (hard delete). Retorna las imágenes antes de eliminar
// para que el controlador pueda borrarlas de Cloudinary
export const deleteReport = async (reportId, transaction) => {
    try {
        const report = await Report.findByPk(reportId, {
            include: [{ model: ReportImage, as: 'Images' }],
            transaction,
        });
        if (!report) throw new Error('Reporte no encontrado');

        const images = report.Images ?? [];

        await report.destroy({ transaction });

        return images;
    } catch (error) {
        console.error('Error eliminando reporte:', error);
        throw new Error('Error al eliminar reporte');
    }
};
