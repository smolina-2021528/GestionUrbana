import rateLimit from 'express-rate-limit';
import { config } from '../configs/config.js';

// Rate limiter general para todos los endpoints de la API
export const requestLimit = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Demasiadas peticiones desde esta IP, intenta de nuevo mÃ¡s tarde.',
      retryAfter: Math.ceil(config.rateLimit.windowMs / 1000),
    });
  },
});

// Rate limiter especÃ­fico para endpoints de autenticaciÃ³n (mÃ¡s restrictivo)
export const authRateLimit = rateLimit({
  windowMs: config.rateLimit.authWindowMs,
  max: config.rateLimit.authMaxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    console.log(`Rate limit de auth excedido para IP: ${req.ip} en ${req.path}`);
    res.status(429).json({
      success: false,
      message: 'Demasiados intentos de autenticaciÃ³n. Intenta de nuevo mÃ¡s tarde.',
      retryAfter: Math.ceil(config.rateLimit.authWindowMs / 1000),
    });
  },
});

// Rate limiter para endpoints de email (mÃ¡s restrictivo para evitar spam)
export const emailRateLimit = rateLimit({
  windowMs: config.rateLimit.emailWindowMs,
  max: config.rateLimit.emailMaxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    console.log(`Rate limit de email excedido para: ${req.body.email || req.ip}`);
    res.status(429).json({
      success: false,
      message: 'Demasiados correos enviados. Intenta de nuevo en 15 minutos.',
      retryAfter: Math.ceil(config.rateLimit.emailWindowMs / 1000),
    });
  },
});

