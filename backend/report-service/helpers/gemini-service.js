import fs from 'fs';
import path from 'path';
import { geminiModel } from '../configs/gemini-config.js';
import {
    GEMINI_ANALYZE_PROMPT,
    AI_REPORT_CATEGORIES,
    AI_REPORT_PRIORITIES,
} from './ai-constants.js';
import { cacheGet, cacheSet } from './ai-cache.js';

// Mapeo de extensiones a MIME types soportados
const MIME_TYPES = {
    '.jpg':  'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png':  'image/png',
    '.webp': 'image/webp',
};

/**
 * Detecta el MIME type a partir de la extensiÃ³n del archivo.
 * Lanza un error si la extensiÃ³n no estÃ¡ soportada.
 */
const getMimeType = (filePath) => {
    const ext = path.extname(filePath).toLowerCase();
    const mimeType = MIME_TYPES[ext];

    if (!mimeType) {
        throw new Error(
            `Tipo de archivo no soportado: "${ext}". Se permiten: jpg, jpeg, png, webp.`
        );
    }

    return mimeType;
};

/**
 * Valida y normaliza el objeto retornado por Gemini.
 * Retorna el objeto limpio y normalizado.
 */
const validateGeminiResponse = (parsed) => {
    if (!parsed || typeof parsed !== 'object') {
        throw new Error('Gemini no retornÃ³ un JSON vÃ¡lido');
    }

    const { title, description, category, priority } = parsed;

    if (!title || typeof title !== 'string' || title.trim() === '') {
        throw new Error('Gemini no retornÃ³ un JSON vÃ¡lido: falta el campo "title"');
    }

    if (!description || typeof description !== 'string' || description.trim() === '') {
        throw new Error('Gemini no retornÃ³ un JSON vÃ¡lido: falta el campo "description"');
    }

    const normalizedCategory = AI_REPORT_CATEGORIES.includes(category)
        ? category
        : 'INFRAESTRUCTURA';

    const normalizedPriority = AI_REPORT_PRIORITIES.includes(priority)
        ? priority
        : 'BAJA';

    return {
        title:       title.trim().slice(0, 150),
        description: description.trim().slice(0, 2000),
        category:    normalizedCategory,
        priority:    normalizedPriority,
    };
};

// FunciÃ³n principal para analizar la imagen de un reporte usando Gemini
export const analyzeReportImage = async (imagePath) => {
    // 1. Intentar servir desde cachÃ©
    const cached = cacheGet(imagePath);
    if (cached) {
        return cached;
    }

    const mimeType  = getMimeType(imagePath);
    const imageData = fs.readFileSync(imagePath);
    const base64    = imageData.toString('base64');

    const imagePart = {
        inlineData: {
            data:     base64,
            mimeType,
        },
    };

    const result       = await geminiModel.generateContent([GEMINI_ANALYZE_PROMPT, imagePart]);
    const rawText      = result.response.text();

    const cleanedText  = rawText
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/\s*```$/,           '')
        .trim();

    let parsed;
    try {
        parsed = JSON.parse(cleanedText);
    } catch {
        throw new Error(
            `Gemini no retornÃ³ un JSON vÃ¡lido. Respuesta recibida: "${rawText.slice(0, 200)}"`
        );
    }

    const validated = validateGeminiResponse(parsed);

    // 2. Guardar en cachÃ© antes de retornar
    cacheSet(imagePath, validated);

    return validated;
};
