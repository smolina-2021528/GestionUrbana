import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;
const modelName = process.env.GEMINI_MODEL ?? 'gemini-1.5-flash';

if (!apiKey) {
throw new Error(
    '[gemini-config] GEMINI_API_KEY no está definida en las variables de entorno. ' +
    'Agrega GEMINI_API_KEY a tu archivo .env antes de arrancar el servidor.'
);
}

export const geminiModel = new GoogleGenerativeAI(apiKey).getGenerativeModel({ model: modelName });

export const getGeminiModel = () => geminiModel;