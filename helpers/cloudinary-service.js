import { v2 as cloudinary } from 'cloudinary';
import { config } from '../configs/config.js';
import fs from 'fs/promises';

// Bypass SSL en desarrollo
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
});

// Sube una imagen al folder configurado en Cloudinary
export const uploadImage = async (filePath, fileName) => {
  try {
    const folder = config.cloudinary.folder;
    const options = {
      public_id: fileName,
      folder: folder,
      resource_type: 'image',
      transformation: [
        { width: 400, height: 400, crop: 'fill', gravity: 'face' },
        { quality: 'auto', fetch_format: 'auto' },
      ],
    };

    const result = await cloudinary.uploader.upload(filePath, options);

    // Eliminar archivo local tras subir
    try {
      await fs.unlink(filePath);
    } catch {
      console.warn('Advertencia: No se pudo eliminar el archivo local:', filePath);
    }

    if (result.error) {
      throw new Error(`Error subiendo imagen: ${result.error.message}`);
    }

    return fileName;
  } catch (error) {
    console.error('Error subiendo a Cloudinary:', error?.message || error);

    try {
      await fs.unlink(filePath);
    } catch {
      console.warn('Advertencia: No se pudo eliminar el archivo local después del error');
    }

    throw new Error(`Error al subir imagen a Cloudinary: ${error?.message || ''}`);
  }
};

// Elimina una imagen de Cloudinary
export const deleteImage = async (imagePath) => {
  try {
    if (!imagePath) return true;

    const folder = config.cloudinary.folder;
    const publicId = imagePath.includes('/')
      ? imagePath
      : `${folder}/${imagePath}`;

    const result = await cloudinary.uploader.destroy(publicId);
    return result.result;
  } catch (error) {
    console.error('Error eliminando imagen de Cloudinary:', error);
    return false;
  }
};

// Construye la URL completa de una imagen a partir del nombre de archivo almacenado
export const getFullImageUrl = (imagePath) => {
  if (!imagePath) return null;

  const folder = config.cloudinary.folder;
  const cloudName = config.cloudinary.cloudName;

  const pathToUse = imagePath.includes('/')
    ? imagePath
    : `${folder}/${imagePath}`;

  return `https://res.cloudinary.com/${cloudName}/image/upload/${pathToUse}`;
};

export default {
  uploadImage,
  deleteImage,
  getFullImageUrl,
};
