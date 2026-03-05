import { parseDateRange }                            from '../../helpers/date-helpers.js';
import { getDashboardMetrics, getReportTrends, getResolutionTimeSeries } from '../../helpers/stats-db.js';
import { buildDashboardResponse, buildTrendsResponse } from '../../utils/stats-helpers.js';
import { GROUPBY_OPTIONS }                           from '../../helpers/stats-constants.js';
import { getReportTrends, getResolutionTimeSeries } from '../../helpers/stats-db.js';
import { buildTrendsResponse } from '../../utils/stats-helpers.js';
import { GROUPBY_OPTIONS } from '../../helpers/stats-constants.js';
import { getZoneRanking as getZoneRankingDB, getTopZonesByAddress } from '../../helpers/zone-db.js';
import { buildZoneRankingResponse }                                  from '../../utils/stats-helpers.js';
import { ZONE_RADIUS_OPTIONS }                                       from '../../helpers/stats-constants.js';

// GET /stats/dashboard
export const getDashboard = async (req, res) => {
    try {
        // 1. Extraer y parsear el rango de fechas y filtros del query
        const { startDate, endDate } = parseDateRange(req.query);
        const { category, priority } = req.query;

        // 2. Obtener métricas crudas de la BD
        const metrics = await getDashboardMetrics({ startDate, endDate, category, priority });

        // 3. Retornar 200 con el DTO formateado e incluir el rango efectivo usado
        return res.status(200).json({
            success: true,
            filters: {
                startDate: startDate ? startDate.toISOString() : null,
                endDate:   endDate   ? endDate.toISOString()   : null,
                category:  category  ?? null,
                priority:  priority  ?? null,
            },
            data: buildDashboardResponse(metrics),
        });
    } catch (error) {
        console.error('Error en getDashboard:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al obtener las métricas del dashboard.',
        });
    }
};

// GET /stats/trends
export const getTrends = async (req, res) => {
    try {
        // 1. Extraer filtros del query
        const { groupBy = 'day', category, status } = req.query;

        // 2. Parsear fechas — si no vienen, parseDateRange retorna null y
        //    getReportTrends aplica el default de últimos 30 días internamente
        const { startDate, endDate } = parseDateRange(req.query);

        // 3. Validar groupBy contra la whitelist
        const safeGroupBy = GROUPBY_OPTIONS.includes(groupBy) ? groupBy : 'day';

        // 4. Llamar trends y resolution en paralelo
        const [trendsRows, resolutionRows] = await Promise.all([
            getReportTrends({ startDate, endDate, groupBy: safeGroupBy, category, status }),
            getResolutionTimeSeries({ startDate, endDate, groupBy: safeGroupBy, category }),
        ]);

        // 5. Retornar 200 con buildTrendsResponse
        return res.status(200).json({
            success: true,
            filters: {
                startDate: startDate ? startDate.toISOString() : null,
                endDate:   endDate   ? endDate.toISOString()   : null,
                groupBy:   safeGroupBy,
                category:  category  ?? null,
                status:    status    ?? null,
            },
            data: {
                trends:     buildTrendsResponse(trendsRows, safeGroupBy, { startDate, endDate }),
                resolution: resolutionRows,
            },
        });
    } catch (error) {
        console.error('Error en getTrends:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al obtener las tendencias.',
        });
    }
};

// GET /stats/zones
export const getZoneRanking = async (req, res) => {
    try {
        // 1. Extraer filtros del query
        const { category, status } = req.query;

        // 2. Parsear y validar radius
        const parsedRadius = parseInt(req.query.radius, 10);
        const safeRadius = ZONE_RADIUS_OPTIONS.includes(parsedRadius) ? parsedRadius : 1000;

        // 3. Parsear y validar limit
        const parsedLimit = parseInt(req.query.limit, 10);
        const safeLimit = (!isNaN(parsedLimit) && parsedLimit >= 1)
            ? Math.min(parsedLimit, 20)
            : 10;

        // 4. Llamar ambas queries en paralelo
        const [spatialZones, addressZones] = await Promise.all([
            getZoneRankingDB({ radius: safeRadius, limit: safeLimit, category, status }),
            getTopZonesByAddress({ limit: safeLimit, category, status }),
        ]);

        // 5. Retornar 200 con buildZoneRankingResponse para cada resultado
        return res.status(200).json({
            success: true,
            filters: {
                radius:   safeRadius,
                limit:    safeLimit,
                category: category ?? null,
                status:   status   ?? null,
            },
            data: {
                spatial: buildZoneRankingResponse(spatialZones),
                byAddress: buildZoneRankingResponse(addressZones),
            },
        });
    } catch (error) {
        console.error('Error en getZoneRanking:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al obtener el ranking de zonas.',
        });
    }
};