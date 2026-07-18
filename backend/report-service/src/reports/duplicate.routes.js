import { Router } from 'express';
import { validateJWT }         from '../../middlewares/validate-JWT.js';
import { validateCheckDuplicates } from '../../middlewares/validation.js';
import {
    getSimilarReports,
    checkDuplicates,
} from './duplicate.controller.js';

const router = Router();

// POST /reports/check-duplicates
// Verifica si un borrador de reporte probablemente ya existe.
// No requiere rol de admin — cualquier usuario autenticado puede consultarlo.
router.post(
    '/check-duplicates',
    validateJWT,
    validateCheckDuplicates,
    checkDuplicates,
);

// GET /reports/:reportId/similar
// Retorna los reportes más similares a uno existente.
router.get(
    '/:reportId/similar',
    validateJWT,
    getSimilarReports,
);

export default router;
