import { deleteTempFilesFromRequest } from '../../shared/file-upload.js';

const MAX_IMAGES = 3;
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

const requestFilesHaveAllowedTypes = (files = []) =>
  files.every((file) => ALLOWED_MIME_TYPES.includes(file.mimetype));

const rejectAndCleanTempFiles = (req, res, status, payload) => {
  deleteTempFilesFromRequest(req);
  return res.status(status).json(payload);
};

// Middleware que valida el límite de imágenes por reporte.
// - Si req.report existe, verifica que las imágenes existentes más las nuevas no superen el máximo.
// - Si se está creando un reporte nuevo, verifica que req.files no tenga más de MAX_IMAGES.
export const validateReportImages = (req, res, next) => {
  try {
    const newFiles = req.files ?? [];
    const newFilesCount = newFiles.length;

    if (!requestFilesHaveAllowedTypes(newFiles)) {
      return rejectAndCleanTempFiles(req, res, 400, {
        success: false,
        message: 'Tipo de archivo no permitido en el reporte',
        error: 'Las imágenes del reporte deben ser JPEG, JPG, PNG o WebP',
      });
    }

    if (req.report) {
      const existingImagesCount = req.report.Images?.length || 0;

      if (existingImagesCount + newFilesCount > MAX_IMAGES) {
        return rejectAndCleanTempFiles(req, res, 400, {
          success: false,
          message: 'Un reporte puede tener máximo 3 imágenes',
        });
      }
    } else if (newFilesCount > MAX_IMAGES) {
      return rejectAndCleanTempFiles(req, res, 400, {
        success: false,
        message: 'Un reporte puede tener máximo 3 imágenes',
      });
    }

    next();
  } catch (error) {
    deleteTempFilesFromRequest(req);
    console.error('Error en validateReportImages:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor.' });
  }
};

// Middleware que valida que req.file exista y sea de tipo MIME permitido.
export const validateSingleReportImage = (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere una imagen para el análisis',
      });
    }

    if (!ALLOWED_MIME_TYPES.includes(req.file.mimetype)) {
      return rejectAndCleanTempFiles(req, res, 400, {
        success: false,
        message: 'Tipo de archivo no permitido',
        error: 'Solo se permiten imágenes JPEG, JPG, PNG o WebP',
      });
    }

    next();
  } catch (error) {
    deleteTempFilesFromRequest(req);
    console.error('Error en validateSingleReportImage:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor.' });
  }
};