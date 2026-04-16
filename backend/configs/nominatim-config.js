export const NOMINATIM_BASE_URL =
process.env.NOMINATIM_BASE_URL ?? 'https://nominatim.openstreetmap.org';

export const NOMINATIM_USER_AGENT =
process.env.NOMINATIM_USER_AGENT ?? 'GestionUrbanaApp/1.0';

export const buildNominatimHeaders = () => ({
'User-Agent': NOMINATIM_USER_AGENT,
'Accept': 'application/json',
});