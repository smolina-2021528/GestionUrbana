import { Router } from 'express';

import { validateJWT } from '../../middlewares/validate-JWT.js';
import { validateAdmin } from '../../middlewares/validate-admin.js';
import { validateReportOwner } from '../../middlewares/validate-report-owner.js';
import { validateReportImages } from '../../middlewares/validate-report-images.js';
import { uploadReportImages, handleReportUploadError } from '../../helpers/file-upload.js';
import {
  validateCreateReport,
  validateUpdateReport,
  validateChangeReportStatus,
  validateAssignReport,
  validateUpdateLocation,
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
} from './report.controller.js';

const router = Router();


router.get('/stats', validateJWT, validateAdmin, getReportStats);

router.get('/geo-stats', validateJWT, validateAdmin, getGeoStats);

router.get('/', validateJWT, validateAdmin, getAllReports);

router.patch('/:reportId/status', validateJWT, validateAdmin, validateChangeReportStatus, changeReportStatus);

router.patch('/:reportId/assign', validateJWT, validateAdmin, validateAssignReport, assignReport);


router.post(
  '/',
  validateJWT,
  uploadReportImages.array('images', 3),
  handleReportUploadError,
  validateReportImages,
  validateCreateReport,
  createReport
);

router.get('/my-reports', validateJWT, getMyReports);

router.get('/search', validateJWT, searchReports);

router.get('/nearby', validateJWT, getNearbyReports);

router.get('/heatmap', validateJWT, getHeatmap);

router.get('/bbox', validateJWT, getReportsByBoundingBox);

router.get('/:reportId', validateJWT, getReportById);

router.put(
  '/:reportId',
  validateJWT,
  validateReportOwner,
  uploadReportImages.array('images', 3),
  handleReportUploadError,
  validateReportImages,
  validateUpdateReport,
  updateReport
);

router.delete('/:reportId', validateJWT, validateReportOwner, deleteReport);

router.delete('/:reportId/images/:imageId', validateJWT, validateReportOwner, deleteReportImage);

router.patch('/:reportId/location', validateJWT, validateReportOwner, validateUpdateLocation, updateReportLocation);

router.delete('/:reportId/location', validateJWT, validateReportOwner, removeReportLocation);

router.get('/:reportId/history', validateJWT, getReportStatusHistory);

export default router;