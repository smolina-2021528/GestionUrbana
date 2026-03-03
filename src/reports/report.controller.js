import { Op } from "sequelize";
import { sequelize } from "../../configs/db.js";
import { Report } from "./report.model.js";
import { ReportImage } from "./report-image.model.js";
import { ReportStatusHistory } from "./report-status-history.model.js";
import { User } from "../users/user.model.js";
import {
  notifyStatusChange,
  notifyReportAssigned,
} from "../../helpers/notification-service.js";
import {
  findReportById,
  findReportsByUser,
  findAllReports,
  deleteReport as deleteReportDB,
  updateReportStatus,
  searchReportsByText,
  buildLocationData,
  findReportsByProximity,
  getHeatmapData,
  findReportsByBoundingBox,
} from "../../helpers/report-db.js";
import {
  uploadReportImage,
  deleteImage,
} from "../../helpers/cloudinary-service.js";
import {
  buildReportGeoResponse,
  buildHeatmapPoint,
} from "../../utils/geo-helpers.js";
import {
  DEFAULT_PRIORITY,
  DEFAULT_STATUS,
  REPORT_STATUSES,
  REPORT_CATEGORIES,
  REPORT_PRIORITIES,
} from "../../helpers/report-constants.js";
import { getUserRoleNames } from "../../helpers/role-db.js";

// POST /api/reports
// Crea un nuevo reporte con sus imágenes dentro de una transacción.
export const createReport = async (req, res) => {
  const transaction = await sequelize.transaction();
  const uploadedImages = [];

  try {
    const { title, description, category, latitude, longitude, address } =
      req.body;

    const locationData = buildLocationData(latitude, longitude, address);

    const report = await Report.create(
      {
        Title: title,
        Description: description,
        Category: category,
        Priority: DEFAULT_PRIORITY,
        Status: DEFAULT_STATUS,
        UserId: req.userId,
        ...locationData,
      },
      { transaction },
    );

    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        const { fileName, publicId } = await uploadReportImage(
          file.path,
          file.filename,
        );

        uploadedImages.push(publicId);

        await ReportImage.create(
          {
            ReportId: report.Id,
            ImageUrl: fileName,
            PublicId: publicId,
            Order: i,
          },
          { transaction },
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
      { transaction },
    );

    await transaction.commit();

    const fullReport = await findReportById(report.Id);

    return res.status(201).json({
      success: true,
      message: "Reporte creado exitosamente.",
      data: buildReportGeoResponse(fullReport),
    });
  } catch (error) {
    await transaction.rollback();

    for (const publicId of uploadedImages) {
      await deleteImage(publicId);
    }

    console.error("Error en createReport:", error);
    return res.status(500).json({
      success: false,
      message: "Error al crear el reporte.",
    });
  }
};

// GET /api/reports/:reportId
// Devuelve un reporte por su ID.
export const getReportById = async (req, res) => {
  try {
    const report = await findReportById(req.params.reportId);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Reporte no encontrado.",
      });
    }

    return res.status(200).json({
      success: true,
      data: buildReportGeoResponse(report),
    });
  } catch (error) {
    console.error("Error en getReportById:", error);
    return res.status(500).json({
      success: false,
      message: "Error al obtener el reporte.",
    });
  }
};

// GET /api/reports
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

    const reports = rows.map((report) => buildReportGeoResponse(report));

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
    console.error("Error en getAllReports:", error);
    return res.status(500).json({
      success: false,
      message: "Error al obtener los reportes.",
    });
  }
};

// DELETE /api/reports/:reportId
export const deleteReport = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const report = req.report;
    const userRole = req.userRole;
    const userId = req.userId;

    const isOwner = report.UserId === userId;
    const isAdmin = userRole === "ADMIN_ROLE";

    if (!isOwner && !isAdmin) {
      await transaction.rollback();
      return res.status(403).json({
        success: false,
        message: "No tienes permiso para eliminar este reporte.",
      });
    }

    if (isOwner && report.Status !== "PENDIENTE") {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Solo puedes eliminar reportes en estado PENDIENTE.",
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
            console.error("Error eliminando imagen de Cloudinary:", err);
          }
        }
      });
    }

    return res.status(200).json({
      success: true,
      message: "Reporte eliminado exitosamente.",
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Error en deleteReport:", error);

    return res.status(500).json({
      success: false,
      message: "Error al eliminar el reporte.",
    });
  }
};

// GET /api/reports/me
// Lista los reportes del usuario autenticado.
export const getMyReports = async (req, res) => {
  try {
    let { page = 1, limit = 10 } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1) limit = 10;
    if (limit > 50) limit = 50;

    const offset = (page - 1) * limit;

    const { count, rows } = await findReportsByUser(req.userId, {
      limit,
      offset,
    });

    const reports = rows.map((report) => buildReportGeoResponse(report));

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
    console.error("Error en getMyReports:", error);

    return res.status(500).json({
      success: false,
      message: "Error al obtener tus reportes.",
    });
  }
};

// PUT /api/reports/:reportId
export const updateReport = async (req, res) => {
  const transaction = await sequelize.transaction();
  const uploadedImages = [];

  try {
    const report = req.report;

    if (report.Status !== "PENDIENTE") {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Solo se pueden editar reportes en estado PENDIENTE",
      });
    }

    const { title, description, category, latitude, longitude, address } =
      req.body;

    const updateData = {};
    if (title) updateData.Title = title;
    if (description) updateData.Description = description;
    if (category) updateData.Category = category;

    const locationData = buildLocationData(latitude, longitude, address);
    Object.assign(updateData, locationData);

    if (Object.keys(updateData).length > 0) {
      await report.update(updateData, { transaction });
    }

    if (req.files && req.files.length > 0) {
      const currentImageCount = report.Images?.length || 0;

      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];

        const { fileName, publicId } = await uploadReportImage(
          file.path,
          file.filename,
        );

        uploadedImages.push(publicId);

        await ReportImage.create(
          {
            ReportId: report.Id,
            ImageUrl: fileName,
            PublicId: publicId,
            Order: currentImageCount + i,
          },
          { transaction },
        );
      }
    }

    await transaction.commit();

    const updatedReport = await findReportById(report.Id);

    return res.status(200).json({
      success: true,
      message: "Reporte actualizado exitosamente.",
      data: buildReportGeoResponse(updatedReport),
    });
  } catch (error) {
    await transaction.rollback();

    for (const publicId of uploadedImages) {
      try {
        await deleteImage(publicId);
      } catch (err) {
        console.error("Error limpiando imagen tras fallo:", err);
      }
    }

    console.error("Error en updateReport:", error);

    return res.status(500).json({
      success: false,
      message: "Error al actualizar el reporte.",
    });
  }
};

export const changeReportStatus = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { reportId } = req.params;
    const { status: newStatus, notes } = req.body;

    if (req.userRole !== "ADMIN_ROLE") {
      await transaction.rollback();
      return res.status(403).json({
        success: false,
        message:
          "Solo los administradores pueden cambiar el estado del reporte.",
      });
    }

    const report = await findReportById(reportId);

    if (!report) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: "Reporte no encontrado.",
      });
    }

    const currentStatus = report.Status; // ya existía

    const allowedTransitions = {
      PENDIENTE: ["EN_PROCESO", "RECHAZADO"],
      EN_PROCESO: ["RESUELTO", "RECHAZADO", "PENDIENTE"],
      RESUELTO: [],
      RECHAZADO: ["PENDIENTE"],
    };

    if (!allowedTransitions[currentStatus]) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Estado actual inválido.",
      });
    }

    if (!allowedTransitions[currentStatus].includes(newStatus)) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: `No se puede cambiar de ${currentStatus} a ${newStatus}.`,
      });
    }

    const previousStatus = currentStatus; // ← capturar antes del update

    const updatedReport = await updateReportStatus(
      reportId,
      newStatus,
      req.userId,
      notes,
      transaction,
    );

    await transaction.commit();

    // Notificar de forma no bloqueante, igual que notifyNewComment en comment.controller.js
    setImmediate(() => {
      notifyStatusChange(updatedReport, previousStatus, newStatus).catch(
        (err) => console.error("Error en notifyStatusChange:", err),
      );
    });

    return res.status(200).json({
      success: true,
      message: "Estado actualizado correctamente.",
      data: buildReportGeoResponse(updatedReport),
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Error en changeReportStatus:", error);

    return res.status(500).json({
      success: false,
      message: "Error al cambiar el estado del reporte.",
    });
  }
};

// Devuelve el historial de estados de un reporte ordenado por fecha ascendente.
export const getReportStatusHistory = async (req, res) => {
  try {
    const { reportId } = req.params;

    // 1. Buscar el reporte
    const report = await findReportById(reportId);

    // 2. Si no existe, 404
    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Reporte no encontrado.",
      });
    }

    // 3. Cargar el StatusHistory ordenado por created_at ASC con el usuario que hizo el cambio
    const history = await ReportStatusHistory.findAll({
      where: { ReportId: reportId },
      order: [["created_at", "ASC"]],
      include: [
        {
          model: User,
          as: "ChangedByUser",
          attributes: ["Id", "Name", "Surname", "Username"],
        },
      ],
    });

    // 4. Responder 200 con el historial formateado
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
    console.error("Error en getReportStatusHistory:", error);
    return res.status(500).json({
      success: false,
      message: "Error al obtener el historial de estados.",
    });
  }
};

// Elimina una imagen específica de un reporte.
export const deleteReportImage = async (req, res) => {
  try {
    const { reportId, imageId } = req.params;

    // 1. Verificar que la imagen existe y pertenece al reporte
    const image = await ReportImage.findOne({
      where: { Id: imageId, ReportId: reportId },
    });

    if (!image) {
      return res.status(404).json({
        success: false,
        message: "Imagen no encontrada o no pertenece a este reporte.",
      });
    }

    // 2. Verificar que el reporte existe
    const report = await findReportById(reportId);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Reporte no encontrado.",
      });
    }

    // 3. Verificar que el usuario autenticado es dueño del reporte o es admin
    const isOwner = report.UserId === req.userId;
    const isAdmin = req.userRole === "ADMIN_ROLE";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "No tienes permiso para eliminar imágenes de este reporte.",
      });
    }

    // 4. Eliminar el registro de ReportImage de la BD
    const publicId = image.PublicId;
    await image.destroy();

    // 5. Eliminar la imagen de Cloudinary usando el PublicId guardado
    if (publicId) {
      try {
        await deleteImage(publicId);
      } catch (err) {
        console.error("Error al eliminar imagen de Cloudinary:", err);
      }
    }

    // 6. Responder 200
    return res.status(200).json({
      success: true,
      message: "Imagen eliminada exitosamente.",
    });
  } catch (error) {
    console.error("Error en deleteReportImage:", error);
    return res.status(500).json({
      success: false,
      message: "Error al eliminar la imagen.",
    });
  }
};

// Busca reportes por coincidencia en Title o Description.
export const searchReports = async (req, res) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;

    if (!q || q.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: "El parámetro q debe tener al menos 3 caracteres.",
      });
    }

    let parsedPage = parseInt(page);
    let parsedLimit = parseInt(limit);

    if (isNaN(parsedPage) || parsedPage < 1) parsedPage = 1;
    if (isNaN(parsedLimit) || parsedLimit < 1) parsedLimit = 10;
    if (parsedLimit > 50) parsedLimit = 50;

    const offset = (parsedPage - 1) * parsedLimit;

    const { count, rows } = await searchReportsByText(q.trim(), {
      limit: parsedLimit,
      offset,
    });

    const reports = rows.map((report) => buildReportGeoResponse(report));
    const totalPages = Math.ceil(count / parsedLimit);

    return res.status(200).json({
      success: true,
      data: reports,
      pagination: {
        total: count,
        page: parsedPage,
        limit: parsedLimit,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Error en searchReports:", error);
    return res.status(500).json({
      success: false,
      message: "Error al buscar reportes.",
    });
  }
};

// Retorna estadísticas agregadas de todos los reportes.
export const getReportStats = async (req, res) => {
  try {
    const [total, ...countsByGroup] = await Promise.all([
      Report.count(),
      ...REPORT_STATUSES.map((status) =>
        Report.count({ where: { Status: status } }),
      ),
      ...REPORT_CATEGORIES.map((category) =>
        Report.count({ where: { Category: category } }),
      ),
      ...REPORT_PRIORITIES.map((priority) =>
        Report.count({ where: { Priority: priority } }),
      ),
    ]);

    const [
      pendiente,
      en_proceso,
      resuelto,
      rechazado,
      infraestructura,
      seguridad,
      limpieza,
      alta,
      media,
      baja,
    ] = countsByGroup;

    const resolutionRate =
      total > 0 ? parseFloat(((resuelto / total) * 100).toFixed(2)) : 0;

    return res.status(200).json({
      success: true,
      data: {
        total,
        byStatus: {
          PENDIENTE: pendiente,
          EN_PROCESO: en_proceso,
          RESUELTO: resuelto,
          RECHAZADO: rechazado,
        },
        byCategory: {
          INFRAESTRUCTURA: infraestructura,
          SEGURIDAD: seguridad,
          LIMPIEZA: limpieza,
        },
        byPriority: { ALTA: alta, MEDIA: media, BAJA: baja },
        resolutionRate,
      },
    });
  } catch (error) {
    console.error("Error en getReportStats:", error);
    return res
      .status(500)
      .json({ success: false, message: "Error al obtener las estadísticas." });
  }
};

// PATCH /api/reports/:reportId/assign
export const assignReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { assignedTo } = req.body;

    const report = await Report.findByPk(reportId);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Reporte no encontrado.",
      });
    }

    const user = await User.findByPk(assignedTo);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuario a asignar no existe.",
      });
    }

    const roles = await getUserRoleNames(user.Id);

    if (!roles.includes("ADMIN_ROLE")) {
      return res.status(400).json({
        success: false,
        message: "El usuario no es personal municipal (ADMIN_ROLE).",
      });
    }

    report.AssignedTo = user.Id;
    await report.save();

    setImmediate(() => {
      notifyReportAssigned(report, assignedTo).catch((err) =>
        console.error("Error en notifyReportAssigned:", err),
      );
    });

    const fullReport = await findReportById(report.Id);

    return res.status(200).json({
      success: true,
      message: "Reporte asignado exitosamente.",
      data: buildReportGeoResponse(fullReport),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Error al asignar el reporte.",
    });
  }
};
// Retorna reportes cercanos a unas coordenadas dadas dentro de un radio.
export const getNearbyReports = async (req, res) => {
  try {
    let {
      lat,
      lng,
      radius = 1000,
      page = 1,
      limit = 10,
      status,
      category,
    } = req.query;

    const parsedLat = parseFloat(lat);
    const parsedLng = parseFloat(lng);
    const parsedRadius = parseInt(radius);

    if (isNaN(parsedLat) || isNaN(parsedLng)) {
      return res.status(400).json({
        success: false,
        message: "Los parámetros lat y lng deben ser números válidos.",
      });
    }

    if (parsedLat < -90 || parsedLat > 90) {
      return res.status(400).json({
        success: false,
        message: "La latitud debe estar entre -90 y 90.",
      });
    }

    if (parsedLng < -180 || parsedLng > 180) {
      return res.status(400).json({
        success: false,
        message: "La longitud debe estar entre -180 y 180.",
      });
    }

    if (isNaN(parsedRadius) || parsedRadius < 50 || parsedRadius > 50000) {
      return res.status(400).json({
        success: false,
        message: "El radio debe ser un número entre 50 y 50,000 metros.",
      });
    }

    let parsedPage = parseInt(page);
    let parsedLimit = parseInt(limit);

    if (isNaN(parsedPage) || parsedPage < 1) parsedPage = 1;
    if (isNaN(parsedLimit) || parsedLimit < 1) parsedLimit = 10;
    if (parsedLimit > 50) parsedLimit = 50;

    const offset = (parsedPage - 1) * parsedLimit;

    const { count, rows } = await findReportsByProximity(
      parsedLat,
      parsedLng,
      parsedRadius,
      {
        limit: parsedLimit,
        offset,
        status,
        category,
      },
    );

    const reports = rows.map((report) => buildReportGeoResponse(report));
    const totalPages = Math.ceil(count / parsedLimit);

    return res.status(200).json({
      success: true,
      data: reports,
      meta: {
        center: { latitude: parsedLat, longitude: parsedLng },
        radius: parsedRadius,
      },
      pagination: {
        total: count,
        page: parsedPage,
        limit: parsedLimit,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Error en getNearbyReports:", error);
    return res.status(500).json({
      success: false,
      message: "Error al obtener reportes cercanos.",
    });
  }
};

// Retorna estadísticas geográficas: total, con/sin ubicación, desglose por categoría y cobertura.
export const getGeoStats = async (req, res) => {
  try {
    const [total, withLocation, ...categoryCountsByLocation] =
      await Promise.all([
        Report.count(),
        Report.count({ where: { Location: { [Op.ne]: null } } }),
        ...REPORT_CATEGORIES.map((category) =>
          Report.count({
            where: {
              Category: category,
              Location: { [Op.ne]: null },
            },
          }),
        ),
      ]);

    const withoutLocation = total - withLocation;
    const locationCoverage =
      total > 0 ? parseFloat(((withLocation / total) * 100).toFixed(2)) : 0;

    const byCategory = {};
    REPORT_CATEGORIES.forEach((category, i) => {
      byCategory[category] = categoryCountsByLocation[i];
    });

    return res.status(200).json({
      success: true,
      data: {
        total,
        withLocation,
        withoutLocation,
        locationCoverage,
        byCategory,
      },
    });
  } catch (error) {
    console.error("Error en getGeoStats:", error);
    return res.status(500).json({
      success: false,
      message: "Error al obtener las estadísticas geográficas.",
    });
  }
};

// PATCH /api/reports/:reportId/location
export const updateReportLocation = async (req, res) => {
  try {
    const report = req.report;

    if (report.Status !== "PENDIENTE") {
      return res.status(400).json({
        success: false,
        message:
          "Solo se puede actualizar la ubicación de reportes en estado PENDIENTE.",
      });
    }

    const { latitude, longitude, address } = req.body;

    const locationData = buildLocationData(latitude, longitude, address);

    await report.update(locationData);

    const updatedReport = await findReportById(report.Id);

    return res.status(200).json({
      success: true,
      message: "Ubicación del reporte actualizada exitosamente.",
      data: buildReportGeoResponse(updatedReport),
    });
  } catch (error) {
    console.error("Error en updateReportLocation:", error);
    return res.status(500).json({
      success: false,
      message: "Error al actualizar la ubicación del reporte.",
    });
  }
};

// DELETE /api/reports/:reportId/location
// Elimina la ubicación de un reporte en estado PENDIENTE por privacidad o error.
export const removeReportLocation = async (req, res) => {
  try {
    const report = req.report;

    if (report.Status !== "PENDIENTE") {
      return res.status(400).json({
        success: false,
        message:
          "Solo se puede eliminar la ubicación de reportes en estado PENDIENTE.",
      });
    }

    await report.update({
      Latitude: null,
      Longitude: null,
      Location: null,
      Address: null,
    });

    const updatedReport = await findReportById(report.Id);

    return res.status(200).json({
      success: true,
      message: "Ubicación del reporte eliminada exitosamente.",
      data: buildReportGeoResponse(updatedReport),
    });
  } catch (error) {
    console.error("Error en removeReportLocation:", error);
    return res.status(500).json({
      success: false,
      message: "Error al eliminar la ubicación del reporte.",
    });
  }
};

export const getReportsByBoundingBox = async (req, res) => {
  try {
    const { swLat, swLng, neLat, neLng, status, category } = req.query;

    const parsedSwLat = parseFloat(swLat);
    const parsedSwLng = parseFloat(swLng);
    const parsedNeLat = parseFloat(neLat);
    const parsedNeLng = parseFloat(neLng);

    if (
      isNaN(parsedSwLat) ||
      isNaN(parsedSwLng) ||
      isNaN(parsedNeLat) ||
      isNaN(parsedNeLng)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Los parámetros swLat, swLng, neLat y neLng son obligatorios y deben ser números válidos.",
      });
    }

    if (
      parsedSwLat < -90 ||
      parsedSwLat > 90 ||
      parsedNeLat < -90 ||
      parsedNeLat > 90
    ) {
      return res.status(400).json({
        success: false,
        message: "La latitud debe estar entre -90 y 90.",
      });
    }

    if (
      parsedSwLng < -180 ||
      parsedSwLng > 180 ||
      parsedNeLng < -180 ||
      parsedNeLng > 180
    ) {
      return res.status(400).json({
        success: false,
        message: "La longitud debe estar entre -180 y 180.",
      });
    }

    if (parsedSwLat >= parsedNeLat) {
      return res.status(400).json({
        success: false,
        message: "swLat debe ser menor que neLat.",
      });
    }

    if (parsedSwLng >= parsedNeLng) {
      return res.status(400).json({
        success: false,
        message: "swLng debe ser menor que neLng.",
      });
    }

    const reports = await findReportsByBoundingBox(
      parsedSwLat,
      parsedSwLng,
      parsedNeLat,
      parsedNeLng,
      { status, category },
    );

    const data = reports.map((report) => ({
      id: report.Id,
      title: report.Title,
      category: report.Category,
      priority: report.Priority,
      status: report.Status,
      address: report.Address ?? null,
      latitude: report.Latitude != null ? parseFloat(report.Latitude) : null,
      longitude: report.Longitude != null ? parseFloat(report.Longitude) : null,
      hasLocation: report.Latitude != null && report.Longitude != null,
      createdAt: report.CreatedAt,
    }));

    return res.status(200).json({
      success: true,
      data,
      total: data.length,
      bbox: {
        sw: { latitude: parsedSwLat, longitude: parsedSwLng },
        ne: { latitude: parsedNeLat, longitude: parsedNeLng },
      },
    });
  } catch (error) {
    console.error("Error en getReportsByBoundingBox:", error);
    return res.status(500).json({
      success: false,
      message: "Error al obtener reportes del área.",
    });
  }
};

// Retorna datos de mapa de calor para reportes.
export const getHeatmap = async (req, res) => {
  try {
    const { category, priority, status, startDate, endDate } = req.query;

    const filters = {};
    if (category) filters.category = category;
    if (priority) filters.priority = priority;
    if (status) filters.status = status;
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;

    const rows = await getHeatmapData(filters);

    const points = rows.map((report) => buildHeatmapPoint(report));

    return res.status(200).json({
      success: true,
      data: points,
      total: points.length,
    });
  } catch (error) {
    console.error("Error en getHeatmap:", error);
    return res.status(500).json({
      success: false,
      message: "Error al obtener los datos del mapa de calor.",
    });
  }
};
