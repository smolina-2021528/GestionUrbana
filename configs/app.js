'use strict';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { dbConnection } from './db.js';

// Importar modelos — usuarios y auth
import '../src/users/user.model.js';
import '../src/auth/role.model.js';

// Importar modelos — reportes 
import '../src/reports/report.model.js';
import '../src/reports/report-image.model.js';
import '../src/reports/report-status-history.model.js';

// Importacion para commentarios, seguimiento y notificaciones en los modelos
import '../src/reports/report-comment.model.js';
import '../src/reports/report-follower.model.js';
import '../src/reports/report-notification.model.js';

// Middlewares globales
import { requestLimit } from '../middlewares/request-limit.js';
import { corsOptions } from './cors-configuration.js';
import { helmetConfiguration } from './helmet-configuration.js';
import {
  errorHandler,
  notFound,
} from '../middlewares/server-genericError-handler.js';

// Rutas
import authRoutes from '../src/auth/auth.routes.js';
import userRoutes from '../src/users/user.routes.js';
import profileRoutes from '../src/profiles/profile.routes.js';
import reportRoutes from '../src/reports/report.routes.js';

const BASE_PATH = '/gestionurbana/v1';

const middlewares = (app) => {
  app.use(express.urlencoded({ extended: false, limit: '10mb' }));
  app.use(express.json({ limit: '10mb' }));
  app.use(cors(corsOptions));
  app.use(helmet(helmetConfiguration));
  app.use(requestLimit);
  app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));
};

const routes = (app) => {
  app.use(`${BASE_PATH}/auth`,    authRoutes);
  app.use(`${BASE_PATH}/users`,   userRoutes);
  app.use(`${BASE_PATH}/profile`, profileRoutes);
  app.use(`${BASE_PATH}/reports`, reportRoutes);

  // Health check
  app.get(`${BASE_PATH}/health`, (_req, res) => {
    res.status(200).json({
      status: 'Healthy',
      timestamp: new Date().toISOString(),
      service: 'Sistema de Gestión Urbana Inteligente API',
      version: '1.0.0',
    });
  });

  app.use(notFound);
};

export const initServer = async () => {
  const app = express();
  const PORT = process.env.PORT || 3006;
  app.set('trust proxy', 1);

  try {
    await dbConnection();

    // Seed de roles y admin por defecto
    const { seedRoles } = await import('../helpers/role-seed.js');
    await seedRoles();

    const { seedAdmin } = await import('../helpers/admin-seed.js');
    await seedAdmin();

    const { createSpatialIndex } = await import('../src/reports/report.model.js');
    await createSpatialIndex();

    middlewares(app);
    routes(app);
    app.use(errorHandler);

    app.listen(PORT, () => {
      console.log(`\nGestión Urbana Inteligente API corriendo en puerto ${PORT}`);
      console.log(`Health: http://localhost:${PORT}${BASE_PATH}/health\n`);
    });
  } catch (err) {
    console.error(`Error iniciando servidor: ${err.message}`);
    process.exit(1);
  }
};
