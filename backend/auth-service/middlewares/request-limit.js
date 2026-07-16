import rateLimit from 'express-rate-limit';
import { config } from '../configs/config.js';

const buildRetryAfterSeconds = (windowMs) => Math.ceil(windowMs / 1000);

const buildRateLimitResponse = (message, windowMs) => ({
  success: false,
  message,
  errorCode: 'RATE_LIMIT_EXCEEDED',
  retryAfter: buildRetryAfterSeconds(windowMs),
});

// Rate limiter general para todos los endpoints de la API.
export const requestLimit = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json(
      buildRateLimitResponse(
        'Demasiadas peticiones desde esta IP, intenta de nuevo más tarde.',
        config.rateLimit.windowMs,
      ),
    );
  },
});

// Rate limiter específico para endpoints de autenticación.
export const authRateLimit = rateLimit({
  windowMs: config.rateLimit.authWindowMs,
  max: config.rateLimit.authMaxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    console.log(`Rate limit de auth excedido para IP: ${req.ip} en ${req.path}`);

    res.status(429).json(
      buildRateLimitResponse(
        'Demasiados intentos de autenticación. Intenta de nuevo más tarde.',
        config.rateLimit.authWindowMs,
      ),
    );
  },
});

// Rate limiter para endpoints de email.
export const emailRateLimit = rateLimit({
  windowMs: config.rateLimit.emailWindowMs,
  max: config.rateLimit.emailMaxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    console.log(`Rate limit de email excedido para: ${req.body.email || req.ip}`);

    res.status(429).json(
      buildRateLimitResponse(
        'Demasiados correos enviados. Intenta de nuevo en 15 minutos.',
        config.rateLimit.emailWindowMs,
      ),
    );
  },
});