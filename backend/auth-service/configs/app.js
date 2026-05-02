'use strict';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './swagger.js';
import { dbConnection } from './db.js';
import { corsOptions } from './cors-configuration.js';
import { helmetConfiguration } from './helmet-configuration.js';

import { requestLimit } from '../middlewares/request-limit.js';
import {
  errorHandler,
  notFound,
} from '../middlewares/server-genericError-handler.js';

// Modelos propios de auth-service
import '../src/users/user.model.js';
import '../src/auth/role.model.js';

// Rutas propias de auth-service
import authRoutes from '../src/auth/auth.routes.js';
import userRoutes from '../src/users/user.routes.js';
import profileRoutes from '../src/profiles/profile.routes.js';

const BASE_PATH = '/gestionurbana/v1';

const applyMiddlewares = (app) => {
  app.use(express.urlencoded({ extended: false, limit: '10mb' }));
  app.use(express.json({ limit: '10mb' }));

  app.use(cors(corsOptions));
  app.use(helmet(helmetConfiguration));
  app.use(requestLimit);

  app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));
};

const applyRoutes = (app) => {
  app.use(`${BASE_PATH}/auth`, authRoutes);
  app.use(`${BASE_PATH}/users`, userRoutes);
  app.use(`${BASE_PATH}/profile`, profileRoutes);

    app.use(`${BASE_PATH}/docs`, swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  app.get(`${BASE_PATH}/health`, (_req, res) => {
    res.json({
      status: 'Healthy',
      service: 'auth-service',
    });
  });

  app.use(notFound);
};

export const initServer = async () => {
  const app = express();
  const PORT = process.env.AUTH_PORT || process.env.PORT || 3006;

  app.set('trust proxy', 1);

  try {
    await dbConnection();

    const { seedRoles } = await import('../helpers/role-seed.js');
    const { seedAdmin } = await import('../helpers/admin-seed.js');

    await seedRoles();
    await seedAdmin();

    applyMiddlewares(app);
    applyRoutes(app);

    app.use(errorHandler);

    app.listen(PORT, () => {
      console.log(`Auth Service corriendo en puerto ${PORT}`);
      console.log(`Health: http://localhost:${PORT}${BASE_PATH}/health`);
    });
  } catch (err) {
    console.error(`[FATAL] Error iniciando auth-service: ${err.message}`);
    process.exit(1);
  }
};