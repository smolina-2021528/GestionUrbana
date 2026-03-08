'use strict';

import express  from 'express';
import cors     from 'cors';
import helmet   from 'helmet';
import morgan   from 'morgan';

import { dbConnection } from './db.js';

// ─── Modelos — 
// Usuarios y autenticación
import '../src/users/user.model.js';
import '../src/auth/role.model.js';

// Reportes — orden importante: Report primero, luego sus dependientes
import '../src/reports/report.model.js';
import '../src/reports/report-image.model.js';
import '../src/reports/report-status-history.model.js';

// Comentarios, seguimiento y notificaciones
import '../src/reports/report-comment.model.js';
import '../src/reports/report-follower.model.js';
import '../src/reports/report-notification.model.js';

// ─── Middlewares globales
import { requestLimit }           from '../middlewares/request-limit.js';
import { corsOptions }            from './cors-configuration.js';
import { helmetConfiguration }    from './helmet-configuration.js';
import {
  errorHandler,
  notFound,
} from '../middlewares/server-genericError-handler.js';

// ─── Rutas 
// Auth (register, login, logout, verify-email, forgot/reset-password, profile)
import authRoutes         from '../src/auth/auth.routes.js';

// Usuarios — gestión administrativa (listar, cambiar rol, activar/desactivar)
import userRoutes         from '../src/users/user.routes.js';

// Perfil propio (actualizar datos, cambiar contraseña)
import profileRoutes      from '../src/profiles/profile.routes.js';

// Reportes — CRUD, geolocalización, historial, imágenes, seguimiento, comentarios
import reportRoutes       from '../src/reports/report.routes.js';

// Análisis IA — analizar imagen, crear reporte asistido por IA
import aiRoutes           from '../src/reports/ai.routes.js';

// Detección de duplicados — similar y check-duplicates
import duplicateRoutes    from '../src/reports/duplicate.routes.js';

// Comentarios de reportes
import commentRoutes      from '../src/reports/comment.routes.js';

// Notificaciones in-app del usuario autenticado
import notificationRoutes from '../src/reports/notification.routes.js';

// Estadísticas y analíticas (dashboard, trends, zones, export, heatmap-grid, transitions)
import statsRoutes        from '../src/reports/stats.routes.js';

// ─── Constante base ────────────────────────────────────────────────────────────
const BASE_PATH = '/gestionurbana/v1';

// ─── Configuración de middlewares globales ────────────────────────────────────
const applyMiddlewares = (app) => {
  // Parseo de cuerpos
  app.use(express.urlencoded({ extended: false, limit: '10mb' }));
  app.use(express.json({ limit: '10mb' }));

  // Seguridad HTTP
  app.use(cors(corsOptions));
  app.use(helmet(helmetConfiguration));

  // Rate limiting global (20 req/min por IP)
  app.use(requestLimit);

  // Logging HTTP (formato compacto en dev, combined en producción)
  app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));
};

// ─── Registro de rutas ─────────────────────────────────────────────────────────
const applyRoutes = (app) => {
  // Autenticación y sesión
  //   POST   /auth/register
  //   POST   /auth/login
  //   POST   /auth/logout           ← invalida el JWT via blacklist en memoria
  //   POST   /auth/verify-email
  //   POST   /auth/resend-verification
  //   POST   /auth/forgot-password
  //   POST   /auth/reset-password
  //   GET    /auth/profile
  app.use(`${BASE_PATH}/auth`, authRoutes);

  // Usuarios (solo ADMIN_ROLE)
  //   GET    /users
  //   GET    /users/by-role/:roleName
  //   GET    /users/:userId/roles
  //   PUT    /users/:userId/role
  //   PATCH  /users/:userId/status
  app.use(`${BASE_PATH}/users`, userRoutes);

  // Perfil propio
  //   PUT    /profile
  //   PUT    /profile/change-password
  app.use(`${BASE_PATH}/profile`, profileRoutes);

  // Reportes — rutas base y geoespaciales
  //   POST   /reports
  //   GET    /reports                (admin — soporta sortBy=priority)
  //   GET    /reports/my-reports
  //   GET    /reports/search
  //   GET    /reports/nearby
  //   GET    /reports/heatmap
  //   GET    /reports/bbox
  //   GET    /reports/stats          (admin)
  //   GET    /reports/geo-stats      (admin)
  //   GET    /reports/:reportId
  //   PUT    /reports/:reportId
  //   DELETE /reports/:reportId
  //   PATCH  /reports/:reportId/status
  //   PATCH  /reports/:reportId/assign
  //   PATCH  /reports/:reportId/location
  //   DELETE /reports/:reportId/location
  //   DELETE /reports/:reportId/images/:imageId
  //   GET    /reports/:reportId/history
  //   POST   /reports/:reportId/ai/reprocess  (procesamiento síncrono con Gemini)
  app.use(`${BASE_PATH}/reports`, reportRoutes);

  // IA — análisis de imagen y creación asistida por Gemini
  //   POST   /reports/analyze
  //   POST   /reports/ai-create
  app.use(`${BASE_PATH}/reports`, aiRoutes);

  // Detección de duplicados (TF-IDF + cosine similarity + proximidad geo)
  //   POST   /reports/check-duplicates
  //   GET    /reports/:reportId/similar
  app.use(`${BASE_PATH}/reports`, duplicateRoutes);

  // Comentarios de reportes
  //   POST   /reports/:reportId/comments
  //   GET    /reports/:reportId/comments
  //   DELETE /reports/:reportId/comments/:commentId
  app.use(`${BASE_PATH}/reports`, commentRoutes);

  // Estadísticas y analíticas (solo ADMIN_ROLE)
  //   GET    /stats/dashboard
  //   GET    /stats/trends
  //   GET    /stats/zones
  //   GET    /stats/export
  //   GET    /stats/transitions
  //   GET    /stats/heatmap-grid
  app.use(`${BASE_PATH}/stats`, statsRoutes);

  // Notificaciones in-app del usuario autenticado
  //   GET    /notifications
  //   PATCH  /notifications/read-all
  //   PATCH  /notifications/:notificationId/read
  //   DELETE /notifications/:notificationId
  app.use(`${BASE_PATH}/notifications`, notificationRoutes);

  // ── Health check ──────────────────────────────────────────────────────────
  app.get(`${BASE_PATH}/health`, (_req, res) => {
    res.status(200).json({
      status:    'Healthy',
      timestamp: new Date().toISOString(),
      service:   'Sistema de Gestión Urbana Inteligente API',
      version:   '1.0.0',
      env:       process.env.NODE_ENV ?? 'unknown',
    });
  });

  // 404 para cualquier ruta no registrada
  app.use(notFound);
};

// ─── Inicialización del servidor ───────────────────────────────────────────────
export const initServer = async () => {
  const app  = express();
  const PORT = process.env.PORT || 3006;

  // Confiar en el primer proxy (necesario para rate limiting correcto en Docker/Nginx)
  app.set('trust proxy', 1);

  try {
    // 1. Conectar a PostgreSQL + habilitar PostGIS
    await dbConnection();

    // 2. Seeders — orden obligatorio: roles primero, luego admin
    const { seedRoles } = await import('../helpers/role-seed.js');
    await seedRoles();

    const { seedAdmin } = await import('../helpers/admin-seed.js');
    await seedAdmin();

    // 3. Índices de base de datos
    //    createSpatialIndex     → índice GIST sobre reports.location (PostGIS)
    //    createCompositeIndexes → 6 índices B-tree compuestos:
    //                             (category+status), (priority+date),
    //                             (status+date), (user_id+date),
    //                             (assigned_to), (ai_status)
    const { createSpatialIndex, createCompositeIndexes } =
      await import('../src/reports/report.model.js');
    await createSpatialIndex();
    await createCompositeIndexes();

    // 4. Middlewares y rutas
    applyMiddlewares(app);
    applyRoutes(app);

    // 5. Manejador de errores global (debe ir después de todas las rutas)
    app.use(errorHandler);

    // 6. Levantar servidor
    app.listen(PORT, () => {
      console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`  Gestión Urbana Inteligente API`);
      console.log(`  Puerto : ${PORT}`);
      console.log(`  Entorno: ${process.env.NODE_ENV ?? 'development'}`);
      console.log(`  Health : http://localhost:${PORT}${BASE_PATH}/health`);
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
    });
  } catch (err) {
    console.error(`[FATAL] Error iniciando servidor: ${err.message}`);
    process.exit(1);
  }
};