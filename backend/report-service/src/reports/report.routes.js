import { Router } from 'express';

import { validateJWT } from '../../middlewares/validate-JWT.js';
import { validateAdmin } from '../../middlewares/validate-admin.js';
import { validateReportOwner } from '../../middlewares/validate-report-owner.js';
import { validateReportImages } from '../../middlewares/validate-report-images.js';
import { requireAIEnabled } from '../../middlewares/require-ai-enabled.js';
import { validateAssignableAdmin } from '../../middlewares/validate-assignable-admin.js';
import { uploadReportImages, handleReportUploadError } from '../../../shared/file-upload.js';
import {
  validateCreateReportOrAI,
  validateUpdateReport,
  validateChangeReportStatus,
  validateAssignReport,
  validateUpdateLocation,
  validateDateRangeQuery,
} from '../../middlewares/validation.js';
import {
  createReport,
  getMyReports,
  getReportById,
  updateReport,
  deleteReport,
  deleteReportImage,
  getReportStatusHistory,
  getAllReports,
  changeReportStatus,
  assignReport,
  getReportStats,
  searchReports,
  getNearbyReports,
  getHeatmap,
  getGeoStats,
  updateReportLocation,
  removeReportLocation,
  getReportsByBoundingBox,
  reprocessReportAI,
} from './report.controller.js';

const router = Router();

// ─────────────────────────────────────────────────────────────
// Rutas administrativas de reportes
// ─────────────────────────────────────────────────────────────

router.get('/stats', validateJWT, validateAdmin, getReportStats);

router.get('/geo-stats', validateJWT, validateAdmin, getGeoStats);

router.get('/', validateJWT, validateAdmin, validateDateRangeQuery, getAllReports);

router.patch(
  '/:reportId/status',
  validateJWT,
  validateAdmin,
  validateChangeReportStatus,
  changeReportStatus,
);

router.patch(
  '/:reportId/assign',
  validateJWT,
  validateAdmin,
  validateAssignReport,
  validateAssignableAdmin,
  assignReport,
);

router.get('/search', validateJWT, validateAdmin, validateDateRangeQuery, searchReports);

router.get('/nearby', validateJWT, validateAdmin, getNearbyReports);

router.get('/heatmap', validateJWT, validateAdmin, getHeatmap);

router.get('/bbox', validateJWT, validateAdmin, getReportsByBoundingBox);

// ─────────────────────────────────────────────────────────────
// Rutas ciudadanas / compartidas
// ─────────────────────────────────────────────────────────────

router.post(
  '/',
  validateJWT,
  uploadReportImages.array('images', 3),
  handleReportUploadError,
  validateReportImages,
  validateCreateReportOrAI,
  createReport,
);

router.get('/my-reports', validateJWT, validateDateRangeQuery, getMyReports);

router.get('/:reportId', validateJWT, validateReportOwner, getReportById);

router.put(
  '/:reportId',
  validateJWT,
  validateReportOwner,
  uploadReportImages.array('images', 3),
  handleReportUploadError,
  validateReportImages,
  validateUpdateReport,
  updateReport,
);

router.delete('/:reportId', validateJWT, validateReportOwner, deleteReport);

router.delete('/:reportId/images/:imageId', validateJWT, validateReportOwner, deleteReportImage);

router.patch(
  '/:reportId/location',
  validateJWT,
  validateReportOwner,
  validateUpdateLocation,
  updateReportLocation,
);

router.delete('/:reportId/location', validateJWT, validateReportOwner, removeReportLocation);

router.get('/:reportId/history', validateJWT, validateReportOwner, getReportStatusHistory);

router.post(
  '/:reportId/ai/reprocess',
  validateJWT,
  validateAdmin,
  requireAIEnabled,
  reprocessReportAI,
);

export default router;