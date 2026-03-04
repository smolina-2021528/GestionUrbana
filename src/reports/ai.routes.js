import { Router } from 'express';

import { validateJWT } from '../../middlewares/validate-JWT.js';
import { uploadReportImages, handleReportUploadError } from '../../helpers/file-upload.js';
import { validateAnalyzeReport, validateAiCreateReport } from '../../middlewares/validation.js';
import { analyzeReport, aiCreateReport } from './ai.controller.js';

const router = Router();

// POST /api/reports/analyze
router.post(
  '/analyze',
  validateJWT,
  uploadReportImages.single('image'),
  handleReportUploadError,
  validateAnalyzeReport,
  analyzeReport,
);

// POST /api/reports/ai-create
router.post(
  '/ai-create',
  validateJWT,
  uploadReportImages.single('image'),
  handleReportUploadError,
  validateAiCreateReport,
  aiCreateReport,
);

export default router;