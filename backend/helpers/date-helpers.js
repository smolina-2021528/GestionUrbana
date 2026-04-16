import { Op } from 'sequelize';
import { DATE_RANGES } from './stats-constants.js';

const GUATEMALA_TZ = 'America/Guatemala';

/**
 * Parsea el rango de fechas desde req.query.
 * Prioridad: fechas explícitas > dateRange shortcut > sin filtro.
 *
 * @param {object} query - req.query
 * @returns {{ startDate: Date|null, endDate: Date|null }}
 */
export const parseDateRange = (query) => {
const { startDate, endDate, dateRange } = query;

if (startDate || endDate) {
    return {
    startDate: startDate ? new Date(startDate) : null,
    endDate:   endDate   ? new Date(endDate)   : null,
    };
}

if (dateRange && DATE_RANGES[dateRange]) {
    return DATE_RANGES[dateRange].getRange();
}

return { startDate: null, endDate: null };
};

/**
 * Construye la cláusula WHERE de Sequelize para un campo de fecha.
 *
 * @param {Date|null} startDate
 * @param {Date|null} endDate
 * @param {string}    field - nombre de columna en la BD (default: 'created_at')
 * @returns {object} condición Sequelize lista para usar en where: {}
 */
export const buildDateWhereClause = (startDate, endDate, field = 'created_at') => {
if (!startDate && !endDate) return {};

if (startDate && endDate) {
    return { [field]: { [Op.between]: [startDate, endDate] } };
}

if (startDate) {
    return { [field]: { [Op.gte]: startDate } };
}

return { [field]: { [Op.lte]: endDate } };
};

/**
 * Formatea una fecha para el archivo exportado.
 * Zona horaria: America/Guatemala (UTC-6).
 *
 * @param {Date|string|null} date
 * @returns {string} 'DD/MM/YYYY HH:mm' o '' si date es null/undefined
 */
export const formatDateForExport = (date) => {
if (!date) return '';

const d = date instanceof Date ? date : new Date(date);
if (isNaN(d.getTime())) return '';

return d.toLocaleString('es-GT', {
    timeZone: GUATEMALA_TZ,
    day:      '2-digit',
    month:    '2-digit',
    year:     'numeric',
    hour:     '2-digit',
    minute:   '2-digit',
    hour12:   false,
}).replace(',', '');
};

/**
 * Genera una etiqueta legible del rango de fechas para el nombre del archivo.
 *
 * @param {Date|null} startDate
 * @param {Date|null} endDate
 * @returns {string} p.ej. '01-01-2025_al_31-01-2025' o 'todos'
 */
export const getDateRangeLabel = (startDate, endDate) => {
if (!startDate && !endDate) return 'todos';

const format = (date) => {
    const d = date instanceof Date ? date : new Date(date);
    const dd   = String(d.getDate()).padStart(2, '0');
    const mm   = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
};

if (startDate && endDate) {
    return `${format(startDate)}_al_${format(endDate)}`;
}

if (startDate) return `desde_${format(startDate)}`;

return `hasta_${format(endDate)}`;
};