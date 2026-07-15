import { Router } from 'express';

import { validateJWT } from '../../middlewares/validate-JWT.js';
import { uploadSingleImage, handleReportUploadError } from '../../../shared/file-upload.js';
import { validateSingleReportImage } from '../../middlewares/validate-report-images.js';
import { requireAIEnabled } from '../../middlewares/require-ai-enabled.js';
import { validateAnalyzeReport, validateAiCreateReport } from '../../middlewares/validation.js';
import { analyzeReport, aiCreateReport } from './ai.controller.js';

const router = Router();

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
  requireAIEnabled,
  uploadSingleImageSafe,
  validateSingleReportImage,
  validateAnalyzeReport,
  analyzeReport,
);

// POST /api/reports/ai-create
router.post(
  '/ai-create',
  validateJWT,
  requireAIEnabled,
  uploadSingleImageSafe,
  validateSingleReportImage,
  validateAiCreateReport,
  aiCreateReport,
);

export default router;