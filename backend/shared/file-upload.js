import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import { config } from '../auth-service/configs/config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../..');

const resolveUploadPath = () => {
  const configuredPath = config.upload.uploadPath || './uploads';

  if (path.isAbsolute(configuredPath)) {
    return configuredPath;
  }

  return path.resolve(PROJECT_ROOT, configuredPath.replace(/^\.\//, ''));
};

export const uploadPath = resolveUploadPath();

// Crear el directorio de uploads si no existe.
const createUploadDir = () => {
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }
};

const getRequestFiles = (req) => {
  const files = [];

  if (req.file) {
    files.push(req.file);
  }

  if (Array.isArray(req.files)) {
    files.push(...req.files);
  } else if (req.files && typeof req.files === 'object') {
    Object.values(req.files).forEach((value) => {
      if (Array.isArray(value)) {
        files.push(...value);
      }
    });
  }

  return files.filter(Boolean);
};

export const deleteTempFile = (filePath) => {
  try {
    if (!filePath) return false;

    const resolvedPath = path.resolve(filePath);

    if (!fs.existsSync(resolvedPath)) {
      return false;
    }

    fs.unlinkSync(resolvedPath);
    return true;
  } catch (error) {
    console.error('[file-upload] Error eliminando archivo temporal:', error.message);
    return false;
  }
};

export const deleteTempFilesFromRequest = (req) => {
  const files = getRequestFiles(req);
  const result = { deleted: 0, failed: 0 };

  for (const file of files) {
    if (!file?.path) continue;

    const deleted = deleteTempFile(file.path);
    if (deleted) {
      result.deleted += 1;
    } else {
      result.failed += 1;
    }
  }

  return result;
};

// Configuración de almacenamiento en disco temporal antes de subir a Cloudinary.
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    createUploadDir();
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname || '').toLowerCase();
    const uniqueName = `${uuidv4()}${extension}`;
    cb(null, uniqueName);
  },
});

// Filtro de tipos de archivo permitidos.
const fileFilter = (req, file, cb) => {
  if (config.upload.allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error('Tipo de archivo no permitido. Solo se permiten imágenes (JPEG, JPG, PNG, WebP)'),
      false,
    );
  }
};

// Instancia de multer configurada para imágenes generales.
export const upload = multer({
  storage,
  limits: { fileSize: config.upload.maxSize },
  fileFilter,
});

// Middleware para manejar errores de upload.
export const handleUploadError = (error, req, res, next) => {
  deleteTempFilesFromRequest(req);

  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'El archivo es demasiado grande',
        error: `El tamaño máximo permitido es ${config.upload.maxSize / (1024 * 1024)}MB`,
      });
    }

    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Campo de archivo inesperado',
        error: error.message,
      });
    }
  }

  if (error?.message?.includes('Tipo de archivo no permitido')) {
    return res.status(400).json({
      success: false,
      message: 'Tipo de archivo no permitido',
      error: 'Solo se permiten imágenes (JPEG, JPG, PNG, WebP)',
    });
  }

  next(error);
};

// Instancia de multer para múltiples imágenes de reportes, máximo 3.
export const uploadReportImages = multer({
  storage,
  limits: { fileSize: config.upload.maxSize, files: 3 },
  fileFilter,
});

// Middleware para un único archivo usado por endpoints de IA.
export const uploadSingleImage = uploadReportImages.single('image');

// Middleware para manejar errores de upload de reportes.
export const handleReportUploadError = (error, req, res, next) => {
  deleteTempFilesFromRequest(req);

  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'Una o más imágenes del reporte son demasiado grandes',
        error: `El tamaño máximo permitido por imagen es ${config.upload.maxSize / (1024 * 1024)}MB`,
      });
    }

    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Demasiadas imágenes en el reporte',
        error: 'Se permite un máximo de 3 imágenes por reporte',
      });
    }

    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Campo de archivo inesperado en el reporte',
        error: error.message,
      });
    }
  }

  if (error?.message?.includes('Tipo de archivo no permitido')) {
    return res.status(400).json({
      success: false,
      message: 'Tipo de archivo no permitido en el reporte',
      error: 'Las imágenes del reporte deben ser (JPEG, JPG, PNG, WebP)',
    });
  }

  next(error);
};

// Elimina un archivo local por nombre dentro del directorio configurado.
export const deleteFile = (filename) => {
  try {
    if (!filename) return false;

    const safeFilename = path.basename(filename);
    const filePath = path.join(uploadPath, safeFilename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error eliminando archivo:', error.message);
    return false;
  }
};