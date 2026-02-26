import { sequelize } from '../../configs/db.js';
import { Report } from './report.model.js';
import { ReportImage } from './report-image.model.js';
import { ReportStatusHistory } from './report-status-history.model.js';
import { findReportById } from '../../helpers/report-db.js';
import { uploadReportImage, deleteImage } from '../../helpers/cloudinary-service.js';
import { buildReportResponse } from '../../utils/report-helpers.js';
import { DEFAULT_PRIORITY, DEFAULT_STATUS } from '../../helpers/report-constants.js';

// POST /api/reports
// Crea un nuevo reporte con sus imágenes dentro de una transacción.
export const createReport = async (req, res) => {
  const transaction = await sequelize.transaction();
  const uploadedImages = []; 

  try {
    const { title, description, category } = req.body;

    // Crear el registro del reporte
    const report = await Report.create(
      {
        Title: title,
        Description: description,
        Category: category,
        Priority: DEFAULT_PRIORITY,
        Status: DEFAULT_STATUS,
        UserId: req.userId,
      },
      { transaction }
    );

    // Subir y registrar imágenes (máx. 3)
    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        const { fileName, publicId } = await uploadReportImage(file.path, file.filename);

        uploadedImages.push(publicId);

        await ReportImage.create(
          {
            ReportId: report.Id,
            ImageUrl: fileName,
            PublicId: publicId,
            Order: i,
          },
          { transaction }
        );
      }
    }

    // Crear el primer registro en el historial de estados
    await ReportStatusHistory.create(
      {
        ReportId: report.Id,
        PreviousStatus: null,
        NewStatus: DEFAULT_STATUS,
        ChangedBy: req.userId,
      },
      { transaction }
    );

    //  Confirmar la transacción
    await transaction.commit();

    // Recargar el reporte completo con todas sus asociaciones
    const fullReport = await findReportById(report.Id);

    return res.status(201).json({
      success: true,
      message: 'Reporte creado exitosamente.',
      data: buildReportResponse(fullReport),
    });
  } catch (error) {
    // Revertir la transacción
    await transaction.rollback();

    // Eliminar de Cloudinary las imágenes que ya se hayan subido
    for (const publicId of uploadedImages) {
      await deleteImage(publicId);
    }

    console.error('Error en createReport:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al crear el reporte.',
    });
  }
};


