import { User, UserProfile, UserEmail } from '../src/users/user-ref.model.js';
import { Role, UserRole } from '../src/users/role-ref.model.js';

export const findUserById = async (userId) => {
  return User.findByPk(userId, {
    include: [
      {
        model: UserProfile,
        as: 'UserProfile',
      },
      {
        model: UserEmail,
        as: 'UserEmail',
      },
      {
        model: UserRole,
        as: 'UserRoles',
        include: [
          {
            model: Role,
            as: 'Role',
          },
        ],
      },
    ],
  });
};
