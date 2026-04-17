// Rangos de fecha predefinidos para el módulo de estadísticas
export const DATE_RANGES = {
TODAY: {
    label: 'Hoy',
    getRange: () => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    return { startDate: start, endDate: end };
    },
},
LAST_7_DAYS: {
    label: 'Últimos 7 días',
    getRange: () => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 6);
    start.setHours(0, 0, 0, 0);
    return { startDate: start, endDate: end };
    },
},
LAST_30_DAYS: {
    label: 'Últimos 30 días',
    getRange: () => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 29);
    start.setHours(0, 0, 0, 0);
    return { startDate: start, endDate: end };
    },
},
LAST_90_DAYS: {
    label: 'Últimos 90 días',
    getRange: () => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 89);
    start.setHours(0, 0, 0, 0);
    return { startDate: start, endDate: end };
    },
},
THIS_YEAR: {
    label: 'Este año',
    getRange: () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const end = new Date();
    return { startDate: start, endDate: end };
    },
},
};

// Agrupaciones válidas para el endpoint de tendencias
export const GROUPBY_OPTIONS = ['day', 'week', 'month'];

// Formatos de exportación soportados
export const EXPORT_FORMATS = ['csv', 'xlsx'];

// Límite máximo de filas por exportación
export const EXPORT_MAX_ROWS = 10000;

// Definición de columnas para el archivo exportado
export const EXPORT_COLUMNS = [
{ key: 'id',           header: 'ID',                    width: 38 },
{ key: 'title',        header: 'Título',                width: 40 },
{ key: 'description',  header: 'Descripción',           width: 60 },
{ key: 'category',     header: 'Categoría',             width: 18 },
{ key: 'priority',     header: 'Prioridad',             width: 12 },
{ key: 'status',       header: 'Estado',                width: 15 },
{ key: 'address',      header: 'Dirección',             width: 50 },
{ key: 'latitude',     header: 'Latitud',               width: 14 },
{ key: 'longitude',    header: 'Longitud',              width: 14 },
{ key: 'createdAt',    header: 'Fecha de creación',     width: 20 },
{ key: 'resolvedAt',   header: 'Fecha de resolución',   width: 20 },
{ key: 'citizenName',  header: 'Ciudadano',             width: 30 },
{ key: 'assignedTo',   header: 'Municipal asignado',    width: 30 },
{ key: 'commentCount', header: 'Comentarios públicos',  width: 22 },
];

// Radios válidos para el ranking de zonas (en metros)
export const ZONE_RADIUS_OPTIONS = [500, 1000, 2000, 5000];