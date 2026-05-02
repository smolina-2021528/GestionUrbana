import { Router } from 'express';

import { validateJWT }   from '../../middlewares/validate-JWT.js';
import { validateAdmin } from '../../middlewares/validate-admin.js';
import {
    validateDateRangeQuery,
    validateZoneRankingQuery,
    validateExportQuery,
    validateHeatmapGridQuery,
} from '../../middlewares/validation.js';
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
// MÃ©tricas agregadas del dashboard: totales, por estado, categorÃ­a y prioridad.
router.get(
    '/dashboard',
    validateJWT,
    validateAdmin,
    validateDateRangeQuery,
    getDashboard,
);

// GET /stats/trends
// Serie temporal de reportes creados y tiempos de resoluciÃ³n.
router.get(
    '/trends',
    validateJWT,
    validateAdmin,
    validateDateRangeQuery,
    getTrends,
);

// GET /stats/zones
// Ranking de zonas con mayor concentraciÃ³n de reportes (espacial + por direcciÃ³n).
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
// EstadÃ­sticas de transiciones entre estados de los reportes.
router.get(
    '/transitions',
    validateJWT,
    validateAdmin,
    validateDateRangeQuery,
    getStatusTransitions,
);

// GET /stats/heatmap-grid
// Heatmap de reportes en celdas regulares.
// ParÃ¡metros: cellDegrees (0.001â€“0.1, default 0.009 â‰ˆ 1km), category, priority, status, startDate, endDate
router.get(
    '/heatmap-grid',
    validateJWT,
    validateAdmin,
    validateHeatmapGridQuery,
    getHeatmapGrid,
);

export default router;
