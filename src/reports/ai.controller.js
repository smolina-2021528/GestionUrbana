import { analyzeReportImage } from '../../helpers/gemini-service.js';
import { geocodeAddress }     from '../../helpers/nominatim-service.js';
import { deleteTempFile }     from '../../helpers/ai-file-helper.js';
import {
    buildAnalysisResponse,
    buildAiErrorResponse,
} from '../../helpers/ai-helpers.js';

export const analyzeReport = async (req, res) => {
    // ── 1. Verificar que se subió exactamente una imagen ───────────────────
    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: 'Se requiere exactamente una imagen para el análisis.',
        });
    }

    // ── 2. Leer address del body ───────────────────────────────────────────
    const { address } = req.body;

    if (!address || address.trim() === '') {
        deleteTempFile(req.file.path);
        return res.status(400).json({
            success: false,
            message: 'El campo address es obligatorio.',
        });
    }

    let geminiResult;
    let nominatimResult;

    try {
        [geminiResult, nominatimResult] = await Promise.all([
            analyzeReportImage(req.file.path),
            geocodeAddress(address.trim()),
        ]);
    } catch (error) {
        // El único error que puede llegar aquí es de Gemini — Nominatim nunca lanza.
        deleteTempFile(req.file.path);
        return res.status(422).json(
            buildAiErrorResponse('gemini', error.message)
        );
    }

    // ── 5. Limpiar el archivo temporal ─────────────────────────────────────
    deleteTempFile(req.file.path);

    // ── 6. Retornar 200 con el análisis ────────────────────────────────────
    return res.status(200).json(
        buildAnalysisResponse(geminiResult, nominatimResult)
    );
};