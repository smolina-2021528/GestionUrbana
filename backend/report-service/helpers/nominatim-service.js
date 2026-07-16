import {
  NOMINATIM_BASE_URL,
  buildNominatimHeaders,
} from '../configs/nominatim-config.js';

const DEFAULT_TIMEOUT_MS = 8000;

const getTimeoutMs = () => {
  const parsed = Number.parseInt(process.env.NOMINATIM_TIMEOUT_MS, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_TIMEOUT_MS;
};

const fetchWithTimeout = async (url, options = {}) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), getTimeoutMs());

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
};

export const geocodeAddress = async (address) => {
  try {
    const normalizedAddress = address?.trim();

    if (!normalizedAddress) {
      return null;
    }

    const params = new URLSearchParams({
      q: normalizedAddress,
      format: 'json',
      limit: '1',
      addressdetails: '1',
    });

    const url = `${NOMINATIM_BASE_URL}/search?${params.toString()}`;

    const response = await fetchWithTimeout(url, {
      headers: buildNominatimHeaders(),
    });

    if (!response.ok) {
      console.warn(`[nominatim-service] Respuesta no OK: ${response.status}`);
      return null;
    }

    const results = await response.json();

    if (!Array.isArray(results) || results.length === 0) {
      return null;
    }

    const first = results[0];

    const latitude = parseFloat(first.lat);
    const longitude = parseFloat(first.lon);

    if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
      return null;
    }

    return {
      latitude,
      longitude,
      address: first.display_name ?? normalizedAddress,
    };
  } catch (error) {
    const message = error?.name === 'AbortError'
      ? `Tiempo de espera agotado después de ${getTimeoutMs()}ms`
      : error.message;

    console.warn('[nominatim-service] Error al geocodificar dirección:', message);
    return null;
  }
};