import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const getJwtConfig = () => ({
  secret: process.env.JWT_SECRET,
  issuer: process.env.JWT_ISSUER || 'gestion_urbana',
  audience: process.env.JWT_AUDIENCE || 'gestion_urbana',
  expiresIn: process.env.JWT_EXPIRES_IN || '8h',
});

export const generateJWT = (userId) => {
  const { secret, issuer, audience, expiresIn } = getJwtConfig();

  if (!secret) {
    throw new Error('JWT_SECRET no esta configurado');
  }

  const jti = crypto.randomUUID();

  const token = jwt.sign(
    {},
    secret,
    {
      subject: userId.toString(),
      issuer,
      audience,
      expiresIn,
      jwtid: jti,
    }
  );

  return {
    token,
    jti,
  };
};

export const verifyJWT = async (token) => {
  const { secret, issuer, audience } = getJwtConfig();

  if (!secret) {
    throw new Error('JWT_SECRET no esta configurado');
  }

  return jwt.verify(token, secret, {
    issuer,
    audience,
  });
};
