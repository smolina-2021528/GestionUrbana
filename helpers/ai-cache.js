// este helper implementa una caché simple para almacenar resultados de análisis de Gemini

const MAX_SIZE = 500;
const TTL_MS   = 60 * 60 * 1000; // 1 hora

// Map preserva el orden de inserción
const cache = new Map();

const buildKey = (imageIdentifier) =>
    `gemini:${imageIdentifier.trim().toLowerCase()}`;


export const cacheSet = (imageIdentifier, result) => {
    const key = buildKey(imageIdentifier);

    // Si ya existe, eliminarlo para reinsertar al final
    if (cache.has(key)) cache.delete(key);

    // Expulsar la entrada más antigua si se supera MAX_SIZE
    if (cache.size >= MAX_SIZE) {
        const oldestKey = cache.keys().next().value;
        cache.delete(oldestKey);
    }

    cache.set(key, {
        result,
        expiresAt: Date.now() + TTL_MS,
    });
};

export const cacheGet = (imageIdentifier) => {
    const key   = buildKey(imageIdentifier);
    const entry = cache.get(key);

    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
        cache.delete(key);
        return null;
    }

    cache.delete(key);
    cache.set(key, entry);

    return entry.result;
};


export const cacheDelete = (imageIdentifier) => {
    cache.delete(buildKey(imageIdentifier));
};

export const cacheStats = () => ({
    size:    cache.size,
    maxSize: MAX_SIZE,
    ttlMs:   TTL_MS,
});