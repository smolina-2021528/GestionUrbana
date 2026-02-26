import { DataTypes } from 'sequelize';
import { sequelize } from '../../configs/db.js';
import { generateUserId } from '../../helpers/uuid-generator.js';
import { User } from '../users/user.model.js';
import {
  REPORT_CATEGORIES,
  REPORT_PRIORITIES,
  REPORT_STATUSES,
  DEFAULT_PRIORITY,
  DEFAULT_STATUS,
} from '../../helpers/report-constants.js';

export const Report = sequelize.define(
  'Report',
  {
    Id: {
      type: DataTypes.STRING(16),
      primaryKey: true,
      field: 'id',
      defaultValue: () => generateUserId(),
    },
    Title: {
      type: DataTypes.STRING(150),
      allowNull: false,
      field: 'title',
      validate: {
        notEmpty: { msg: 'El título es obligatorio.' },
        len: {
          args: [3, 150],
          msg: 'El título debe tener entre 3 y 150 caracteres.',
        },
      },
    },
    Description: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'description',
      validate: {
        notEmpty: { msg: 'La descripción es obligatoria.' },
        len: {
          args: [10, 2000],
          msg: 'La descripción debe tener entre 10 y 2000 caracteres.',
        },
      },
    },
    Category: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'category',
      validate: {
        notEmpty: { msg: 'La categoría es obligatoria.' },
        isIn: {
          args: [REPORT_CATEGORIES],
          msg: `La categoría debe ser una de: ${REPORT_CATEGORIES.join(', ')}.`,
        },
      },
    },
    Priority: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: DEFAULT_PRIORITY,
      field: 'priority',
      validate: {
        isIn: {
          args: [REPORT_PRIORITIES],
          msg: `La prioridad debe ser una de: ${REPORT_PRIORITIES.join(', ')}.`,
        },
      },
    },
    Status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: DEFAULT_STATUS,
      field: 'status',
      validate: {
        isIn: {
          args: [REPORT_STATUSES],
          msg: `El estado debe ser uno de: ${REPORT_STATUSES.join(', ')}.`,
        },
      },
    },
    UserId: {
      type: DataTypes.STRING(16),
      allowNull: false,
      field: 'user_id',
      references: { model: User, key: 'id' },
    },
    AssignedTo: {
      type: DataTypes.STRING(16),
      allowNull: true,
      field: 'assigned_to',
      references: { model: User, key: 'id' },
    },
    ResolvedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'resolved_at',
    },
    CreatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'created_at',
    },
    UpdatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'updated_at',
    },
  },
  {
    tableName: 'reports',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

// Asociaciones
Report.belongsTo(User, { foreignKey: 'user_id',    as: 'Citizen' });
Report.belongsTo(User, { foreignKey: 'assigned_to', as: 'AssignedMunicipal' });
User.hasMany(Report,   { foreignKey: 'user_id',    as: 'Reports' });