import { isAIEnabled, isGeminiConfigured } from '../configs/gemini-config.js';

export const requireAIEnabled = (req, res, next) => {
  if (!isAIEnabled()) {
    return res.status(503).json({
      success: false,
      message: 'El servicio de análisis con IA no está habilitado en este entorno.',
    });
  }

  if (!isGeminiConfigured()) {
    return res.status(503).json({
      success: false,
      message: 'El servicio de análisis con IA no está configurado. Falta GEMINI_API_KEY.',
    });
  }

  next();
};