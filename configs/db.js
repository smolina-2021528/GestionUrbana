'use strict';

import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// Configuración de PostgreSQL
export const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  logging: process.env.DB_SQL_LOGGING === 'true' ? console.log : false,
  define: {
    freezeTableName: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
  },
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

// Función para conectar a la base de datos
export const dbConnection = async () => {
  try {
    console.log('PostgreSQL | Intentando conectar...');

    await sequelize.authenticate();
    console.log('PostgreSQL | Conectado a PostgreSQL');
    console.log('PostgreSQL | Conexión a la base de datos establecida');
    
    await sequelize.query('CREATE EXTENSION IF NOT EXISTS postgis;');
    console.log('PostGIS | Extensión verificada/habilitada correctamente');

    if (process.env.NODE_ENV === 'development') {
      const syncLogging =
        process.env.DB_SQL_LOGGING === 'true' ? console.log : false;
      await sequelize.sync({ alter: true, logging: syncLogging });
      console.log('PostgreSQL | Modelos sincronizados con la base de datos');
    }
  } catch (error) {
    console.error('PostgreSQL | No se pudo conectar a PostgreSQL');
    console.error('PostgreSQL | Error:', error.message);
    process.exit(1);
  }
};

const gracefulShutdown = async (signal) => {
  console.log(`PostgreSQL | Señal ${signal} recibida. Cerrando conexión...`);
  try {
    await sequelize.close();
    console.log('PostgreSQL | Conexión cerrada correctamente');
    process.exit(0);
  } catch (error) {
    console.error('PostgreSQL | Error durante el cierre:', error.message);
    process.exit(1);
  }
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGUSR2', () => gracefulShutdown('SIGUSR2'));
