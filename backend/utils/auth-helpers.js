import crypto from 'crypto';

// Genera un token seguro de 32 bytes (256 bits) para verificación de email
export const generateEmailVerificationToken = () => {
  return generateSecureToken(32);
};

// Genera un token seguro de 32 bytes para reset de contraseña
export const generatePasswordResetToken = () => {
  return generateSecureToken(32);
};

// Genera un token aleatorio seguro en formato URL-safe base64
const generateSecureToken = (length) => {
  const bytes = crypto.randomBytes(length);
  return bytes
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
};
