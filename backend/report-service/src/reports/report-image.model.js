import { DataTypes } from 'sequelize';
import { sequelize } from '../../../auth-service/configs/db.js';
import { generateUserId } from '../../../auth-service/helpers/uuid-generator.js';
import { Report } from './report.model.js';

export const ReportImage = sequelize.define(
  'ReportImage',
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
    ImageUrl: {
      type: DataTypes.STRING(512),
      allowNull: false,
      field: 'image_url',
      validate: {
        notEmpty: { msg: 'La URL de imagen es obligatoria.' },
      },
    },
    PublicId: {
      type: DataTypes.STRING(256),
      allowNull: true,
      field: 'public_id',
    },
    Order: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'order',
    },
    CreatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'created_at',
    },
  },
  {
    tableName: 'report_images',
    timestamps: false,
  }
);

// Asociaciones
Report.hasMany(ReportImage,      { foreignKey: 'report_id', as: 'Images' });
ReportImage.belongsTo(Report,    { foreignKey: 'report_id', as: 'Report' });
