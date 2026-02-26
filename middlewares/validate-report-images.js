const MAX_IMAGES = 3;

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