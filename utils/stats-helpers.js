import { getDateRangeLabel } from '../helpers/date-helpers.js';

// ─── buildDashboardResponse ───────────────────────────────────────────────────
export const buildDashboardResponse = (metrics) => {
    const { overview, byStatus, byCategory, byPriority, location, engagement } = metrics;

    return {
        overview: {
            total: parseInt(overview.total, 10),
            resolutionRate: parseFloat(overview.resolutionRate ?? 0),
            avgResolutionHours: overview.avgResolutionHours !== null && overview.avgResolutionHours !== undefined
                ? parseFloat(overview.avgResolutionHours)
                : null,
        },
        byStatus: {
            pendiente: parseInt(byStatus.PENDIENTE, 10),
            enProceso: parseInt(byStatus.EN_PROCESO, 10),
            resuelto: parseInt(byStatus.RESUELTO, 10),
            rechazado: parseInt(byStatus.RECHAZADO, 10),
        },
        byCategory: {
            infraestructura: parseInt(byCategory.INFRAESTRUCTURA, 10),
            seguridad: parseInt(byCategory.SEGURIDAD, 10),
            limpieza: parseInt(byCategory.LIMPIEZA, 10),
        },
        byPriority: {
            alta: parseInt(byPriority.ALTA, 10),
            media: parseInt(byPriority.MEDIA, 10),
            baja: parseInt(byPriority.BAJA, 10),
        },
        location: {
            withLocation: parseInt(location.withLocation, 10),
            withoutLocation: parseInt(location.withoutLocation, 10),
            coveragePercent: parseFloat(location.coveragePercent ?? 0),
        },
        engagement: {
            totalPublicComments: parseInt(engagement.totalPublicComments, 10),
            totalActiveFollowers: parseInt(engagement.totalActiveFollowers, 10),
        },
    };
};

// ─── buildTrendsResponse ──────────────────────────────────────────────────────

const PERIOD_STEP_MS = {
    day: 1000 * 60 * 60 * 24,
    week: 1000 * 60 * 60 * 24 * 7,
    month: null,
};

const advancePeriod = (date, groupBy) => {
    if (groupBy === 'month') {
        const next = new Date(date);
        next.setMonth(next.getMonth() + 1);
        return next;
    }
    return new Date(date.getTime() + PERIOD_STEP_MS[groupBy]);
};

const truncToPeriod = (date, groupBy) => {
    const d = new Date(date);
    if (groupBy === 'day') {
        d.setUTCHours(0, 0, 0, 0);
    } else if (groupBy === 'week') {
        // ISO week: lunes como primer día
        const day = d.getUTCDay(); // 0 = domingo
        const diff = (day === 0 ? -6 : 1 - day);
        d.setUTCDate(d.getUTCDate() + diff);
        d.setUTCHours(0, 0, 0, 0);
    } else if (groupBy === 'month') {
        d.setUTCDate(1);
        d.setUTCHours(0, 0, 0, 0);
    }
    return d;
};

export const buildTrendsResponse = (rows, groupBy = 'day', range = {}) => {
    const validGroupBy = ['day', 'week', 'month'];
    const safeGroupBy = validGroupBy.includes(groupBy) ? groupBy : 'day';

    // Construir un mapa de período ISO → total a partir de las filas reales
    const dataMap = new Map();
    for (const row of rows) {
        const key = new Date(row.period).toISOString();
        dataMap.set(key, parseInt(row.total, 10));
    }

    // Si no se proporcionan fechas de rango, devolver solo las filas recibidas
    if (!range.startDate && !range.endDate) {
        return rows.map((row) => ({
            period: new Date(row.period).toISOString(),
            total: parseInt(row.total, 10),
        }));
    }

    // Rellenar períodos faltantes dentro del rango ────────────────────────────
    const result = [];
    let current = truncToPeriod(new Date(range.startDate), safeGroupBy);
    const end = range.endDate ? new Date(range.endDate) : new Date();

    while (current <= end) {
        const key = current.toISOString();
        result.push({
            period: key,
            total: dataMap.has(key) ? dataMap.get(key) : 0,
        });
        current = advancePeriod(current, safeGroupBy);
    }

    return result;
};

// ─── buildZoneRankingResponse ─────────────────────────────────────────────────

export const buildZoneRankingResponse = (rows) => {
    return rows.map((row, index) => {
        const base = {
            rank: index + 1,
            reportCount: parseInt(row.reportCount, 10),
            dominantCategory: row.dominantCategory ?? null,
            dominantPriority: row.dominantPriority ?? null,
        };

        // Zona con coordenadas (getZoneRanking) ──────────────────────────────────
        if (row.centerLat !== undefined || row.centerLng !== undefined) {
            return {
                ...base,
                clusterId: row.clusterId ?? null,
                center: (row.centerLat !== null && row.centerLng !== null)
                    ? {
                        latitude: parseFloat(row.centerLat),
                        longitude: parseFloat(row.centerLng),
                    }
                    : null,
            };
        }

        // Zona por dirección (getTopZonesByAddress) ───────────────────────────────
        return {
            ...base,
            zone: row.zone ?? null,
        };
    });
};

// ─── buildExportFilename ──────────────────────────────────────────────────────
export const buildExportFilename = (format, filters = {}) => {
    const { startDate, endDate } = filters;

    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    const dateLabel = getDateRangeLabel(start, end);
    const safeFormat = typeof format === 'string' && format.length > 0
        ? format.toLowerCase()
        : 'xlsx';

    return `reportes_gestion_urbana_${dateLabel}.${safeFormat}`;
};