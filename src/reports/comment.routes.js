import { Router } from 'express';

import { validateJWT } from '../../middlewares/validate-JWT.js';
import { validateCreateComment } from '../../middlewares/validation.js';
import {
  createComment,
  getCommentsByReport,
  deleteComment,
  followReport,
  unfollowReport,
  getFollowedReports,
} from './comment.controller.js';

const router = Router();

router.post('/:reportId/comments', validateJWT, validateCreateComment, createComment);

router.get('/:reportId/comments', validateJWT, getCommentsByReport);

router.delete('/:reportId/comments/:commentId', validateJWT, deleteComment);

router.get('/followed', validateJWT, getFollowedReports);

router.post('/:reportId/follow', validateJWT, followReport);

router.delete('/:reportId/follow', validateJWT, unfollowReport);

export default router;