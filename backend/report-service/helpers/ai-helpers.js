import { buildEvidenceValidation } from './evidence-validation.js';
import { buildReportGeoResponse } from '../utils/geo-helpers.js';

/**
 * Construye la respuesta del endpoint POST /analyze.
 */
export const buildAnalysisResponse = (geminiResult, nominatimResult, context = {}) => {
    const locationFound = nominatimResult !== null && nominatimResult !== undefined;

    return {
        success: true,
        analysis: {
            title: geminiResult.title,
            description: geminiResult.description,
            category: geminiResult.category,
            priority: geminiResult.priority,
        },
        evidenceValidation: buildEvidenceValidation(geminiResult, context),
        location: {
            latitude: locationFound ? (nominatimResult.latitude ?? null) : null,
            longitude: locationFound ? (nominatimResult.longitude ?? null) : null,
            address: locationFound ? (nominatimResult.address ?? null) : null,
            found: locationFound,
        },
        ready: locationFound,
    };
};

/**
 * Construye la respuesta del endpoint POST /ai-create.
 * Extiende buildReportGeoResponse añadiendo el flag aiGenerated: true
 * para que el frontend distinga reportes creados automáticamente por IA.
 */
export const buildAiReportResponse = (report) => {
    return {
        ...buildReportGeoResponse(report),
        aiGenerated: true,
    };
};

/**
 * Construye una respuesta de error estandarizada para los endpoints de IA,
 * indicando en qué etapa del pipeline falló el proceso.
 */
export const buildAiErrorResponse = (stage, message) => {
    return {
        success: false,
        stage,
        message,
    };
};
