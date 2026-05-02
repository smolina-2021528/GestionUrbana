import { DataTypes } from 'sequelize';
import { sequelize } from '../../configs/db.js';
import { generateUserId } from '../../helpers/uuid-generator.js';
import { Report } from './report.model.js';

export const ReportFollower = sequelize.define(
  'ReportFollower',
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
      references: {
        model: 'reports',
        key: 'id',
      },
    },
    UserId: {
      type: DataTypes.STRING(16),
      allowNull: false,
      field: 'user_id',
      references: {
        model: 'users',
        key: 'id',
      },
    },
    CreatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'created_at',
    },
  },
  {
    tableName: 'report_followers',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['report_id', 'user_id'],
      },
    ],
  }
);

Report.hasMany(ReportFollower, { foreignKey: 'report_id', as: 'Followers' });
ReportFollower.belongsTo(Report, { foreignKey: 'report_id', as: 'Report' });