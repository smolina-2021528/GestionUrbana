import { DataTypes } from 'sequelize';
import { sequelize } from '../../configs/db.js';
import { User } from './user-ref.model.js';
import { ALLOWED_ROLES } from '../../helpers/role-constants.js';

export const Role = sequelize.define(
  'Role',
  {
    Id: {
      type: DataTypes.STRING(16),
      primaryKey: true,
      field: 'id',
    },
    Name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'name',
      validate: {
        isIn: {
          args: [ALLOWED_ROLES],
          msg: 'Rol no permitido. Use USER_ROLE o ADMIN_ROLE.',
        },
      },
    },
    CreatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'created_at',
    },
    UpdatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'updated_at',
    },
  },
  {
    tableName: 'roles',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export const UserRole = sequelize.define(
  'UserRole',
  {
    Id: {
      type: DataTypes.STRING(16),
      primaryKey: true,
      field: 'id',
    },
    UserId: {
      type: DataTypes.STRING(16),
      allowNull: false,
      field: 'user_id',
    },
    RoleId: {
      type: DataTypes.STRING(16),
      allowNull: false,
      field: 'role_id',
    },
    CreatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'created_at',
    },
    UpdatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'updated_at',
    },
  },
  {
    tableName: 'user_roles',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

User.hasMany(UserRole, { foreignKey: 'user_id', as: 'UserRoles' });
UserRole.belongsTo(User, { foreignKey: 'user_id', as: 'User' });

Role.hasMany(UserRole, { foreignKey: 'role_id', as: 'UserRoles' });
UserRole.belongsTo(Role, { foreignKey: 'role_id', as: 'Role' });
