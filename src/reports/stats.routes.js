import { Router } from 'express';

import { validateJWT }   from '../../middlewares/validate-JWT.js';
import { validateAdmin } from '../../middlewares/validate-admin.js';
import {
    validateDateRangeQuery,
    validateZoneRankingQuery,
    validateExportQuery,
} from '../../middlewares/validation.js';
import {
    getDashboard,
    getTrends,
    getZoneRanking,
    exportReports,
    getStatusTransitions,
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

export default router;