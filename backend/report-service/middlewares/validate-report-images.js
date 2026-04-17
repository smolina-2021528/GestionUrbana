const MAX_IMAGES = 3;
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// Middleware que valida el límite de imágenes por reporte.
// - Si req.report existe verifica que las imágenes existentes más las nuevas no superen el máximo.
// - Si se está creando un reporte nuevo, verifica que req.files no tenga más de MAX_IMAGES.
export const validateReportImages = (req, res, next) => {
  try {
    const newFilesCount = req.files?.length ?? 0;

    if (req.report) {
      // si se actualiza un reporte, aqui vamos a verificar imágenes existentes y nuevas
    const existingImagesCount = req.report.Images?.length ?? 0;

    if (existingImagesCount + newFilesCount > MAX_IMAGES) {
        return res.status(400).json({
        success: false,
        message: 'Un reporte puede tener máximo 3 imágenes',
        });
    }
    } else {
      // si se esta creando, solo va a verificar las nuevas
    if (newFilesCount > MAX_IMAGES) {
        return res.status(400).json({
        success: false,
        message: 'Un reporte puede tener máximo 3 imágenes',
        });
    }
    }

    next();
} catch (error) {
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
      return res.status(400).json({
        success: false,
        message: 'Tipo de archivo no permitido',
        error: 'Solo se permiten imágenes (JPEG, PNG, WebP)',
      });
    }

    next();
  } catch (error) {
    console.error('Error en validateSingleReportImage:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor.' });
  }
};