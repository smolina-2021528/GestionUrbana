import { getFullImageUrl } from '../../shared/cloudinary-service.js';

// Construye la respuesta normalizada de un usuario (DTO de salida)
export const buildUserResponse = (user) => {
  const profilePictureUrl =
    user.UserProfile && user.UserProfile.ProfilePicture
      ? getFullImageUrl(user.UserProfile.ProfilePicture)
      : null;

  return {
    id: user.Id,
    name: user.Name,
    surname: user.Surname,
    username: user.Username,
    email: user.Email,
    phone: user.UserProfile?.Phone || '',
    profilePicture: profilePictureUrl,
    role: user.UserRoles?.[0]?.Role?.Name ?? 'USER_ROLE',
    status: user.Status,
    isEmailVerified: user.UserEmail ? user.UserEmail.EmailVerified : false,
    createdAt: user.CreatedAt,
    updatedAt: user.UpdatedAt,
  };
};

