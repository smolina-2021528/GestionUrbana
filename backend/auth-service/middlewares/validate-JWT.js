import { verifyJWT } from '../helpers/generate-jwt.js';
import { findUserById } from '../helpers/user-db.js';
import { isTokenRevoked } from '../helpers/token-blacklist.js';

const extraerToken = (req) => {
  let token =
    req.header('x-token') ||
    req.header('authorization') ||
    req.body.token ||
    req.query.token;

  if (!token || typeof token !== 'string') {
    return null;
  }

  return token.replace(/^Bearer\s+/i, '').trim();
};

const obtenerRolesUsuario = (user) => {
  const roles = user.UserRoles?.map((userRole) => userRole.Role?.Name).filter(Boolean) ?? [];
  return [...new Set(roles)];
};

// Middleware que valida el JWT en cada petición protegida
export const validateJWT = async (req, res, next) => {
  try {
    const token = extraerToken(req);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No hay token en la petición',
      });
    }

    const decoded = await verifyJWT(token);

    // Verificar que el token no haya sido revocado por logout en este servicio.
    // Nota: esta blacklist es local al auth-service y vive en memoria.
    if (isTokenRevoked(decoded.jti)) {
      return res.status(401).json({
        success: false,
        message: 'Token revocado. Por favor inicia sesión nuevamente.',
      });
    }

    const user = await findUserById(decoded.sub);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token no válido - Usuario no existe en el sistema',
      });
    }

    // Verificar que la cuenta esté activa
    if (!user.Status) {
      return res.status(423).json({
        success: false,
        message: 'Cuenta desactivada. Contacta al administrador.',
      });
    }

    const roles = obtenerRolesUsuario(user);

    req.user = user;
    req.userId = user.Id.toString();
    req.userRole = roles[0] ?? null;
    req.userRoles = roles;
    req.token = token;
    req.tokenPayload = decoded;

    next();
  } catch (error) {
    console.error('Error validando JWT:', error);

    let message = 'Error al verificar el token';
    if (error.name === 'TokenExpiredError') {
      message = 'Token expirado';
    } else if (error.name === 'JsonWebTokenError') {
      message = 'Token inválido';
    }

    return res.status(401).json({
      success: false,
      message,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};