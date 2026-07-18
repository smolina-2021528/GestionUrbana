import fs from 'fs';
import path from 'path';
import { config } from '../configs/config.js';

const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);

export const readTempFile = (filePath) => {
    const resolved = path.resolve(filePath);

    if (!fs.existsSync(resolved)) {
        throw new Error(`Archivo temporal no encontrado: "${resolved}"`);
    }

    const ext = path.extname(resolved).toLowerCase();

    if (!ALLOWED_EXTENSIONS.has(ext)) {
        throw new Error(
            `Extensión no soportada: "${ext}". Se permiten: ${[...ALLOWED_EXTENSIONS].join(', ')}.`
        );
    }

    const mimeMap = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.webp': 'image/webp',
    };

    const buffer = fs.readFileSync(resolved);

    return {
        buffer,
        mimeType: mimeMap[ext],
        filePath: resolved,
    };
};


export const deleteTempFile = (filePath) => {
    try {
        const resolved = path.resolve(filePath);

        if (!fs.existsSync(resolved)) {
            return false;
        }

        fs.unlinkSync(resolved);
        return true;
    } catch (error) {
        console.error(`[ai-file-helper] Error eliminando archivo temporal "${filePath}":`, error.message);
        return false;
    }
};

export const cleanTempFiles = (filePaths = []) => {
    const result = { deleted: [], failed: [] };

    for (const filePath of filePaths) {
        const ok = deleteTempFile(filePath);
        if (ok) {
            result.deleted.push(filePath);
        } else {
            result.failed.push(filePath);
        }
    }

    if (result.deleted.length > 0) {
        console.log(`[ai-file-helper] Archivos temporales eliminados: ${result.deleted.length}`);
    }

    return result;
};

export const purgeStaleUploads = (maxAgeMs = 60 * 60 * 1000) => {
    const uploadDir = path.resolve(config.upload.uploadPath);
    const result = { deleted: 0, errors: 0 };

    if (!fs.existsSync(uploadDir)) {
        return result;
    }

    const now = Date.now();
    let entries;

    try {
        entries = fs.readdirSync(uploadDir);
    } catch (error) {
        console.error('[ai-file-helper] No se pudo leer el directorio de uploads:', error.message);
        return result;
    }

    for (const entry of entries) {
        const fullPath = path.join(uploadDir, entry);

        try {
            const stat = fs.statSync(fullPath);

            if (!stat.isFile()) continue;

            const age = now - stat.mtimeMs;

            if (age > maxAgeMs) {
                fs.unlinkSync(fullPath);
                result.deleted++;
            }
        } catch (error) {
            console.error(`[ai-file-helper] Error procesando "${fullPath}":`, error.message);
            result.errors++;
        }
    }

    if (result.deleted > 0) {
        console.log(`[ai-file-helper] Limpieza de uploads: ${result.deleted} archivo(s) huérfano(s) eliminado(s).`);
    }

    return result;
};

