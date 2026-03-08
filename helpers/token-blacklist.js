const blacklist = new Map();

// Limpieza automática cada 15 min para no acumular tokens ya expirados
const CLEANUP_INTERVAL_MS = 15 * 60 * 1000;

setInterval(() => {
    const now = Date.now();
    for (const [jti, expiresAt] of blacklist.entries()) {
        if (expiresAt <= now) blacklist.delete(jti);
    }
}, CLEANUP_INTERVAL_MS);

// Agrega un JTI a la blacklist con su timestamp de expiración
export const revokeToken = (jti, exp) => {
    if (!jti || !exp) return;
    const expiresAt = exp * 1000; // convertir a ms
    blacklist.set(jti, expiresAt);
};

// Verifica si un JTI está en la blacklist y no ha expirado
export const isTokenRevoked = (jti) => {
    if (!jti) return false;
    const expiresAt = blacklist.get(jti);
    if (expiresAt === undefined) return false;
    if (Date.now() > expiresAt) {
        blacklist.delete(jti);
        return false;
    }
    return true;
};

// retorna el número de tokens actualmente en la blacklist
export const blacklistSize = () => blacklist.size;