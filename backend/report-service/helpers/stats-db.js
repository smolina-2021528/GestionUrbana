import { QueryTypes, Op } from 'sequelize';
import { sequelize } from '../configs/db.js';
import { Report } from '../src/reports/report.model.js';
import { ReportImage } from '../src/reports/report-image.model.js';
import { ReportComment } from '../src/reports/report-comment.model.js';
import { ReportFollower } from '../src/reports/report-follower.model.js';
import { ReportStatusHistory } from '../src/reports/report-status-history.model.js';
import { User } from '../src/users/user-ref.model.js';
import {
  REPORT_STATUSES,
  REPORT_CATEGORIES,
  REPORT_PRIORITIES,
} from './report-constants.js';
import { EXPORT_MAX_ROWS } from './stats-constants.js';
import { buildDateWhereClause } from './date-helpers.js';

// ─── Helpers internos ─────────────────────────────────────────────────────────

/**
 * Construye la cláusula WHERE de Sequelize para un rango de fechas
 * sobre la columna created_at, con filtros opcionales de category y priority.
 */
const buildReportWhere = ({ startDate, endDate, category, priority, status } = {}) => {
  const where = {};

  if (startDate || endDate) {
    where.CreatedAt = {};
    if (startDate) where.CreatedAt[Op.gte] = new Date(startDate);
    if (endDate)   where.CreatedAt[Op.lte] = new Date(endDate);
  }

  if (category) where.Category = category;
  if (priority) where.Priority = priority;
  if (status)   where.Status   = status;

  return where;
};

/**
 * Devuelve { startDate, endDate } con los últimos N días si no se reciben fechas.
 */
const defaultDateRange = (startDate, endDate, days = 30) => {
  if (startDate || endDate) return { startDate, endDate };

  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - (days - 1));
  start.setHours(0, 0, 0, 0);

  return { startDate: start, endDate: end };
};

// ─── getDashboardMetrics ──────────────────────────────────────────────────────

/**
 * Query principal del dashboard.
 */
export const getDashboardMetrics = async (filters = {}) => {
  const { startDate, endDate, category, priority } = filters;

  // Cláusulas WHERE compartidas
  const baseWhere = buildReportWhere({ startDate, endDate, category, priority });
  const resolvedWhere = buildReportWhere({ startDate, endDate, category, priority, status: 'RESUELTO' });

  // Parámetros para la query raw de tiempo promedio de resolución
  const rawConditions = [];
  const rawReplacements = {};

  if (startDate) {
    rawConditions.push('r.created_at >= :startDate');
    rawReplacements.startDate = new Date(startDate);
  }
  if (endDate) {
    rawConditions.push('r.created_at <= :endDate');
    rawReplacements.endDate = new Date(endDate);
  }
  if (category) {
    rawConditions.push('r.category = :category');
    rawReplacements.category = category;
  }
  if (priority) {
    rawConditions.push('r.priority = :priority');
    rawReplacements.priority = priority;
  }

  const resolvedCondition = [...rawConditions, "r.status = 'RESUELTO'", 'r.resolved_at IS NOT NULL'];
  const resolvedWhereSQL = resolvedCondition.length
    ? `WHERE ${resolvedCondition.join(' AND ')}`
    : '';

  const commentConditions = [];
  const commentReplacements = {};

  if (startDate) {
    commentConditions.push('rep.created_at >= :startDate');
    commentReplacements.startDate = new Date(startDate);
  }
  if (endDate) {
    commentConditions.push('rep.created_at <= :endDate');
    commentReplacements.endDate = new Date(endDate);
  }

  const commentDateWhere = commentConditions.length
    ? `AND ${commentConditions.join(' AND ')}`
    : '';

  // Ejecutar todas las queries en paralelo ────────────────────────────────────
  const [
    total,
    pendiente,
    en_proceso,
    resuelto,
    rechazado,
    infraestructura,
    seguridad,
    limpieza,
    alta,
    media,
    baja,
    avgResolutionResult,
    withLocation,
    withoutLocation,
    totalComments,
    totalFollowers,
  ] = await Promise.all([

    // 1. Total de reportes en el rango
    Report.count({ where: baseWhere }),

    // 2. Conteo por estado
    Report.count({ where: { ...baseWhere, Status: 'PENDIENTE' } }),
    Report.count({ where: { ...baseWhere, Status: 'EN_PROCESO' } }),
    Report.count({ where: { ...baseWhere, Status: 'RESUELTO' } }),
    Report.count({ where: { ...baseWhere, Status: 'RECHAZADO' } }),

    // 3. Conteo por categoría
    Report.count({ where: { ...baseWhere, Category: 'INFRAESTRUCTURA' } }),
    Report.count({ where: { ...baseWhere, Category: 'SEGURIDAD' } }),
    Report.count({ where: { ...baseWhere, Category: 'LIMPIEZA' } }),

    // 4. Conteo por prioridad
    Report.count({ where: { ...baseWhere, Priority: 'ALTA' } }),
    Report.count({ where: { ...baseWhere, Priority: 'MEDIA' } }),
    Report.count({ where: { ...baseWhere, Priority: 'BAJA' } }),

    // 5. Tiempo promedio de resolución en horas (query raw)
    sequelize.query(
      `SELECT AVG(EXTRACT(EPOCH FROM (r.resolved_at - r.created_at)) / 3600) AS avg_hours
       FROM reports r
       ${resolvedWhereSQL}`,
      { replacements: rawReplacements, type: QueryTypes.SELECT }
    ),

    // 6. Reportes con ubicación
    Report.count({ where: { ...baseWhere, Location: { [Op.ne]: null } } }),

    // 7. Reportes sin ubicación
    Report.count({ where: { ...baseWhere, Location: null } }),

    // 8. Total de comentarios públicos en el rango
    sequelize.query(
  `SELECT COUNT(*) AS total
   FROM report_comments rc
   JOIN reports rep ON rc.report_id = rep.id
   WHERE rc.is_internal = false
   ${commentDateWhere}`,
  { replacements: commentReplacements, type: QueryTypes.SELECT }
),

    // 9. Total de seguidores activos (filas en report_followers)
    ReportFollower.count(),
  ]);

  // Calcular métricas derivadas ───────────────────────────────────────────────
  const resolutionRate =
    total > 0 ? parseFloat(((resuelto / total) * 100).toFixed(2)) : 0;

  const rawAvgHours = avgResolutionResult?.[0]?.avg_hours;
  const avgResolutionHours =
    rawAvgHours !== null && rawAvgHours !== undefined
      ? parseFloat(parseFloat(rawAvgHours).toFixed(2))
      : null;

  const totalCommentsCount = parseInt(totalComments?.[0]?.total ?? 0, 10);

  // Construir respuesta estructurada ─────────────────────────────────────────
  return {
    overview: {
      total,
      resolutionRate,
      avgResolutionHours,
    },
    byStatus: {
      PENDIENTE: pendiente,
      EN_PROCESO: en_proceso,
      RESUELTO: resuelto,
      RECHAZADO: rechazado,
    },
    byCategory: {
      INFRAESTRUCTURA: infraestructura,
      SEGURIDAD: seguridad,
      LIMPIEZA: limpieza,
    },
    byPriority: {
      ALTA: alta,
      MEDIA: media,
      BAJA: baja,
    },
    location: {
      withLocation,
      withoutLocation,
      coveragePercent:
        total > 0 ? parseFloat(((withLocation / total) * 100).toFixed(2)) : 0,
    },
    engagement: {
      totalPublicComments: totalCommentsCount,
      totalActiveFollowers: totalFollowers,
    },
  };
};

// ─── getReportTrends ──────────────────────────────────────────────────────────

/**
 * Evolución temporal de reportes creados agrupados por período.
 */
export const getReportTrends = async (filters = {}) => {
  let { startDate, endDate, groupBy = 'day', category, status } = filters;

  // Default: últimos 30 días si no vienen fechas
  ({ startDate, endDate } = defaultDateRange(startDate, endDate, 30));

  // Validar groupBy
  const validGroupBy = ['day', 'week', 'month'];
  const safeGroupBy = validGroupBy.includes(groupBy) ? groupBy : 'day';

  // Construir condiciones WHERE dinámicas
  const conditions = ['created_at BETWEEN :startDate AND :endDate'];
  const replacements = { startDate: new Date(startDate), endDate: new Date(endDate), groupBy: safeGroupBy };

  if (category) {
    conditions.push('category = :category');
    replacements.category = category;
  }
  if (status) {
    conditions.push('status = :status');
    replacements.status = status;
  }

  const whereSQL = conditions.join(' AND ');

  // DATE_TRUNC no acepta parámetros bind para el nombre del período,
  // por lo que interpolamos safeGroupBy directamente (ya validado contra whitelist).
  const rows = await sequelize.query(
    `SELECT DATE_TRUNC('${safeGroupBy}', created_at) AS period,
            COUNT(*) AS total
     FROM reports
     WHERE ${whereSQL}
     GROUP BY period
     ORDER BY period ASC`,
    { replacements, type: QueryTypes.SELECT }
  );

  return rows.map((row) => ({
    period: new Date(row.period),
    total: parseInt(row.total, 10),
  }));
};

// ─── getResolutionTimeSeries ──────────────────────────────────────────────────

/**
 * Evolución del tiempo promedio de resolución agrupado por período.
 */
export const getResolutionTimeSeries = async (filters = {}) => {
  let { startDate, endDate, groupBy = 'day', category } = filters;

  ({ startDate, endDate } = defaultDateRange(startDate, endDate, 30));

  const validGroupBy = ['day', 'week', 'month'];
  const safeGroupBy = validGroupBy.includes(groupBy) ? groupBy : 'day';

  const conditions = [
    'created_at BETWEEN :startDate AND :endDate',
    "status = 'RESUELTO'",
    'resolved_at IS NOT NULL',
  ];
  const replacements = {
    startDate: new Date(startDate),
    endDate: new Date(endDate),
  };

  if (category) {
    conditions.push('category = :category');
    replacements.category = category;
  }

  const whereSQL = conditions.join(' AND ');

  const rows = await sequelize.query(
    `SELECT DATE_TRUNC('${safeGroupBy}', created_at)                           AS period,
            AVG(EXTRACT(EPOCH FROM (resolved_at - created_at)) / 3600)         AS avg_hours
     FROM reports
     WHERE ${whereSQL}
     GROUP BY period
     ORDER BY period ASC`,
    { replacements, type: QueryTypes.SELECT }
  );

  return rows.map((row) => ({
    period: new Date(row.period),
    avgHours: row.avg_hours !== null ? parseFloat(parseFloat(row.avg_hours).toFixed(2)) : null,
  }));
};

// ─── getStatusTransitionStats ─────────────────────────────────────────────────

/**
 * Cuántos reportes pasaron de cada estado a cada otro en el rango.
 * Útil para detectar cuellos de botella en el flujo de trabajo. 
 */
export const getStatusTransitionStats = async (filters = {}) => {
  const { startDate, endDate } = filters;

  const conditions = [];
  const replacements = {};

  if (startDate) {
    conditions.push('created_at >= :startDate');
    replacements.startDate = new Date(startDate);
  }
  if (endDate) {
    conditions.push('created_at <= :endDate');
    replacements.endDate = new Date(endDate);
  }

  const whereSQL = conditions.length
    ? `WHERE ${conditions.join(' AND ')}`
    : '';

  const rows = await sequelize.query(
    `SELECT previous_status,
            new_status,
            COUNT(*) AS total
     FROM report_status_history
     ${whereSQL}
     GROUP BY previous_status, new_status
     ORDER BY total DESC`,
    { replacements, type: QueryTypes.SELECT }
  );

  return rows.map((row) => ({
    previousStatus: row.previous_status ?? null,
    newStatus: row.new_status,
    count: parseInt(row.total, 10),
  }));
};

// ─── getReportsForExport ──────────────────────────────────────────────────────

/**
 * Query optimizada para exportación masiva de reportes.
 * Carga solo los campos e includes mínimos necesarios y respeta el límite
 * de filas definido en EXPORT_MAX_ROWS para proteger al servidor.
 */
export const getReportsForExport = async (filters = {}) => {
  const { category, priority, status, startDate, endDate } = filters;

  // Construir cláusula WHERE ─────────────────────────────────────────────────
  const where = {};
  if (category) where.Category = category;
  if (priority) where.Priority = priority;
  if (status) where.Status = status;
  Object.assign(where, buildDateWhereClause(startDate, endDate));

  // Obtener el total real y las filas en paralelo ────────────────────────────
  const [total, rows] = await Promise.all([

    // Total sin límite — necesario para saber si se truncó
    Report.count({ where }),

    // Filas limitadas a EXPORT_MAX_ROWS con includes mínimos
    Report.findAll({
      where,

      // Subquery inline para el conteo de comentarios públicos
      attributes: {
        include: [
          [
            sequelize.literal(`(
              SELECT COUNT(*)::int
              FROM report_comments rc
              WHERE rc.report_id = "Report"."id"
                AND rc.is_internal = false
            )`),
            'commentCount',
          ],
        ],
      },

      include: [
        {
          model: User,
          as: 'Citizen',
          attributes: ['Name', 'Surname'],
        },
        {
          model: User,
          as: 'AssignedMunicipal',
          attributes: ['Name', 'Surname'],
          required: false,
        },
        // Solo la URL de la primera imagen (order ASC, separate para no
        // multiplicar filas del reporte en la query principal)
        {
          model: ReportImage,
          as: 'Images',
          attributes: ['ImageUrl', 'Order'],
          separate: true,
          order: [['order', 'ASC']],
        },
      ],

      order: [['created_at', 'DESC']],
      limit: EXPORT_MAX_ROWS,
    }),
  ]);

  return {
    rows,
    total,
    truncated: total > EXPORT_MAX_ROWS,
  };
};


