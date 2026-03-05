import ExcelJS from 'exceljs';
import { formatDateForExport } from './date-helpers.js';

// ─── Helpers internos ─────────────────────────────────────────────────────────

// Colores para el estilo del header del Excel
const HEADER_BG_COLOR = '1E3A5F';
const HEADER_FONT_COLOR = 'FFFFFF';

const mapReportToRow = (report) => {
    const citizenName = report.Citizen
        ? `${report.Citizen.Name ?? ''} ${report.Citizen.Surname ?? ''}`.trim()
        : '';

    const assignedTo = report.AssignedMunicipal
        ? `${report.AssignedMunicipal.Name ?? ''} ${report.AssignedMunicipal.Surname ?? ''}`.trim()
        : '';

    return {
        id: report.Id ?? '',
        title: report.Title ?? '',
        description: report.Description ?? '',
        category: report.Category ?? '',
        priority: report.Priority ?? '',
        status: report.Status ?? '',
        address: report.Address ?? '',
        latitude: report.Latitude != null ? parseFloat(report.Latitude) : '',
        longitude: report.Longitude != null ? parseFloat(report.Longitude) : '',
        createdAt: report.CreatedAt ?? null,
        resolvedAt: report.ResolvedAt ?? null,
        citizenName,
        assignedTo,
        commentCount: report.dataValues?.commentCount != null
            ? parseInt(report.dataValues.commentCount, 10)
            : 0,
    };
};

const escapeCsvValue = (value) => {
    if (value === null || value === undefined) return '';
    const str = String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
};

// ─── generateCsv ─────────────────────────────────────────────────────────────
export const generateCsv = (rows, columns) => {
    // Línea de headers
    const headerLine = columns.map((col) => escapeCsvValue(col.header)).join(',');

    // Líneas de datos
    const dataLines = rows.map((report) => {
        const mapped = mapReportToRow(report);

        return columns.map((col) => {
            const value = mapped[col.key];

            // Formatear fechas con la función centralizada
            if (col.key === 'createdAt' || col.key === 'resolvedAt') {
                return escapeCsvValue(formatDateForExport(value));
            }

            return escapeCsvValue(value);
        }).join(',');
    });

    return [headerLine, ...dataLines].join('\n');
};

// ─── generateXlsx ────────────────────────────────────────────────────────────
export const generateXlsx = (rows, columns) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Reportes');

    // ── Definir columnas ──────────────────────────────────────────────────────
    worksheet.columns = columns.map((col) => ({
        key: col.key,
        header: col.header,
        width: col.width,
    }));

    // ── Estilo del header (fila 1) ────────────────────────────────────────────
    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell) => {
        cell.font = {
            bold: true,
            color: { argb: `FF${HEADER_FONT_COLOR}` },
        };
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: `FF${HEADER_BG_COLOR}` },
        };
        cell.alignment = {
            vertical: 'middle',
            horizontal: 'center',
        };
    });
    headerRow.height = 20;

    // ── Borde ligero reutilizable ─────────────────────────────────────────────
    const thinBorder = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
    };

    // Claves de columnas que contienen fechas
    const dateCols = new Set(['createdAt', 'resolvedAt']);

    // ── Agregar filas de datos ────────────────────────────────────────────────
    for (const report of rows) {
        const mapped = mapReportToRow(report);

        // Construir el objeto de fila con valores finales
        const rowValues = {};
        for (const col of columns) {
            if (dateCols.has(col.key)) {
                const raw = mapped[col.key];
                if (raw) {
                    const d = raw instanceof Date ? raw : new Date(raw);
                    rowValues[col.key] = isNaN(d.getTime()) ? '' : d;
                } else {
                    rowValues[col.key] = '';
                }
            } else {
                rowValues[col.key] = mapped[col.key];
            }
        }

        const dataRow = worksheet.addRow(rowValues);

        // Aplicar bordes y formato de fecha celda a celda
        dataRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
            cell.border = thinBorder;

            // Formato de fecha en celdas de tipo Date
            if (cell.value instanceof Date) {
                cell.numFmt = 'DD/MM/YYYY HH:mm';
            }
        });
    }

    return workbook;
};

// ─── generateExportFile ───────────────────────────────────────────────────────
export const generateExportFile = (rows, format, columns) => {
    if (format === 'csv') {
        return {
            content: generateCsv(rows, columns),
            contentType: 'text/csv; charset=utf-8',
            isBuffer: false,
        };
    }

    return {
        content: generateXlsx(rows, columns),
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        isBuffer: true,
    };
};