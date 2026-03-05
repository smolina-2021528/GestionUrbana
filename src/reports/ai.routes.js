import { Router } from 'express';

import { validateJWT } from '../../middlewares/validate-JWT.js';
import { uploadSingleImage, handleReportUploadError } from '../../helpers/file-upload.js';
import { validateSingleReportImage } from '../../middlewares/validate-report-images.js';
import { validateAnalyzeReport, validateAiCreateReport } from '../../middlewares/validation.js';
import { analyzeReport, aiCreateReport } from './ai.controller.js';

const router = Router();

// POST /api/reports/analyze
router.post(
  '/analyze',
  validateJWT,
  uploadSingleImage,
  handleReportUploadError,
  validateSingleReportImage,
  validateAnalyzeReport,
  analyzeReport,
);

// POST /api/reports/ai-create
router.post(
  '/ai-create',
  validateJWT,
  uploadSingleImage,
  handleReportUploadError,
  validateSingleReportImage,
  validateAiCreateReport,
  aiCreateReport,
);

export default router;