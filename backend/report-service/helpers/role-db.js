import { Role, UserRole } from '../src/users/role-ref.model.js';

export const getRoleByName = async (roleName) => {
  return Role.findOne({
    where: {
      Name: roleName,
    },
  });
};

export const getUserRoleNames = async (userId) => {
  const userRoles = await UserRole.findAll({
    where: {
      UserId: userId,
    },
    include: [
      {
        model: Role,
        as: 'Role',
      },
    ],
  });

  return userRoles.map((userRole) => userRole.Role?.Name).filter(Boolean);
};

export const userHasRole = async (userId, roleName) => {
  const roles = await getUserRoleNames(userId);
  return roles.includes(roleName);
};
