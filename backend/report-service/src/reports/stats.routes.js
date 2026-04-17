import { Router } from 'express';

import { validateJWT }   from '../../../auth-service/middlewares/validate-JWT.js';
import { validateAdmin } from '../../report-service/middlewares/validate-admin.js';
import {
    validateDateRangeQuery,
    validateZoneRankingQuery,
    validateExportQuery,
    validateHeatmapGridQuery,
} from '../../../auth-service/middlewares/validation.js';
import {
    getDashboard,
    getTrends,
    getZoneRanking,
    exportReports,
    getStatusTransitions,
    getHeatmapGrid,
} from './stats.controller.js';

const router = Router();

// GET /stats/dashboard
// Métricas agregadas del dashboard: totales, por estado, categoría y prioridad.
router.get(
    '/dashboard',
    validateJWT,
    validateAdmin,
    validateDateRangeQuery,
    getDashboard,
);

// GET /stats/trends
// Serie temporal de reportes creados y tiempos de resolución.
router.get(
    '/trends',
    validateJWT,
    validateAdmin,
    validateDateRangeQuery,
    getTrends,
);

// GET /stats/zones
// Ranking de zonas con mayor concentración de reportes (espacial + por dirección).
router.get(
    '/zones',
    validateJWT,
    validateAdmin,
    validateZoneRankingQuery,
    getZoneRanking,
);

// GET /stats/export
// Descarga de reportes filtrados en formato CSV o XLSX.
router.get(
    '/export',
    validateJWT,
    validateAdmin,
    validateExportQuery,
    exportReports,
);

// GET /stats/transitions
// Estadísticas de transiciones entre estados de los reportes.
router.get(
    '/transitions',
    validateJWT,
    validateAdmin,
    validateDateRangeQuery,
    getStatusTransitions,
);

// GET /stats/heatmap-grid
// Heatmap de reportes en celdas regulares.
// Parámetros: cellDegrees (0.001–0.1, default 0.009 ≈ 1km), category, priority, status, startDate, endDate
router.get(
    '/heatmap-grid',
    validateJWT,
    validateAdmin,
    validateHeatmapGridQuery,
    getHeatmapGrid,
);

export default router;