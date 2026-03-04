import {
    NOMINATIM_BASE_URL,
    buildNominatimHeaders,
} from '../configs/nominatim-config.js';

export const geocodeAddress = async (address) => {
    try {
        const params = new URLSearchParams({
            q:              address,
            format:         'json',
            limit:          '1',
            addressdetails: '1',
        });

        const url = `${NOMINATIM_BASE_URL}/search?${params.toString()}`;

        const response = await fetch(url, {
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

        const latitude  = parseFloat(first.lat);
        const longitude = parseFloat(first.lon);

        if (isNaN(latitude) || isNaN(longitude)) {
            return null;
        }

        return {
            latitude,
            longitude,
            address: first.display_name ?? address,
        };
    } catch (error) {
        console.warn('[nominatim-service] Error al geocodificar dirección:', error.message);
        return null;
    }
};