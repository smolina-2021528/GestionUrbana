import { Role, UserRole } from '../src/auth/role.model.js';
import { User, UserEmail, UserProfile } from '../src/users/user.model.js';
import { ALLOWED_ROLES } from './role-constants.js';

const normalizarBooleano = (valor) => {
  if (typeof valor === 'boolean') return valor;

  if (typeof valor === 'string') {
    const normalizado = valor.trim().toLowerCase();

    if (['true', '1', 'yes', 'si', 'sí'].includes(normalizado)) return true;
    if (['false', '0', 'no'].includes(normalizado)) return false;
  }

  return undefined;
};

// Busca un rol por nombre
export const getRoleByName = async (roleName) => {
  return Role.findOne({ where: { Name: roleName } });
};

// Cuenta la cantidad de usuarios con un rol específico
export const countUsersInRole = async (roleName) => {
  const count = await UserRole.count({
    include: [{ model: Role, as: 'Role', where: { Name: roleName } }],
    distinct: true,
    col: 'user_id',
  });

  return count;
};

// Retorna los nombres de los roles de un usuario
export const getUserRoleNames = async (userId) => {
  const userRoles = await UserRole.findAll({
    where: { UserId: userId },
    include: [{ model: Role, as: 'Role' }],
  });

  return userRoles.map((ur) => ur.Role?.Name).filter(Boolean);
};

// Retorna todos los usuarios que tienen un rol específico.
// Puede filtrar por estado activo para flujos como asignación de responsables.
export const getUsersByRole = async (roleName, options = {}) => {
  const activeOnly = normalizarBooleano(options.activeOnly);
  const where = activeOnly === true ? { Status: true } : undefined;

  const users = await User.findAll({
    where,
    include: [
      { model: UserProfile, as: 'UserProfile' },
      { model: UserEmail, as: 'UserEmail' },
      {
        model: UserRole,
        as: 'UserRoles',
        required: true,
        include: [{ model: Role, as: 'Role', where: { Name: roleName }, required: true }],
      },
    ],
    order: [
      ['Name', 'ASC'],
      ['Surname', 'ASC'],
      ['Username', 'ASC'],
    ],
  });

  return users;
};

// Asigna un único rol al usuario (reemplaza todos sus roles actuales)
export const setUserSingleRole = async (user, roleName, sequelize) => {
  const normalized = (roleName || '').trim().toUpperCase();

  if (!ALLOWED_ROLES.includes(normalized)) {
    const err = new Error('Rol no permitido. Usa USER_ROLE o ADMIN_ROLE');
    err.status = 400;
    throw err;
  }

  return sequelize.transaction(async (t) => {
    // Proteger al último administrador
    const isUserAdmin = (user.UserRoles || []).some(
      (r) => r.Role?.Name === 'ADMIN_ROLE'
    );

    if (isUserAdmin && normalized !== 'ADMIN_ROLE') {
      const adminCount = await countUsersInRole('ADMIN_ROLE');

      if (adminCount <= 1) {
        const err = new Error('No se puede remover al último administrador del sistema');
        err.status = 409;
        throw err;
      }
    }

    const role = await getRoleByName(normalized);

    if (!role) {
      const err = new Error(`Rol ${normalized} no encontrado`);
      err.status = 404;
      throw err;
    }

    // Eliminar roles actuales y asignar el nuevo
    await UserRole.destroy({ where: { UserId: user.Id }, transaction: t });

    await UserRole.create(
      { UserId: user.Id, RoleId: role.Id },
      { transaction: t }
    );

    // Recargar usuario con el nuevo rol
    const updated = await User.findByPk(user.Id, {
      include: [
        { model: UserProfile, as: 'UserProfile' },
        { model: UserEmail, as: 'UserEmail' },
        {
          model: UserRole,
          as: 'UserRoles',
          include: [{ model: Role, as: 'Role' }],
        },
      ],
      transaction: t,
    });

    return { updatedUser: updated, roleName: normalized };
  });
};