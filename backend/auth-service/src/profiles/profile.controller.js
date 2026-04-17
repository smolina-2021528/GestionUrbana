import { User, UserProfile } from '../users/user.model.js';
import { findUserById } from '../../helpers/user-db.js';
import { hashPassword, verifyPassword } from '../../../report-service/utils/password-utils.js';
import { buildUserResponse } from '../../../report-service/utils/user-helpers.js';
import { uploadImage, deleteImage } from '../../../shared/cloudinary-service.js';
import { sequelize } from '../../configs/db.js';
import crypto from 'crypto';
import path from 'path';

/* =========================
   UPDATE PROFILE
   ========================= */
export const updateProfile = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const userId = req.userId;
    const { name, surname, username, phone } = req.body;

    const user = await findUserById(userId);
    if (!user) {
      await t.rollback();
      return res.status(404).json({ success: false, message: 'Usuario no encontrado.' });
    }

    // Verificar username único si se está cambiando
    if (username && username.toLowerCase() !== user.Username) {
      const existing = await User.findOne({ where: { Username: username.toLowerCase() } });
      if (existing) {
        await t.rollback();
        return res.status(409).json({ success: false, message: 'El nombre de usuario ya está en uso.' });
      }
    }

    await User.update(
      {
        Name: name || user.Name,
        Surname: surname || user.Surname,
        Username: username ? username.toLowerCase() : user.Username,
      },
      { where: { Id: userId }, transaction: t }
    );

    // Manejar imagen de perfil si se envió una nueva
    let profilePictureToStore = user.UserProfile?.ProfilePicture;
    if (req.file) {
      try {
        // Eliminar la foto anterior de Cloudinary si existe
        if (user.UserProfile?.ProfilePicture) {
          await deleteImage(user.UserProfile.ProfilePicture);
        }

        const ext = path.extname(req.file.originalname || '.jpg');
        const randomHex = crypto.randomBytes(6).toString('hex');
        const cloudinaryFileName = `profile-${randomHex}${ext}`;
        profilePictureToStore = await uploadImage(req.file.path, cloudinaryFileName);
      } catch (uploadErr) {
        console.error('Error subiendo foto de perfil:', uploadErr);
      }
    }

    await UserProfile.update(
      {
        Phone: phone || user.UserProfile?.Phone,
        ProfilePicture: profilePictureToStore,
      },
      { where: { UserId: userId }, transaction: t }
    );

    await t.commit();

    const updatedUser = await findUserById(userId);
    return res.status(200).json({
      success: true,
      message: 'Perfil actualizado exitosamente.',
      data: buildUserResponse(updatedUser),
    });
  } catch (error) {
    if (t && !t.finished) await t.rollback();
    console.error('Error en updateProfile:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor.' });
  }
};

/* =========================
   CHANGE PASSWORD (requiere contraseña actual)
   ========================= */
export const changePassword = async (req, res) => {
  try {
    const userId = req.userId;
    const { currentPassword, newPassword } = req.body;

    const user = await findUserById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado.' });
    }

    const isMatch = await verifyPassword(user.Password, currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'La contraseña actual es incorrecta.' });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: 'La nueva contraseña no puede ser igual a la actual.',
      });
    }

    const hashedPassword = await hashPassword(newPassword);
    await User.update({ Password: hashedPassword }, { where: { Id: userId } });

    return res.status(200).json({ success: true, message: 'Contraseña actualizada exitosamente.' });
  } catch (error) {
    console.error('Error en changePassword:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor.' });
  }
};
