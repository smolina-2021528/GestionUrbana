import { DataTypes } from 'sequelize';
import { sequelize } from '../../configs/db.js';
import { generateUserId } from '../../helpers/uuid-generator.js';
import { User } from '../users/user.model.js';
import { Report } from './report.model.js';
import { REPORT_STATUSES } from '../../helpers/report-constants.js';

export const ReportStatusHistory = sequelize.define(
  'ReportStatusHistory',
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
    PreviousStatus: {
      type: DataTypes.STRING(20),
      allowNull: true,   // null cuando es el estado inicial del reporte
      field: 'previous_status',
    },
    NewStatus: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: 'new_status',
      validate: {
        isIn: {
          args: [REPORT_STATUSES],
          msg: `El nuevo estado debe ser uno de: ${REPORT_STATUSES.join(', ')}.`,
        },
      },
    },
    ChangedBy: {
      type: DataTypes.STRING(16),
      allowNull: false,
      field: 'changed_by',
      references: { model: User, key: 'id' },
    },
    Notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'notes',
    },
    CreatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'created_at',
    },
  },
  {
    tableName: 'report_status_history',
    timestamps: false,   // solo createdAt, gestionado manualmente arriba
  }
);

// Asociaciones
Report.hasMany(ReportStatusHistory,          { foreignKey: 'report_id',  as: 'StatusHistory' });
ReportStatusHistory.belongsTo(Report,        { foreignKey: 'report_id',  as: 'Report' });
ReportStatusHistory.belongsTo(User,          { foreignKey: 'changed_by', as: 'ChangedByUser' });
