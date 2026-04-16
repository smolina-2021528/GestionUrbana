import { DataTypes } from 'sequelize';
import { sequelize } from '../../configs/db.js';
import { generateUserId } from '../../helpers/uuid-generator.js';
import { User } from '../users/user.model.js';
import { Report } from './report.model.js';

export const NOTIFICATION_TYPES = {
STATUS_CHANGED: 'STATUS_CHANGED',
NEW_COMMENT: 'NEW_COMMENT',
REPORT_ASSIGNED: 'REPORT_ASSIGNED',
};

export const ReportNotification = sequelize.define(
'ReportNotification',
{
    Id: {
    type: DataTypes.STRING(16),
    primaryKey: true,
    field: 'id',
    defaultValue: () => generateUserId(),
    },
    UserId: {
    type: DataTypes.STRING(16),
    allowNull: false,
    field: 'user_id',
    references: { model: User, key: 'id' },
    },
    ReportId: {
    type: DataTypes.STRING(16),
    allowNull: false,
    field: 'report_id',
    references: { model: Report, key: 'id' },
    },
    Type: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'type',
    validate: {
        isIn: {
        args: [Object.values(NOTIFICATION_TYPES)],
        msg: `El tipo debe ser uno de: ${Object.values(NOTIFICATION_TYPES).join(', ')}.`,
        },
    },
    },
    Message: {
    type: DataTypes.STRING(500),
    allowNull: false,
    field: 'message',
    },
    IsRead: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: 'is_read',
    },
    CreatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'created_at',
    },
},
{
    tableName: 'report_notifications',
    timestamps: false,
}
);

// Asociaciones
ReportNotification.belongsTo(User, { foreignKey: 'user_id', as: 'Recipient' });
ReportNotification.belongsTo(Report, { foreignKey: 'report_id', as: 'Report' });
User.hasMany(ReportNotification, { foreignKey: 'user_id', as: 'Notifications' });