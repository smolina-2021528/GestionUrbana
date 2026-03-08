import { QueryTypes } from 'sequelize';
import { sequelize } from '../configs/db.js';
import { ZONE_RADIUS_OPTIONS } from './stats-constants.js';

// Radio por defecto si no se recibe uno válido (metros)
const DEFAULT_RADIUS = 1000;

// Número máximo de zonas a retornar cuando no se especifica limit
const DEFAULT_LIMIT = 10;

// Tamaño de celda de la grilla en grados decimales.
// ~0.009° ≈ 1 km a la latitud de Guatemala (14°N).
const GRID_CELL_DEGREES = 0.009;

// ─── Helpers internos ─────────────────────────────────────────────────────────

/**
 * Valida y normaliza el radio de búsqueda.
 * Solo acepta valores de la whitelist definida en ZONE_RADIUS_OPTIONS.
 */
const sanitizeRadius = (radius) => {
    const parsed = parseInt(radius, 10);
    return ZONE_RADIUS_OPTIONS.includes(parsed) ? parsed : DEFAULT_RADIUS;
};

/**
 * Valida y normaliza el límite de resultados (1–20).
 */
const sanitizeLimit = (limit) => {
    const parsed = parseInt(limit, 10);
    if (isNaN(parsed) || parsed < 1) return DEFAULT_LIMIT;
    return Math.min(parsed, 20);
};

// ─── getZoneRanking ───────────────────────────────────────────────────────────

/**
 * Identifica los clústeres de reportes más densos usando ST_ClusterDBSCAN.
 *
 * ST_ClusterDBSCAN asigna un cluster_id a cada punto según su densidad
 * espacial. Los puntos que no alcanzan minpoints quedan en el clúster -1
 * (ruido); se excluyen del ranking filtrando cluster_id >= 0.
 */
export const getZoneRanking = async (filters = {}) => {
    const { radius, limit, category, status } = filters;

    const safeRadius = sanitizeRadius(radius);
    const safeLimit = sanitizeLimit(limit);

    // Condiciones opcionales sobre la tabla base (aplicadas en el CTE)
    const extraConditions = [];
    const replacements = {
        radius: safeRadius,
        limit: safeLimit,
    };

    if (category) {
        extraConditions.push('AND category = :category');
        replacements.category = category;
    }
    if (status) {
        extraConditions.push('AND status = :status');
        replacements.status = status;
    }

    const extraSQL = extraConditions.join('\n    ');

    // eps en ST_ClusterDBSCAN espera metros cuando la geometría usa SRID 4326
    // proyectado a geografía, pero la función trabaja en unidades del SRID.
    // Para SRID 4326 (grados) convertimos metros a grados aproximados:
    // 1° 111,320 m → dividimos el radio por 111320.
    // Usamos ST_Transform a SRID 3857 (metros) para que eps sea exactamente
    // el valor en metros recibido, lo que da resultados más precisos.
    const sql = `
    WITH clustered AS (
      SELECT
        id,
        title,
        category,
        priority,
        status,
        latitude,
        longitude,
        address,
        ST_ClusterDBSCAN(
          ST_Transform(location::geometry, 3857),
          eps        := :radius,
          minpoints  := 1
        ) OVER () AS cluster_id
      FROM reports
      WHERE location IS NOT NULL
        ${extraSQL}
    ),
    cluster_centers AS (
      SELECT
        cluster_id,
        COUNT(*)                                          AS report_count,
        AVG(latitude::float)                              AS center_lat,
        AVG(longitude::float)                             AS center_lng,
        MODE() WITHIN GROUP (ORDER BY category)           AS dominant_category,
        MODE() WITHIN GROUP (ORDER BY priority)           AS dominant_priority
      FROM clustered
      WHERE cluster_id >= 0          -- excluir puntos de ruido (cluster_id = -1)
      GROUP BY cluster_id
      ORDER BY report_count DESC
      LIMIT :limit
    )
    SELECT * FROM cluster_centers;
  `;

    const rows = await sequelize.query(sql, {
        replacements,
        type: QueryTypes.SELECT,
    });

    return rows.map((row) => ({
        clusterId: row.cluster_id,
        reportCount: parseInt(row.report_count, 10),
        centerLat: row.center_lat !== null ? parseFloat(parseFloat(row.center_lat).toFixed(6)) : null,
        centerLng: row.center_lng !== null ? parseFloat(parseFloat(row.center_lng).toFixed(6)) : null,
        dominantCategory: row.dominant_category ?? null,
        dominantPriority: row.dominant_priority ?? null,
    }));
};

// ─── getTopZonesByAddress ─────────────────────────────────────────────────────

/**
 * Agrupa reportes por los primeros 30 caracteres de su campo address.
 * Complementa getZoneRanking para reportes que no tienen coordenadas precisas.
 */
export const getTopZonesByAddress = async (filters = {}) => {
    const { limit, category, status } = filters;

    const safeLimit = sanitizeLimit(limit);

    const conditions = ['address IS NOT NULL', "TRIM(address) <> ''"];
    const replacements = { limit: safeLimit };

    if (category) {
        conditions.push('category = :category');
        replacements.category = category;
    }
    if (status) {
        conditions.push('status = :status');
        replacements.status = status;
    }

    const whereSQL = `WHERE ${conditions.join(' AND ')}`;

    const sql = `
    SELECT
      LEFT(TRIM(address), 30)                         AS zone,
      COUNT(*)                                        AS report_count,
      MODE() WITHIN GROUP (ORDER BY category)         AS dominant_category
    FROM reports
    ${whereSQL}
    GROUP BY zone
    ORDER BY report_count DESC
    LIMIT :limit;
  `;

    const rows = await sequelize.query(sql, {
        replacements,
        type: QueryTypes.SELECT,
    });

    return rows.map((row) => ({
        zone: row.zone ?? null,
        reportCount: parseInt(row.report_count, 10),
        dominantCategory: row.dominant_category ?? null,
    }));
};

// ─── getZoneHeatmapByGrid ─────────────────────────────────────────────────────

export const getZoneHeatmapByGrid = async (filters = {}) => {
    const { category, priority, status, startDate, endDate, cellDegrees } = filters;

    // Validar el tamaño de celda: solo permitir valores razonables (0.001°–0.1°)
    const rawCell = parseFloat(cellDegrees);
    const safeCell = (!isNaN(rawCell) && rawCell >= 0.001 && rawCell <= 0.1)
        ? rawCell
        : GRID_CELL_DEGREES;

    const conditions = ['location IS NOT NULL'];
    const replacements = { cellSize: safeCell };

    if (category) {
        conditions.push('category = :category');
        replacements.category = category;
    }
    if (priority) {
        conditions.push('priority = :priority');
        replacements.priority = priority;
    }
    if (status) {
        conditions.push('status = :status');
        replacements.status = status;
    }
    if (startDate) {
        conditions.push('created_at >= :startDate');
        replacements.startDate = new Date(startDate);
    }
    if (endDate) {
        conditions.push('created_at <= :endDate');
        replacements.endDate = new Date(endDate);
    }

    const whereSQL = `WHERE ${conditions.join(' AND ')}`;

    // ST_SnapToGrid recibe (geometry, xsize, ysize) en las unidades del SRID.
    // SRID 4326  unidades en grados. Snapeamos tanto X (lng) como Y (lat)
    // al mismo tamaño de celda para obtener celdas cuadradas.
    // ST_X / ST_Y extraen las coordenadas del punto snapeado como lng/lat.
    const sql = `
    SELECT
      ST_Y(ST_SnapToGrid(location::geometry, :cellSize, :cellSize)) AS grid_lat,
      ST_X(ST_SnapToGrid(location::geometry, :cellSize, :cellSize)) AS grid_lng,
      COUNT(*)                                                       AS count,
      MODE() WITHIN GROUP (ORDER BY category)                        AS dominant_category
    FROM reports
    ${whereSQL}
    GROUP BY grid_lat, grid_lng
    ORDER BY count DESC;
  `;

    const rows = await sequelize.query(sql, {
        replacements,
        type: QueryTypes.SELECT,
    });

    return rows.map((row) => ({
        gridLat: row.grid_lat !== null ? parseFloat(parseFloat(row.grid_lat).toFixed(6)) : null,
        gridLng: row.grid_lng !== null ? parseFloat(parseFloat(row.grid_lng).toFixed(6)) : null,
        count: parseInt(row.count, 10),
        dominantCategory: row.dominant_category ?? null,
    }));
};