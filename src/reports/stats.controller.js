import { parseDateRange } from '../../helpers/date-helpers.js';
import { getDashboardMetrics } from '../../helpers/stats-db.js';
import { buildDashboardResponse } from '../../utils/stats-helpers.js';

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