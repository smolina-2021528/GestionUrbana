import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { config } from '../configs/config.js';

// Genera un JWT de acceso con el userId y claims adicionales (ej: roles)
export const generateJWT = (userId, extraClaims = {}, options = {}) => {
  return new Promise((resolve, reject) => {
    const payload = {
      sub: String(userId),
      jti: crypto.randomUUID(),
      iat: Math.floor(Date.now() / 1000),
      ...extraClaims,
    };

    const signOptions = {
      expiresIn: options.expiresIn || config.jwt.expiresIn,
      issuer: config.jwt.issuer,
      audience: config.jwt.audience,
    };

    jwt.sign(payload, config.jwt.secret, signOptions, (err, token) => {
      if (err) {
        console.error('Error generando JWT:', err);
        reject(err);
      } else {
        resolve(token);
      }
    });
  });
};

// Verifica y decodifica un JWT
export const verifyJWT = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, config.jwt.secret, (err, decoded) => {
      if (err) {
        console.error('Error verificando JWT:', err);
        reject(err);
      } else {
        resolve(decoded);
      }
    });
  });
};

// Genera un token de verificación de email o reset de contraseña (NO es JWT de acceso)
export const generateVerificationToken = (userId, type, expiresIn = '24h') => {
  return new Promise((resolve, reject) => {
    const payload = {
      sub: String(userId),
      type: type,
      iat: Math.floor(Date.now() / 1000),
    };

    const signOptions = {
      expiresIn,
      jwtid: crypto.randomUUID(),
      issuer: config.jwt.issuer,
      audience: config.jwt.audience,
    };

    jwt.sign(payload, config.jwt.secret, signOptions, (err, token) => {
      if (err) {
        console.error('Error generando token de verificación:', err);
        reject(err);
      } else {
        resolve(token);
      }
    });
  });
};

export const verifyVerificationToken = (token) => {
  return verifyJWT(token);
};
