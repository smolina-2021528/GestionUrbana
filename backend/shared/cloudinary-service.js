import { v2 as cloudinary } from 'cloudinary';
import { config } from '../auth-service/configs/config.js';
import fs from 'fs/promises';

cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
});

const safeUnlink = async (filePath) => {
  try {
    if (!filePath) return false;
    await fs.unlink(filePath);
    return true;
  } catch (error) {
    if (error?.code !== 'ENOENT') {
      console.warn('Advertencia: No se pudo eliminar el archivo local:', filePath);
    }
    return false;
  }
};

const assertCloudinaryConfigured = () => {
  if (!config.cloudinary.cloudName || !config.cloudinary.apiKey || !config.cloudinary.apiSecret) {
    throw new Error('Cloudinary no está configurado. Revisa CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY y CLOUDINARY_API_SECRET.');
  }
};

const normalizeCloudinaryDestroyResult = (result) => {
  if (!result?.result) return false;
  return ['ok', 'not found'].includes(result.result);
};

const isAbsoluteImageUrl = (imagePath) => /^https?:\/\//i.test(imagePath);

const buildCloudinaryImageUrl = (imagePath, folder) => {
  if (!imagePath) return null;

  const cleanImagePath = String(imagePath).trim();
  if (!cleanImagePath) return null;

  if (isAbsoluteImageUrl(cleanImagePath)) {
    return cleanImagePath;
  }

  const cloudName = config.cloudinary.cloudName;
  if (!cloudName) return null;

  const pathToUse = cleanImagePath.includes('/')
    ? cleanImagePath
    : (folder ? `${folder}/${cleanImagePath}` : cleanImagePath);

  return `https://res.cloudinary.com/${cloudName}/image/upload/${pathToUse}`;
};

// Sube una imagen al folder configurado en Cloudinary.
export const uploadImage = async (filePath, fileName) => {
  try {
    assertCloudinaryConfigured();

    const folder = config.cloudinary.folder;
    const publicId = fileName.replace(/\.[^/.]+$/, "");
    const options = {
      public_id: publicId,
      folder,
      resource_type: 'image',
      transformation: [
        { width: 400, height: 400, crop: 'fill', gravity: 'face' },
        { quality: 'auto', fetch_format: 'auto' },
      ],
    };

    const result = await cloudinary.uploader.upload(filePath, options);

    if (result.error) {
      throw new Error(`Error subiendo imagen: ${result.error.message}`);
    }

    return fileName;
  } catch (error) {
    console.error('Error subiendo a Cloudinary:', error?.message || error);
    throw new Error(`Error al subir imagen a Cloudinary: ${error?.message || ''}`);
  } finally {
    await safeUnlink(filePath);
  }
};

// Elimina una imagen de Cloudinary.
export const deleteImage = async (imagePath) => {
  try {
    if (!imagePath) return true;

    assertCloudinaryConfigured();

    const folder = config.cloudinary.folder;
    const publicId = imagePath.includes('/')
      ? imagePath
      : (folder ? `${folder}/${imagePath}` : imagePath);

    const result = await cloudinary.uploader.destroy(publicId);
    return normalizeCloudinaryDestroyResult(result);
  } catch (error) {
    console.error('Error eliminando imagen de Cloudinary:', error?.message || error);
    return false;
  }
};

// Construye la URL completa de una imagen a partir del nombre de archivo almacenado.
export const getFullImageUrl = (imagePath) => buildCloudinaryImageUrl(imagePath, config.cloudinary.folder);

// Sube una imagen de reporte al folder de reportes en Cloudinary.
export const uploadReportImage = async (filePath, fileName) => {
  try {
    assertCloudinaryConfigured();

    const folder = config.cloudinary.folderReports;
    const publicId = fileName.replace(/\.[^/.]+$/, "");
    const options = {
      public_id: publicId,
      folder,
      resource_type: 'image',
      transformation: [
        { quality: 'auto', fetch_format: 'auto' },
      ],
    };

    const result = await cloudinary.uploader.upload(filePath, options);

    if (result.error) {
      throw new Error(`Error subiendo imagen de reporte: ${result.error.message}`);
    }

    return { fileName, publicId: result.public_id };
  } catch (error) {
    console.error('Error subiendo imagen de reporte a Cloudinary:', error?.message || error);
    throw new Error(`Error al subir imagen de reporte a Cloudinary: ${error?.message || ''}`);
  } finally {
    await safeUnlink(filePath);
  }
};

// Construye la URL completa de una imagen de reporte a partir del public_id o nombre almacenado.
export const getReportImageUrl = (imagePath) => buildCloudinaryImageUrl(imagePath, config.cloudinary.folderReports);

export default {
  uploadImage,
  deleteImage,
  getFullImageUrl,
  uploadReportImage,
  getReportImageUrl,
};