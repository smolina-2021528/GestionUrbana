import { analyzeReportImage } from '../../helpers/gemini-service.js';
import { geocodeAddress } from '../../helpers/nominatim-service.js';
import { deleteTempFile } from '../../helpers/ai-file-helper.js';
import { uploadReportImage, deleteImage } from '../../../shared/cloudinary-service.js';
import { createAiReport } from '../../helpers/ai-report-db.js';
import { findReportById } from '../../helpers/report-db.js';
import { sequelize } from '../../configs/db.js';
import {
  buildAnalysisResponse,
  buildAiErrorResponse,
  buildAiReportResponse,
} from '../../helpers/ai-helpers.js';

const rollbackIfActive = async (transaction) => {
  if (transaction && !transaction.finished) {
    await transaction.rollback();
  }
};

export const analyzeReport = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'Se requiere exactamente una imagen para el análisis.',
    });
  }

  const { address } = req.body;

  if (!address || address.trim() === '') {
    deleteTempFile(req.file.path);
    return res.status(400).json({
      success: false,
      message: 'El campo address es obligatorio.',
    });
  }

  try {
    const [geminiResult, nominatimResult] = await Promise.all([
      analyzeReportImage(req.file.path),
      geocodeAddress(address.trim()),
    ]);

    return res.status(200).json(
      buildAnalysisResponse(geminiResult, nominatimResult),
    );
  } catch (error) {
    return res.status(422).json(
      buildAiErrorResponse('gemini', error.message),
    );
  } finally {
    deleteTempFile(req.file.path);
  }
};

export const aiCreateReport = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'Se requiere exactamente una imagen para crear el reporte.',
    });
  }

  const { address } = req.body;
  const trimmedAddress = address?.trim() ?? '';

  let geminiResult;
  let nominatimResult;

  try {
    [geminiResult, nominatimResult] = await Promise.all([
      analyzeReportImage(req.file.path),
      trimmedAddress ? geocodeAddress(trimmedAddress) : Promise.resolve(null),
    ]);
  } catch (error) {
    deleteTempFile(req.file.path);
    return res.status(422).json(
      buildAiErrorResponse('gemini', error.message),
    );
  }

  let imageUrl;
  let publicId;

  try {
    const uploaded = await uploadReportImage(req.file.path, req.file.filename);
    imageUrl = uploaded.fileName;
    publicId = uploaded.publicId;
  } catch (error) {
    deleteTempFile(req.file.path);
    return res.status(422).json(
      buildAiErrorResponse('cloudinary', error.message),
    );
  }

  let transaction;
  let committed = false;
  let reportId;

  try {
    transaction = await sequelize.transaction();

    reportId = await createAiReport(
      {
        title: geminiResult.title,
        description: geminiResult.description,
        category: geminiResult.category,
        priority: geminiResult.priority,
        latitude: nominatimResult?.latitude ?? null,
        longitude: nominatimResult?.longitude ?? null,
        address: nominatimResult?.address ?? address ?? null,
        imageUrl,
        imagePublicId: publicId,
        aiRaw: JSON.stringify(geminiResult),
      },
      req.userId,
      transaction,
    );

    await transaction.commit();
    committed = true;
  } catch (error) {
    await rollbackIfActive(transaction);

    if (!committed && publicId) {
      await deleteImage(publicId).catch((err) =>
        console.error('[aiCreateReport] Error eliminando imagen de Cloudinary tras rollback:', err.message),
      );
    }

    console.error('[aiCreateReport] Error creando reporte:', error.message);
    return res.status(500).json(
      buildAiErrorResponse('database', error.message),
    );
  }

  try {
    const fullReport = await findReportById(reportId);

    return res.status(201).json(
      buildAiReportResponse(fullReport),
    );
  } catch (error) {
    console.error('[aiCreateReport] Error obteniendo reporte creado:', error.message);
    return res.status(500).json(
      buildAiErrorResponse('database', error.message),
    );
  }
};