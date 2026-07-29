import fs from 'fs';
import path from 'path';
import { getGeminiModel } from '../configs/gemini-config.js';
import {
  GEMINI_ANALYZE_PROMPT,
  AI_REPORT_CATEGORIES,
  AI_REPORT_PRIORITIES,
} from './ai-constants.js';
import { cacheGet, cacheSet } from './ai-cache.js';

// Mapeo de extensiones a MIME types soportados
const MIME_TYPES = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
};

/**
 * Detecta el MIME type a partir de la extensión del archivo.
 * Lanza un error si la extensión no está soportada.
 */
const getMimeType = (filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  const mimeType = MIME_TYPES[ext];

  if (!mimeType) {
    throw new Error(
      `Tipo de archivo no soportado: "${ext}". Se permiten: jpg, jpeg, png, webp.`,
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
    throw new Error('Gemini no retornó un JSON válido');
  }

  const { title, description, category, priority } = parsed;

  if (!title || typeof title !== 'string' || title.trim() === '') {
    throw new Error('Gemini no retornó un JSON válido: falta el campo "title"');
  }

  if (!description || typeof description !== 'string' || description.trim() === '') {
    throw new Error('Gemini no retornó un JSON válido: falta el campo "description"');
  }

  const normalizedCategory = AI_REPORT_CATEGORIES.includes(category)
    ? category
    : 'INFRAESTRUCTURA';

  const normalizedPriority = AI_REPORT_PRIORITIES.includes(priority)
    ? priority
    : 'BAJA';

  return {
    title: title.trim().slice(0, 150),
    description: description.trim().slice(0, 2000),
    category: normalizedCategory,
    priority: normalizedPriority,
  };
};

// Función principal para analizar la imagen de un reporte usando Gemini
export const analyzeReportImage = async (imagePath) => {
  const geminiModel = getGeminiModel();

  // 1. Intentar servir desde caché
  const cached = cacheGet(imagePath);
  if (cached) {
    return cached;
  }

  let mimeType;
  let base64;

  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    const response = await fetch(imagePath);
    if (!response.ok) {
      throw new Error(`No se pudo descargar la imagen remota de Cloudinary para análisis: ${response.statusText}`);
    }
    mimeType = response.headers.get('content-type');
    const arrayBuffer = await response.arrayBuffer();
    base64 = Buffer.from(arrayBuffer).toString('base64');
  } else {
    mimeType = getMimeType(imagePath);
    const imageData = fs.readFileSync(imagePath);
    base64 = imageData.toString('base64');
  }

  const imagePart = {
    inlineData: {
      data: base64,
      mimeType,
    },
  };

  const result = await geminiModel.generateContent([GEMINI_ANALYZE_PROMPT, imagePart]);
  const rawText = result.response.text();

  const cleanedText = rawText
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim();

  let parsed;
  try {
    parsed = JSON.parse(cleanedText);
  } catch {
    throw new Error(
      `Gemini no retornó un JSON válido. Respuesta recibida: "${rawText.slice(0, 200)}"`,
    );
  }

  const validated = validateGeminiResponse(parsed);

  // 2. Guardar en caché antes de retornar
  cacheSet(imagePath, validated);

  return validated;
};