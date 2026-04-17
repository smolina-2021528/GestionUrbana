import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Configuración JWT
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN,
    issuer: process.env.JWT_ISSUER,
    audience: process.env.JWT_AUDIENCE,
  },

  // Configuración SMTP
  smtp: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    enableSsl: process.env.SMTP_ENABLE_SSL === 'true',
    username: process.env.SMTP_USERNAME,
    password: process.env.SMTP_PASSWORD,
    fromEmail: process.env.EMAIL_FROM,
    fromName: process.env.EMAIL_FROM_NAME,
  },

  // Configuración de archivos
  upload: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    uploadPath: process.env.UPLOAD_PATH || './uploads',
  },

  // Configuración Cloudinary
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
    folder: process.env.CLOUDINARY_FOLDER,
    folderReports: process.env.CLOUDINARY_FOLDER_REPORTS,
  },

  rateLimit: {
    windowMs: 1 * 60 * 1000,
    maxRequests: 20,
    authWindowMs: 1 * 60 * 1000,
    authMaxRequests: 5,
    emailWindowMs: 15 * 60 * 1000,
    emailMaxRequests: 3,
  },

  // Seguridad
  security: {
    saltRounds: 12,
    maxLoginAttempts: 5,
    lockoutTime: 30 * 60 * 1000,
    passwordMinLength: 8,
  },

  // App
  app: {
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  },
};