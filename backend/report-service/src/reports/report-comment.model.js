import { DataTypes } from 'sequelize';
import { sequelize } from '../../auth-service/configs/db.js';
import { generateUserId } from '../../auth-service/helpers/uuid-generator.js';
import { User } from '../../auth-service/src/users/user.model.js';
import { Report } from './report.model.js';

export const ReportComment = sequelize.define(
'ReportComment',
{
    Id: {
    type: DataTypes.STRING(16),
    primaryKey: true,
    field: 'id',
    defaultValue: () => generateUserId(),
    },
    ReportId: {
    type: DataTypes.STRING(16),
    allowNull: false,
    field: 'report_id',
    references: { model: Report, key: 'id' },
    },
    UserId: {
    type: DataTypes.STRING(16),
    allowNull: false,
    field: 'user_id',
    references: { model: User, key: 'id' },
    },
    Content: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'content',
    validate: {
        notEmpty: { msg: 'El contenido del comentario no puede estar vacío.' },
        len: {
        args: [1, 1000],
        msg: 'El contenido debe tener entre 1 y 1000 caracteres.',
        },
    },
    },
    IsInternal: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: 'is_internal',
    },
    CreatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'created_at',
    },
},
{
    tableName: 'report_comments',
    timestamps: false,
}
);

// Asociaciones
ReportComment.belongsTo(Report, { foreignKey: 'report_id', as: 'Report' });
ReportComment.belongsTo(User, { foreignKey: 'user_id', as: 'Author' });
Report.hasMany(ReportComment, { foreignKey: 'report_id', as: 'Comments' });