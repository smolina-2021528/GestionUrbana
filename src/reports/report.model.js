import { DataTypes, QueryTypes } from 'sequelize';
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

// ── Valores válidos para el ciclo de vida del análisis IA ─────────────────────
export const AI_STATUS_VALUES = ['PENDING', 'OK', 'FAILED'];

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

    // ── Geolocalización ────────────────────────────────────────────────────────
    Latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: true,
      field: 'latitude',
      validate: {
        min: { args: [-90], msg: 'La latitud debe ser mayor o igual a -90.' },
        max: { args: [90], msg: 'La latitud debe ser menor o igual a 90.' },
      },
    },
    Longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: true,
      field: 'longitude',
      validate: {
        min: { args: [-180], msg: 'La longitud debe ser mayor o igual a -180.' },
        max: { args: [180], msg: 'La longitud debe ser menor o igual a 180.' },
      },
    },
    Location: {
      type: DataTypes.GEOMETRY('POINT', 4326),
      allowNull: true,
      field: 'location',
    },
    Address: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'address',
    },

    // ── Análisis IA ────────────────────────────────────────────────────────────
    // AiStatus: ciclo de vida del análisis.
    AiStatus: {
      type: DataTypes.STRING(10),
      allowNull: true,
      defaultValue: null,
      field: 'ai_status',
      validate: {
        isIn: {
          args: [AI_STATUS_VALUES],
          msg: `ai_status debe ser uno de: ${AI_STATUS_VALUES.join(', ')}.`,
        },
      },
    },

    // Categoría (INFRAESTRUCTURA / SEGURIDAD / LIMPIEZA)
    AiCategory: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: null,
      field: 'ai_category',
      validate: {
        isIn: {
          args: [[...REPORT_CATEGORIES, null]],
          msg: `ai_category debe ser una de: ${REPORT_CATEGORIES.join(', ')}.`,
        },
      },
    },

    // Prioridad (ALTA / MEDIA / BAJA)
    AiPriority: {
      type: DataTypes.STRING(20),
      allowNull: true,
      defaultValue: null,
      field: 'ai_priority',
      validate: {
        isIn: {
          args: [[...REPORT_PRIORITIES, null]],
          msg: `ai_priority debe ser una de: ${REPORT_PRIORITIES.join(', ')}.`,
        },
      },
    },

    AiConfidence: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: null,
      field: 'ai_confidence',
      validate: {
        min: { args: [0], msg: 'ai_confidence debe ser ≥ 0.' },
        max: { args: [1], msg: 'ai_confidence debe ser ≤ 1.' },
      },
    },

    // Se puede mapear desde el campo "description" abreviado o un campo extra
    AiReasoning: {
      type: DataTypes.STRING(500),
      allowNull: true,
      defaultValue: null,
      field: 'ai_reasoning',
    },

    // Timestamp exacto en que el análisis IA finalizó (OK o FAILED).
    AiProcessedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
      field: 'ai_processed_at',
    },

    AiRaw: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
      field: 'ai_raw',
    },

    // ── Timestamps ─────────────────────────────────────────────────────────────
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

Report.belongsTo(User, { foreignKey: 'user_id', as: 'Citizen' });
Report.belongsTo(User, { foreignKey: 'assigned_to', as: 'AssignedMunicipal' });
User.hasMany(Report, { foreignKey: 'user_id', as: 'Reports' });

export const createSpatialIndex = async () => {
  try {
    await sequelize.query(
      `CREATE INDEX IF NOT EXISTS reports_location_gist_idx
       ON reports
       USING GIST (location);`,
      { type: QueryTypes.RAW }
    );
    console.log('PostGIS | Índice espacial GIST verificado/creado en reports.location');
  } catch (error) {
    console.error('PostGIS | Error creando índice espacial:', error.message);
  }
};