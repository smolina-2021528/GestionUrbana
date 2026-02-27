  import { sequelize } from '../../configs/db.js';
  import { Report } from './report.model.js';
  import { ReportImage } from './report-image.model.js';
  import { ReportStatusHistory } from './report-status-history.model.js';
  import { User } from '../users/user.model.js';
  import {
  findReportById,
  deleteReport as deleteReportDB,
  updateReportStatus,
} from '../../helpers/report-db.js';
  import { uploadReportImage, deleteImage } from '../../helpers/cloudinary-service.js';
  import { buildReportResponse } from '../../utils/report-helpers.js';
  import { DEFAULT_PRIORITY, DEFAULT_STATUS } from '../../helpers/report-constants.js';
  import { getUserRoleNames } from '../../helpers/role-helpers.js';

  export const createReport = async (req, res) => {
    const transaction = await sequelize.transaction();
    const uploadedImages = [];

    try {
      const { title, description, category } = req.body;

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

      await ReportStatusHistory.create(
        {
          ReportId: report.Id,
          PreviousStatus: null,
          NewStatus: DEFAULT_STATUS,
          ChangedBy: req.userId,
        },
        { transaction }
      );

      await transaction.commit();

      const fullReport = await findReportById(report.Id);

      return res.status(201).json({
        success: true,
        message: 'Reporte creado exitosamente.',
        data: buildReportResponse(fullReport),
      });
    } catch (error) {
      await transaction.rollback();

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

  export const getReportById = async (req, res) => {
    try {
      const report = await findReportById(req.params.reportId);

      if (!report) {
        return res.status(404).json({
          success: false,
          message: 'Reporte no encontrado.',
        });
      }

      return res.status(200).json({
        success: true,
        data: buildReportResponse(report),
      });
    } catch (error) {
      console.error('Error en getReportById:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al obtener el reporte.',
      });
    }
  };

export const getAllReports = async (req, res) => {
  try {
    let { page = 1, limit = 10, category, priority, status } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1) limit = 10;
    if (limit > 50) limit = 50;

    const offset = (page - 1) * limit;

    const filters = {};
    if (category) filters.category = category;
    if (priority) filters.priority = priority;
    if (status) filters.status = status;

    const { count, rows } = await findAllReports(filters, { limit, offset });

    const reports = rows.map((report) => buildReportResponse(report));

    const totalPages = Math.ceil(count / limit);

    return res.status(200).json({
      success: true,
      data: reports,
      pagination: {
        total: count,
        page,
        limit,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Error en getAllReports:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener los reportes.',
    });
  }
};

  export const deleteReport = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
      const report = req.report;
      const userRole = req.userRole;
      const userId = req.userId;

      const isOwner = report.UserId === userId;
      const isAdmin = userRole === 'ADMIN_ROLE';

      if (!isOwner && !isAdmin) {
        await transaction.rollback();
        return res.status(403).json({
          success: false,
          message: 'No tienes permiso para eliminar este reporte.',
        });
      }

      if (isOwner && report.Status !== 'PENDIENTE') {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: 'Solo puedes eliminar reportes en estado PENDIENTE.',
        });
      }

      const images = await deleteReportDB(report.Id, transaction);

      await transaction.commit();

      if (images && images.length > 0) {
        setImmediate(async () => {
          for (const image of images) {
            try {
              await deleteImage(image.PublicId);
            } catch (err) {
              console.error('Error eliminando imagen de Cloudinary:', err);
            }
          }
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Reporte eliminado exitosamente.',
      });
    } catch (error) {
      await transaction.rollback();
      console.error('Error en deleteReport:', error);

      return res.status(500).json({
        success: false,
        message: 'Error al eliminar el reporte.',
      });
    }
};


export const getMyReports = async (req, res) => {
  try {
    let { page = 1, limit = 10 } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1) limit = 10;
    if (limit > 50) limit = 50;

    const offset = (page - 1) * limit;

    const { count, rows } = await findReportsByUser(req.userId, { limit, offset });

    const reports = rows.map((report) => buildReportResponse(report));

    const totalPages = Math.ceil(count / limit);

    return res.status(200).json({
      success: true,
      data: reports,
      pagination: {
        total: count,
        page,
        limit,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Error en getMyReports:', error);

    return res.status(500).json({
      success: false,
      message: 'Error al obtener tus reportes.',
    });
  }
};

  export const updateReport = async (req, res) => {
    const transaction = await sequelize.transaction();
    const uploadedImages = [];

    try {
      const report = req.report;

      if (report.Status !== 'PENDIENTE') {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: 'Solo se pueden editar reportes en estado PENDIENTE',
        });
      }

      const { title, description, category } = req.body;

      const updateData = {};
      if (title) updateData.Title = title;
      if (description) updateData.Description = description;
      if (category) updateData.Category = category;

      if (Object.keys(updateData).length > 0) {
        await report.update(updateData, { transaction });
      }

      if (req.files && req.files.length > 0) {
        const currentImageCount = report.Images?.length || 0;

        for (let i = 0; i < req.files.length; i++) {
          const file = req.files[i];

          const { fileName, publicId } = await uploadReportImage(file.path, file.filename);

          uploadedImages.push(publicId);

          await ReportImage.create(
            {
              ReportId: report.Id,
              ImageUrl: fileName,
              PublicId: publicId,
              Order: currentImageCount + i,
            },
            { transaction }
          );
        }
      }

      await transaction.commit();

      const updatedReport = await findReportById(report.Id);

      return res.status(200).json({
        success: true,
        message: 'Reporte actualizado exitosamente.',
        data: buildReportResponse(updatedReport),
      });
    } catch (error) {
      await transaction.rollback();

      for (const publicId of uploadedImages) {
        try {
          await deleteImage(publicId);
        } catch (err) {
          console.error('Error limpiando imagen tras fallo:', err);
        }
      }

      console.error('Error en updateReport:', error);

      return res.status(500).json({
        success: false,
        message: 'Error al actualizar el reporte.',
      });
    }
};

export const changeReportStatus = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { reportId } = req.params;
    const { status: newStatus, notes } = req.body;

    if (req.userRole !== 'ADMIN_ROLE') {
      await transaction.rollback();
      return res.status(403).json({
        success: false,
        message: 'Solo los administradores pueden cambiar el estado del reporte.',
      });
    }

    const report = await findReportById(reportId);

    if (!report) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Reporte no encontrado.',
      });
    }

    const currentStatus = report.Status;

    const allowedTransitions = {
      PENDIENTE: ['EN_PROCESO', 'RECHAZADO'],
      EN_PROCESO: ['RESUELTO', 'RECHAZADO', 'PENDIENTE'],
      RESUELTO: [],
      RECHAZADO: ['PENDIENTE'],
    };

    if (!allowedTransitions[currentStatus]) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Estado actual inválido.',
      });
    }

    if (!allowedTransitions[currentStatus].includes(newStatus)) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: `No se puede cambiar de ${currentStatus} a ${newStatus}.`,
      });
    }

    const updatedReport = await updateReportStatus(
      reportId,
      newStatus,
      req.userId,
      notes,
      transaction
    );

    await transaction.commit();

    return res.status(200).json({
      success: true,
      message: 'Estado actualizado correctamente.',
      data: buildReportResponse(updatedReport),
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error en changeReportStatus:', error);

    return res.status(500).json({
      success: false,
      message: 'Error al cambiar el estado del reporte.',
    });
  }
};

export const getReportStatusHistory = async (req, res) => {
  try {
    const { reportId } = req.params;

    const report = await findReportById(reportId);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Reporte no encontrado.',
      });
    }

    const history = await ReportStatusHistory.findAll({
      where: { ReportId: reportId },
      order: [['created_at', 'ASC']],
      include: [
        {
          model: User,
          as: 'ChangedByUser',
          attributes: ['Id', 'Name', 'Surname', 'Username'],
        },
      ],
    });

    const formattedHistory = history.map((entry) => ({
      id: entry.Id,
      previousStatus: entry.PreviousStatus,
      newStatus: entry.NewStatus,
      notes: entry.Notes ?? null,
      createdAt: entry.CreatedAt,
      changedBy: entry.ChangedByUser
        ? {
            id: entry.ChangedByUser.Id,
            name: entry.ChangedByUser.Name,
            surname: entry.ChangedByUser.Surname,
            username: entry.ChangedByUser.Username,
          }
        : null,
    }));

    return res.status(200).json({
      success: true,
      data: formattedHistory,
    });
  } catch (error) {
    console.error('Error en getReportStatusHistory:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener el historial de estados.',
    });
  }
};

export const deleteReportImage = async (req, res) => {
  try {
    const { reportId, imageId } = req.params;

    const image = await ReportImage.findOne({
      where: { Id: imageId, ReportId: reportId },
    });

    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Imagen no encontrada o no pertenece a este reporte.',
      });
    }

    const report = await findReportById(reportId);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Reporte no encontrado.',
      });
    }

    const isOwner = report.UserId === req.userId;
    const isAdmin = req.userRole === 'ADMIN_ROLE';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para eliminar imágenes de este reporte.',
      });
    }

    const publicId = image.PublicId;
    await image.destroy();

    if (publicId) {
      try {
        await deleteImage(publicId);
      } catch (err) {
        console.error('Error al eliminar imagen de Cloudinary:', err);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Imagen eliminada exitosamente.',
    });
  } catch (error) {
    console.error('Error en deleteReportImage:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al eliminar la imagen.',
    });
  }
};

export const assignReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { assignedTo } = req.body;
    const report = await Report.findByPk(reportId);
    if (!report) {
      return res.status(404).json({
        ok: false,
        msg: 'Reporte no encontrado',
      });
    }

    const user = await User.findByPk(assignedTo);
    if (!user) {
      return res.status(404).json({
        ok: false,
        msg: 'Usuario a asignar no existe',
      });
    }

    const roles = await getUserRoleNames(user.Id);

    if (!roles.includes('ADMIN_ROLE')) {
      return res.status(400).json({
        ok: false,
        msg: 'El usuario no es personal municipal (ADMIN_ROLE)',
      });
    }

    report.AssignedTo = user.Id;
    await report.save();

    return res.status(200).json({
      ok: true,
      report,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      ok: false,
      msg: 'Error al asignar el reporte',
    });
  }
};