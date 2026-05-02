'use strict';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import { dbConnection } from './db.js';
import { corsOptions } from './cors-configuration.js';
import { helmetConfiguration } from './helmet-configuration.js';

import { requestLimit } from '../middlewares/request-limit.js';
import {
  errorHandler,
  notFound,
} from '../middlewares/server-genericError-handler.js';

// Modelos locales de referencia para usuarios y roles.
// No importan desde otro servicio; solo apuntan a las mismas tablas.
import '../src/users/user-ref.model.js';
import '../src/users/role-ref.model.js';

// Modelos propios de report-service.
import '../src/reports/report.model.js';
import '../src/reports/report-image.model.js';
import '../src/reports/report-status-history.model.js';
import '../src/reports/report-comment.model.js';
import '../src/reports/report-follower.model.js';
import '../src/reports/report-notification.model.js';

// Asociaciones locales de report-service.
import '../src/reports/report-associations.js';

// Rutas propias de report-service.
import reportRoutes from '../src/reports/report.routes.js';
import aiRoutes from '../src/reports/ai.routes.js';
import duplicateRoutes from '../src/reports/duplicate.routes.js';
import commentRoutes from '../src/reports/comment.routes.js';
import notificationRoutes from '../src/reports/notification.routes.js';
import statsRoutes from '../src/reports/stats.routes.js';

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
  app.use(`${BASE_PATH}/reports`, reportRoutes);
  app.use(`${BASE_PATH}/reports`, aiRoutes);
  app.use(`${BASE_PATH}/reports`, duplicateRoutes);
  app.use(`${BASE_PATH}/reports`, commentRoutes);

  app.use(`${BASE_PATH}/notifications`, notificationRoutes);
  app.use(`${BASE_PATH}/stats`, statsRoutes);

  app.get(`${BASE_PATH}/health`, (_req, res) => {
    res.json({
      status: 'Healthy',
      service: 'report-service',
    });
  });

  app.use(notFound);
};

export const initServer = async () => {
  const app = express();
  const PORT = process.env.REPORT_PORT || process.env.PORT || 3007;

  app.set('trust proxy', 1);

  try {
    await dbConnection();

    const { createSpatialIndex, createCompositeIndexes } =
      await import('../src/reports/report.model.js');

    await createSpatialIndex();
    await createCompositeIndexes();

    applyMiddlewares(app);
    applyRoutes(app);

    app.use(errorHandler);

    app.listen(PORT, () => {
      console.log(`Report Service corriendo en puerto ${PORT}`);
      console.log(`Health: http://localhost:${PORT}${BASE_PATH}/health`);
    });
  } catch (err) {
    console.error(`[FATAL] Error iniciando report-service: ${err.message}`);
    process.exit(1);
  }
};

