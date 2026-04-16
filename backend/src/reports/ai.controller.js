import { analyzeReportImage }              from '../../helpers/gemini-service.js';
import { geocodeAddress }                  from '../../helpers/nominatim-service.js';
import { deleteTempFile }                  from '../../helpers/ai-file-helper.js';
import { uploadReportImage, deleteImage }  from '../../helpers/cloudinary-service.js';
import { createAiReport }                  from '../../helpers/ai-report-db.js';
import { findReportById }                  from '../../helpers/report-db.js';
import { sequelize }                       from '../../configs/db.js';
import {
    buildAnalysisResponse,
    buildAiErrorResponse,
    buildAiReportResponse,
} from '../../helpers/ai-helpers.js';

export const analyzeReport = async (req, res) => {
    // Verificar que se subió exactamente una imagen
    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: 'Se requiere exactamente una imagen para el análisis.',
        });
    }

    // Leer address del body
    const { address } = req.body;

    if (!address || address.trim() === '') {
        deleteTempFile(req.file.path);
        return res.status(400).json({
            success: false,
            message: 'El campo address es obligatorio.',
        });
    }

    // Gemini y Nominatim en paralelo
    let geminiResult;
    let nominatimResult;

    try {
        [geminiResult, nominatimResult] = await Promise.all([
            analyzeReportImage(req.file.path),
            geocodeAddress(address.trim()),
        ]);
    } catch (error) {
        // Solo Gemini puede lanzar — Nominatim nunca lo hace.
        deleteTempFile(req.file.path);
        return res.status(422).json(
            buildAiErrorResponse('gemini', error.message)
        );
    }

    // Limpiar archivo temporal
    deleteTempFile(req.file.path);

    // Retornar 200 
    return res.status(200).json(
        buildAnalysisResponse(geminiResult, nominatimResult)
    );
};

export const aiCreateReport = async (req, res) => {
    // Verificar que se subió exactamente una imagen
    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: 'Se requiere exactamente una imagen para crear el reporte.',
        });
    }

    // Leer address del body 
    const { address } = req.body;

    // Gemini y Nominatim en paralelo 
    let geminiResult;
    let nominatimResult;

    const trimmedAddress = address?.trim() ?? '';

    try {
        [geminiResult, nominatimResult] = await Promise.all([
            analyzeReportImage(req.file.path),
            trimmedAddress ? geocodeAddress(trimmedAddress) : Promise.resolve(null),
        ]);
    } catch (error) {
        // Gemini falló: limpiar temporal y abortar
        deleteTempFile(req.file.path);
        return res.status(422).json(
            buildAiErrorResponse('gemini', error.message)
        );
    }

    let imageUrl;
    let publicId;

    try {
        const uploaded = await uploadReportImage(req.file.path, req.file.filename);
        imageUrl  = uploaded.fileName;
        publicId  = uploaded.publicId;
    } catch (error) {
        deleteTempFile(req.file.path);
        return res.status(422).json(
            buildAiErrorResponse('cloudinary', error.message)
        );
    }

    // Limpiar archivo temporal
    deleteTempFile(req.file.path);

    //Transacción: crear reporte y hacer commit
    const transaction = await sequelize.transaction();

    let reportId;

    try {
        reportId = await createAiReport(
            {
                title:         geminiResult.title,
                description:   geminiResult.description,
                category:      geminiResult.category,
                priority:      geminiResult.priority,
                latitude:      nominatimResult?.latitude  ?? null,
                longitude:     nominatimResult?.longitude ?? null,
                address:       nominatimResult?.address   ?? address ?? null,
                imageUrl,
                imagePublicId: publicId,
                aiRaw:         JSON.stringify(geminiResult),
            },
            req.userId,
            transaction
        );

        await transaction.commit();
    } catch (error) {
        // Rollback + eliminar imagen de Cloudinary
        await transaction.rollback();
        await deleteImage(publicId).catch((err) =>
            console.error('[aiCreateReport] Error eliminando imagen de Cloudinary tras rollback:', err.message)
        );

        console.error('[aiCreateReport] Error creando reporte:', error.message);
        return res.status(500).json(
            buildAiErrorResponse('database', error.message)
        );
    }

    // Obtener reporte completo con includes 
    const fullReport = await findReportById(reportId);

    return res.status(201).json(
        buildAiReportResponse(fullReport)
    );
};