import { Op } from 'sequelize';
import { sequelize } from '../configs/db.js';
import { Report } from '../src/reports/report.model.js';
import { ReportImage } from '../src/reports/report-image.model.js';
import { ReportStatusHistory } from '../src/reports/report-status-history.model.js';
import { User } from '../src/users/user-ref.model.js';
import { buildGeoPoint } from '../utils/geo-helpers.js';
import { buildDateWhereClause } from './date-helpers.js';


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

export const findReportByClientRequestId = async (userId, clientRequestId) => {
    try {
        if (!userId || !clientRequestId) {
            return null;
        }

        const report = await Report.findOne({
            where: {
                UserId: userId,
                ClientRequestId: clientRequestId,
            },
            include: getReportIncludes(),
            order: [[{ model: ReportImage, as: 'Images' }, 'order', 'ASC']],
        });

        return report;
    } catch (error) {
        console.error('Error buscando reporte por clientRequestId:', error);
        throw new Error('Error al buscar reporte por identificador de solicitud');
    }
};

// Lista los reportes de un usuario con paginación
export const findReportsByUser = async (userId, options = {}) => {
    try {
        const { limit = 10, offset = 0, startDate, endDate, q } = options;

        const where = { UserId: userId };
        Object.assign(where, buildDateWhereClause(startDate, endDate));

        if (q) {
            where[Op.or] = [
                { Title:       { [Op.iLike]: `%${q}%` } },
                { Description: { [Op.iLike]: `%${q}%` } },
            ];
        }

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
        console.error('Error buscando reportes del usuario:', error);
        throw new Error('Error al buscar reportes del usuario');
    }
};

// Lista reportes con filtros opcionales, paginación y ordenamiento
export const findAllReports = async (filters = {}, options = {}) => {
    try {
        const { category, priority, status, startDate, endDate } = filters;
        const { limit = 10, offset = 0, sortBy = 'date', sortOrder = 'DESC' } = options;

        const where = {};
        if (category) where.Category = category;
        if (priority) where.Priority = priority;
        if (status)   where.Status   = status;
        Object.assign(where, buildDateWhereClause(startDate, endDate));

        const primaryOrder =
            sortBy === 'priority'
                ? ['priority', sortOrder]
                : ['created_at', sortOrder];

        const reports = await Report.findAndCountAll({
            where,
            include: getReportIncludes(),
            order: [
                primaryOrder,
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


// Busca reportes por texto en Title o Description (case-insensitive)
export const searchReportsByText = async (query, options = {}) => {
    try {
        const { limit = 10, offset = 0, startDate, endDate } = options;

        const where = {
            [Op.or]: [
                { Title:       { [Op.iLike]: `%${query}%` } },
                { Description: { [Op.iLike]: `%${query}%` } },
            ],
        };
        Object.assign(where, buildDateWhereClause(startDate, endDate));

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
        console.error('Error buscando reportes por texto:', error);
        throw new Error('Error al buscar reportes por texto');
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

export const findReportsByProximity = async (latitude, longitude, radiusMeters, options = {}) => {
    try {
        const { limit = 10, offset = 0, status, category } = options;

        const refPoint = sequelize.fn(
            'ST_SetSRID',
            sequelize.fn('ST_MakePoint', longitude, latitude),
            4326
        );

        const refPointGeog = sequelize.fn(
            'ST_GeogFromWKB',
            sequelize.cast(refPoint, 'geometry')
        );

        const locationGeog = sequelize.fn(
            'ST_GeogFromWKB',
            sequelize.cast(sequelize.col('Location'), 'geometry')
        );

        const where = {
            Location: { [Op.ne]: null },
            [Op.and]: [
                sequelize.where(
                    sequelize.fn('ST_DWithin', locationGeog, refPointGeog, radiusMeters),
                    true
                ),
            ],
        };

        if (status) where.Status = status;
        if (category) where.Category = category;

        const reports = await Report.findAndCountAll({
            where,
            include: getReportIncludes(),
            order: [
                [
                    sequelize.fn('ST_Distance', locationGeog, refPointGeog),
                    'ASC',
                ],
                [{ model: ReportImage, as: 'Images' }, 'order', 'ASC'],
            ],
            limit,
            offset,
        });

        return reports;
    } catch (error) {
        console.error('Error buscando reportes por proximidad:', error);
        throw new Error('Error al buscar reportes por proximidad');
    }
};

export const getHeatmapData = async (filters = {}) => {
    try {
        const { category, priority, status, startDate, endDate } = filters;

        const where = {
            Latitude: { [Op.not]: null },
        };

        if (category) where.Category = category;
        if (priority) where.Priority = priority;
        if (status)   where.Status   = status;

        if (startDate || endDate) {
            where.CreatedAt = {};
            if (startDate) where.CreatedAt[Op.gte] = new Date(startDate);
            if (endDate)   where.CreatedAt[Op.lte] = new Date(endDate);
        }

        const reports = await Report.findAll({
            where,
            attributes: ['Id', 'Latitude', 'Longitude', 'Category', 'Priority', 'Status', 'CreatedAt'],
        });

        return reports;
    } catch (error) {
        console.error('Error obteniendo datos para mapa de calor:', error);
        throw new Error('Error al obtener datos para mapa de calor');
    }
};

export const findReportsByBoundingBox = async (swLat, swLng, neLat, neLng, options = {}) => {
    try {
        const { limit = 200, status, category } = options;

        const where = {
            Latitude:  { [Op.between]: [swLat, neLat] },
            Longitude: { [Op.between]: [swLng, neLng] },
            Location:  { [Op.not]: null },
        };

        if (status)   where.Status   = status;
        if (category) where.Category = category;

        const reports = await Report.findAll({
            where,
            attributes: [
                'Id', 'Title', 'Category', 'Priority', 'Status',
                'Latitude', 'Longitude', 'Address', 'CreatedAt',
            ],
            order: [['created_at', 'DESC']],
            limit,
        });

        return reports;
    } catch (error) {
        console.error('Error buscando reportes por bounding box:', error);
        throw new Error('Error al buscar reportes por área');
    }
};

export const buildLocationData = (latitude, longitude, address) => {
    const hasCoords = latitude != null && longitude != null;

    if (!hasCoords) return {};

    const data = {
        Latitude:  latitude,
        Longitude: longitude,
        Location:  buildGeoPoint(latitude, longitude),
    };

    if (address) data.Address = address;

    return data;
};


