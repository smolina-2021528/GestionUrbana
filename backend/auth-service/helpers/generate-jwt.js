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
// Se validan issuer y audience para evitar que tokens de otros contextos sean aceptados
export const verifyJWT = (token) => {
  return new Promise((resolve, reject) => {
    const verifyOptions = {
      issuer:   config.jwt.issuer,
      audience: config.jwt.audience,
    };

    jwt.verify(token, config.jwt.secret, verifyOptions, (err, decoded) => {
      if (err) {
        console.error('Error verificando JWT:', err);
        reject(err);
      } else {
        resolve(decoded);
      }
    });
  });
};

// Genera un token de verificaciÃ³n de email o reset de contraseÃ±a
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
        console.error('Error generando token de verificaciÃ³n:', err);
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
