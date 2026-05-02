import { DataTypes, QueryTypes } from 'sequelize';
import { sequelize } from '../../configs/db.js';
import { generateUserId } from '../../helpers/uuid-generator.js';
import {
  REPORT_CATEGORIES,
  REPORT_PRIORITIES,
  REPORT_STATUSES,
  DEFAULT_PRIORITY,
  DEFAULT_STATUS,
} from '../../helpers/report-constants.js';

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
        notEmpty: { msg: 'El titulo es obligatorio.' },
        len: {
          args: [3, 150],
          msg: 'El titulo debe tener entre 3 y 150 caracteres.',
        },
      },
    },
    Description: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'description',
      validate: {
        notEmpty: { msg: 'La descripcion es obligatoria.' },
        len: {
          args: [10, 2000],
          msg: 'La descripcion debe tener entre 10 y 2000 caracteres.',
        },
      },
    },
    Category: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'category',
      validate: {
        notEmpty: { msg: 'La categoria es obligatoria.' },
        isIn: {
          args: [REPORT_CATEGORIES],
          msg: `La categoria debe ser una de: ${REPORT_CATEGORIES.join(', ')}.`,
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
      references: {
        model: 'users',
        key: 'id',
      },
    },
    AssignedTo: {
      type: DataTypes.STRING(16),
      allowNull: true,
      field: 'assigned_to',
      references: {
        model: 'users',
        key: 'id',
      },
    },
    ResolvedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'resolved_at',
    },
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
        min: { args: [0], msg: 'ai_confidence debe ser mayor o igual a 0.' },
        max: { args: [1], msg: 'ai_confidence debe ser menor o igual a 1.' },
      },
    },
    AiReasoning: {
      type: DataTypes.STRING(500),
      allowNull: true,
      defaultValue: null,
      field: 'ai_reasoning',
    },
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

export const createSpatialIndex = async () => {
  try {
    await sequelize.query(
      `CREATE INDEX IF NOT EXISTS reports_location_gist_idx
       ON reports
       USING GIST (location);`,
      { type: QueryTypes.RAW }
    );

    console.log('PostGIS | Indice espacial GIST verificado/creado en reports.location');
  } catch (error) {
    console.error('PostGIS | Error creando indice espacial:', error.message);
  }
};

export const createCompositeIndexes = async () => {
  const indexes = [
    {
      name: 'reports_category_status_idx',
      sql: 'CREATE INDEX IF NOT EXISTS reports_category_status_idx ON reports (category, status);',
    },
    {
      name: 'reports_priority_created_idx',
      sql: 'CREATE INDEX IF NOT EXISTS reports_priority_created_idx ON reports (priority, created_at DESC);',
    },
    {
      name: 'reports_status_created_idx',
      sql: 'CREATE INDEX IF NOT EXISTS reports_status_created_idx ON reports (status, created_at DESC);',
    },
    {
      name: 'reports_user_created_idx',
      sql: 'CREATE INDEX IF NOT EXISTS reports_user_created_idx ON reports (user_id, created_at DESC);',
    },
    {
      name: 'reports_assigned_idx',
      sql: 'CREATE INDEX IF NOT EXISTS reports_assigned_idx ON reports (assigned_to) WHERE assigned_to IS NOT NULL;',
    },
    {
      name: 'reports_ai_status_idx',
      sql: "CREATE INDEX IF NOT EXISTS reports_ai_status_idx ON reports (ai_status) WHERE ai_status IS NOT NULL;",
    },
  ];

  for (const { name, sql } of indexes) {
    try {
      await sequelize.query(sql, { type: QueryTypes.RAW });
      console.log(`DB | Indice compuesto verificado/creado: ${name}`);
    } catch (error) {
      console.error(`DB | Error creando indice ${name}:`, error.message);
    }
  }
};