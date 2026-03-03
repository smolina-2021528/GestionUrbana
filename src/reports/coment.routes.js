import { Router } from 'express';

import { validateJWT } from '../../middlewares/validate-JWT.js';
import { validateCreateComment } from '../../middlewares/validation.js';
import {
  createComment,
  getCommentsByReport,
  deleteComment,
} from './comment.controller.js';

const router = Router();

router.post('/:reportId/comments', validateJWT, validateCreateComment, createComment);

router.get('/:reportId/comments', validateJWT, getCommentsByReport);

router.delete('/:reportId/comments/:commentId', validateJWT, deleteComment);

export default router;