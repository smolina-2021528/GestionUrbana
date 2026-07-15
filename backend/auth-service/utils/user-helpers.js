import { getFullImageUrl } from '../../shared/cloudinary-service.js';

export const getUserRoleNamesFromUser = (user) => {
  const roles = user.UserRoles?.map((userRole) => userRole.Role?.Name).filter(Boolean) ?? [];
  return [...new Set(roles)];
};

// Construye la respuesta normalizada de un usuario (DTO de salida)
export const buildUserResponse = (user) => {
  const profilePictureUrl =
    user.UserProfile && user.UserProfile.ProfilePicture
      ? getFullImageUrl(user.UserProfile.ProfilePicture)
      : null;

  const roles = getUserRoleNamesFromUser(user);

  return {
    id: user.Id,
    name: user.Name,
    surname: user.Surname,
    username: user.Username,
    email: user.Email,
    phone: user.UserProfile?.Phone || '',
    profilePicture: profilePictureUrl,
    role: roles[0] ?? 'USER_ROLE',
    roles: roles.length > 0 ? roles : ['USER_ROLE'],
    status: user.Status,
    isEmailVerified: user.UserEmail ? user.UserEmail.EmailVerified : false,
    createdAt: user.CreatedAt,
    updatedAt: user.UpdatedAt,
  };
};