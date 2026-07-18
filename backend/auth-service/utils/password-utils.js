import argon2 from 'argon2';
import crypto from 'crypto';
import { config } from '../configs/config.js';

// Hashea una contraseña con Argon2id (configuración compatible con .NET)
export const hashPassword = async (password) => {
  try {
    return await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 102400, // 100 MB
      timeCost: 2,
      parallelism: 8,
      hashLength: 32,
      saltLength: 16,
    });
  } catch (error) {
    throw new Error('Error al hashear la contraseña');
  }
};

// Verifica una contraseña contra su hash (soporta hashes generados por .NET)
export const verifyPassword = async (hashedPassword, plainPassword) => {
  try {
    // Verificación directa con argon2
    try {
      const result = await argon2.verify(hashedPassword, plainPassword);
      if (result) return true;
    } catch (directError) {
      // Continuar con verificación manual si falla
    }

    // Verificación manual para hashes generados en .NET
    if (hashedPassword.startsWith('$argon2id$v=19$')) {
      const parts = hashedPassword.split('$');
      if (parts.length === 6) {
        const paramsStr = parts[3];
        const saltB64 = parts[4];
        const expectedHashB64 = parts[5];

        const params = {};
        paramsStr.split(',').forEach((param) => {
          const [key, value] = param.split('=');
          params[key] = parseInt(value);
        });

        const salt = Buffer.from(saltB64, 'base64');
        const expectedHash = Buffer.from(expectedHashB64, 'base64');

        const computedHash = await argon2.hash(plainPassword, {
          type: argon2.argon2id,
          memoryCost: params.m || 102400,
          timeCost: params.t || 2,
          parallelism: params.p || 8,
          salt: salt,
          hashLength: expectedHash.length,
          raw: true,
        });

        return crypto.timingSafeEqual(expectedHash, computedHash);
      }
    }

    return false;
  } catch (error) {
    console.error('Error verificando contraseña:', error.message);
    return false;
  }
};

// Valida la fortaleza de una contraseña según las políticas del sistema
export const validatePasswordStrength = (password) => {
  const errors = [];

  if (password.length < config.security.passwordMinLength) {
    errors.push(`La contraseña debe tener al menos ${config.security.passwordMinLength} caracteres`);
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('La contraseña debe tener al menos una letra mayúscula');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('La contraseña debe tener al menos una letra minúscula');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('La contraseña debe tener al menos un número');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

