import { Router } from 'express';

import { validateJWT } from '../../middlewares/validate-JWT.js';
import {
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from './comment.controller.js';

const router = Router();

router.get('/', validateJWT, getMyNotifications);

router.patch('/read-all', validateJWT, markAllNotificationsAsRead);

router.patch('/:notificationId/read', validateJWT, markNotificationAsRead);

router.delete('/:notificationId', validateJWT, deleteNotification);

export default router;


