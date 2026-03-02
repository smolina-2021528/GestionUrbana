import { ReportComment } from '../src/reports/report-comment.model.js';
import { User } from '../src/users/user.model.js';

/**
 * Retorna el array de includes estándar para un comentario: 
 * el autor (Author) con solo Id, Name, Surname y Username.
 */
const getCommentIncludes = () => [
    {
        model: User,
        as: 'Author',
        attributes: ['Id', 'Name', 'Surname', 'Username'],
    },
];

/**
 * Lista los comentarios de un reporte.
 */
export const findCommentsByReport = async (reportId, options = {}) => {
    try {
        const { includeInternal = false, limit = 10, offset = 0 } = options;

        const where = { ReportId: reportId };
        
        if (!includeInternal) {
            where.IsInternal = false;
        }

        const comments = await ReportComment.findAndCountAll({
            where,
            include: getCommentIncludes(),
            order: [['created_at', 'ASC']],
            limit,
            offset,
        });

        return comments;
    } catch (error) {
        console.error('Error buscando comentarios por reporte:', error);
        throw new Error('Error al buscar comentarios del reporte');
    }
};

/**
 * Busca un comentario por su PK con el include del autor.
 */
export const findCommentById = async (commentId) => {
    try {
        const comment = await ReportComment.findByPk(commentId, {
            include: getCommentIncludes(),
        });
        return comment;
    } catch (error) {
        console.error('Error buscando comentario por ID:', error);
        throw new Error('Error al buscar comentario');
    }
};

/**
 * Crea un comentario. 
 * El objeto data incluye ReportId, UserId, Content e IsInternal.
 */
export const createComment = async (data, transaction) => {
    try {
        const comment = await ReportComment.create(data, { transaction });
        return comment;
    } catch (error) {
        console.error('Error creando comentario:', error);
        throw new Error('Error al crear comentario');
    }
};

/**
 * Elimina un comentario por su PK (hard delete).
 */
export const deleteComment = async (commentId, transaction) => {
    try {
        const comment = await ReportComment.findByPk(commentId);
        if (!comment) throw new Error('Comentario no encontrado');

        await comment.destroy({ transaction });
        return true;
    } catch (error) {
        console.error('Error eliminando comentario:', error);
        throw new Error('Error al eliminar comentario');
    }
};

/**
 * Retorna el número total de comentarios públicos de un reporte.
 */
export const countCommentsByReport = async (reportId) => {
    try {
        const count = await ReportComment.count({
            where: {
                ReportId: reportId,
                IsInternal: false
            }
        });
        return count;
    } catch (error) {
        console.error('Error contando comentarios del reporte:', error);
        throw new Error('Error al contar comentarios');
    }
};