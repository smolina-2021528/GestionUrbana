import { Router } from 'express';

import { validateJWT } from '../../middlewares/validate-JWT.js';
import { uploadSingleImage, handleReportUploadError } from '../../report-service/helpers/file-upload.js';
import { validateSingleReportImage } from '../../report-service/middlewares/validate-report-images.js';
import { validateAnalyzeReport, validateAiCreateReport } from '../../middlewares/validation.js';
import { analyzeReport, aiCreateReport } from './ai.controller.js';

const router = Router();

// este metodo nos garantiza que los errores de Multer llegan a handleReportUploadError
const uploadSingleImageSafe = (req, res, next) => {
  uploadSingleImage(req, res, (err) => {
    if (err) return handleReportUploadError(err, req, res, next);
    next();
  });
};

// POST /api/reports/analyze
router.post(
  '/analyze',
  validateJWT,
  uploadSingleImageSafe,
  validateSingleReportImage,
  validateAnalyzeReport,
  analyzeReport,
);

// POST /api/reports/ai-create
router.post(
  '/ai-create',
  validateJWT,
  uploadSingleImageSafe,
  validateSingleReportImage,
  validateAiCreateReport,
  aiCreateReport,
);

export default router;
