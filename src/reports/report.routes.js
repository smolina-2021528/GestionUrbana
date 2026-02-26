import { Router } from 'express';

import { validateJWT } from '../../middlewares/validate-JWT.js';
import { validateAdmin } from '../../middlewares/validate-admin.js';

const router = Router();



export default router;
