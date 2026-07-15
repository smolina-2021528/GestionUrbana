import { GoogleGenerativeAI } from '@google/generative-ai';

const TRUE_VALUES = new Set(['true', '1', 'yes', 'on']);

let cachedModel = null;
let cachedApiKey = null;
let cachedModelName = null;

const normalizeEnvValue = (value) => String(value ?? '').trim().toLowerCase();

const buildAIConfigurationError = (message, code) => {
  const error = new Error(message);
  error.code = code;
  error.statusCode = 503;
  return error;
};

export const isAIEnabled = () => TRUE_VALUES.has(normalizeEnvValue(process.env.AI_ENABLED));

export const getGeminiModelName = () => process.env.GEMINI_MODEL?.trim() || 'gemini-1.5-flash';

export const isGeminiConfigured = () => Boolean(process.env.GEMINI_API_KEY?.trim());

export const getAIStatus = () => ({
  enabled: isAIEnabled(),
  geminiConfigured: isGeminiConfigured(),
  model: getGeminiModelName(),
});

export const getGeminiModel = () => {
  if (!isAIEnabled()) {
    throw buildAIConfigurationError(
      'El servicio de IA no está habilitado en este entorno. Configura AI_ENABLED=true para usar Gemini.',
      'AI_DISABLED',
    );
  }

  const apiKey = process.env.GEMINI_API_KEY?.trim();

  if (!apiKey) {
    throw buildAIConfigurationError(
      'GEMINI_API_KEY no está definida. Agrega la llave al archivo .env para usar las funciones de IA.',
      'GEMINI_API_KEY_MISSING',
    );
  }

  const modelName = getGeminiModelName();

  if (!cachedModel || cachedApiKey !== apiKey || cachedModelName !== modelName) {
    cachedApiKey = apiKey;
    cachedModelName = modelName;
    cachedModel = new GoogleGenerativeAI(apiKey).getGenerativeModel({ model: modelName });
  }

  return cachedModel;
};