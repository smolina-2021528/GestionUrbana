import { sequelize } from '../../configs/db.js';
import { User, UserProfile, UserEmail, UserPasswordReset } from '../users/user.model.js';
import { Role, UserRole } from './role.model.js';
import { USER_ROLE } from '../../helpers/role-constants.js';
import {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendPasswordChangedEmail,
} from '../../helpers/email-service.js';
import { generateJWT } from '../../helpers/generate-jwt.js';
import { hashPassword, verifyPassword } from '../../utils/password-utils.js';
import {
  findUserByEmailOrUsername,
  findUserById,
  findUserByEmail,
  findUserByEmailVerificationToken,
  findUserByPasswordResetToken,
  updateEmailVerificationToken,
  updatePasswordResetToken,
  updateUserPassword,
  markEmailAsVerified,
} from '../../helpers/user-db.js';
import {
  generateEmailVerificationToken,
  generatePasswordResetToken,
} from '../../utils/auth-helpers.js';
import { buildUserResponse } from '../../utils/user-helpers.js';
import { uploadImage } from '../../../shared/cloudinary-service.js';
import crypto from 'crypto';
import path from 'path';

/* =========================
   REGISTER
   ========================= */
export const register = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { name, surname, username, email, password, phone } = req.body;

    // Verificar si el email ya estÃ¡ en uso
    const existing = await User.findOne({
      where: { Email: email.toLowerCase() },
    });
    if (existing) {
      await t.rollback();
      return res.status(409).json({ success: false, message: 'El email ya estÃ¡ registrado.' });
    }

    // Verificar si el username ya estÃ¡ en uso
    const existingUsername = await User.findOne({
      where: { Username: username.toLowerCase() },
    });
    if (existingUsername) {
      await t.rollback();
      return res.status(409).json({ success: false, message: 'El nombre de usuario ya estÃ¡ en uso.' });
    }

    const hashedPassword = await hashPassword(password);

    // Crear usuario (inactivo hasta que verifique su email)
    const user = await User.create(
      {
        Name: name,
        Surname: surname,
        Username: username.toLowerCase(),
        Email: email.toLowerCase(),
        Password: hashedPassword,
        Status: false,
      },
      { transaction: t }
    );

    // Manejar imagen de perfil opcional
    let profilePictureToStore = null;
    if (req.file) {
      try {
        const ext = path.extname(req.file.originalname || '.jpg');
        const randomHex = crypto.randomBytes(6).toString('hex');
        const cloudinaryFileName = `profile-${randomHex}${ext}`;
        profilePictureToStore = await uploadImage(req.file.path, cloudinaryFileName);
      } catch (uploadErr) {
        console.error('Error subiendo foto de perfil:', uploadErr);
      }
    }

    await UserProfile.create(
      {
        UserId: user.Id,
        Phone: phone,
        ProfilePicture: profilePictureToStore || '',
      },
      { transaction: t }
    );

    // Asignar rol ciudadano por defecto
    const role = await Role.findOne({ where: { Name: USER_ROLE } });
    if (!role) throw new Error(`El rol ${USER_ROLE} no existe en la base de datos.`);

    await UserRole.create(
      { UserId: user.Id, RoleId: role.Id },
      { transaction: t }
    );

    // Generar token de verificaciÃ³n de email
    const verificationToken = await generateEmailVerificationToken();
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

    await UserEmail.create(
      {
        UserId: user.Id,
        EmailVerified: false,
        EmailVerificationToken: verificationToken,
        EmailVerificationTokenExpiry: tokenExpiry,
      },
      { transaction: t }
    );

    await UserPasswordReset.create({ UserId: user.Id }, { transaction: t });

    await t.commit();

    // Enviar email de verificaciÃ³n en background (no bloquea la respuesta)
    sendVerificationEmail(user.Email, user.Name, verificationToken)
      .then(() => console.log(`Correo de verificaciÃ³n enviado a: ${user.Email}`))
      .catch((err) => console.error('Error enviando email de verificaciÃ³n:', err));

    return res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente. Por favor verifica tu correo para activar tu cuenta.',
      user: { username: user.Username, email: user.Email },
    });
  } catch (error) {
    if (t && !t.finished) await t.rollback();
    console.error('Error en register:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* =========================
   LOGIN
   ========================= */
export const login = async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;

    const user = await findUserByEmailOrUsername(emailOrUsername);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Credenciales invÃ¡lidas.' });
    }

    const isMatch = await verifyPassword(user.Password, password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Credenciales invÃ¡lidas.' });
    }

    // Verificar que el email estÃ© verificado
    if (!user.UserEmail || !user.UserEmail.EmailVerified) {
      return res.status(403).json({
        success: false,
        message: 'Debes verificar tu email antes de iniciar sesiÃ³n. Revisa tu bandeja de entrada.',
      });
    }

    // Verificar que la cuenta estÃ© activa
    if (!user.Status) {
      return res.status(403).json({
        success: false,
        message: 'Cuenta desactivada. Contacta al administrador.',
      });
    }

    const roles = user.UserRoles.map((ur) => ur.Role.Name);
    const token = await generateJWT(user.Id, { roles });

    return res.status(200).json({
      success: true,
      message: `Bienvenido/a, ${user.Name}`,
      token,
      user: {
        id: user.Id,
        username: user.Username,
        email: user.Email,
        roles,
      },
    });
  } catch (error) {
    console.error('Error en login:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor.' });
  }
};

/* =========================
   VERIFY EMAIL
   ========================= */
export const verifyEmail = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { token } = req.body;

    const record = await UserEmail.findOne({
      where: { EmailVerificationToken: token },
      transaction: t,
    });

    if (!record || new Date() > record.EmailVerificationTokenExpiry) {
      await t.rollback();
      return res.status(400).json({ success: false, message: 'Token invÃ¡lido o expirado.' });
    }

    if (record.EmailVerified) {
      await t.rollback();
      return res.status(400).json({ success: false, message: 'El email ya ha sido verificado.' });
    }

    record.EmailVerified = true;
    record.EmailVerificationToken = null;
    record.EmailVerificationTokenExpiry = null;
    await record.save({ transaction: t });

    await User.update({ Status: true }, { where: { Id: record.UserId }, transaction: t });

    await t.commit();

    // Enviar email de bienvenida en background
    const welcomeUser = await User.findByPk(record.UserId);
    if (welcomeUser) {
      sendWelcomeEmail(welcomeUser.Email, welcomeUser.Name).catch((err) =>
        console.error('Error enviando email de bienvenida:', err)
      );
    }

    return res.status(200).json({
      success: true,
      message: 'Correo verificado y cuenta activada exitosamente. Ya puedes iniciar sesiÃ³n.',
    });
  } catch (error) {
    if (t && !t.finished) await t.rollback();
    console.error('Error en verifyEmail:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* =========================
   RESEND VERIFICATION EMAIL
   ========================= */
export const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await findUserByEmail(email);

    // Por seguridad siempre respondemos igual aunque el usuario no exista
    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'Si el email existe y no estÃ¡ verificado, recibirÃ¡s un correo.',
      });
    }

    if (user.UserEmail && user.UserEmail.EmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'El email ya ha sido verificado. Puedes iniciar sesiÃ³n.',
      });
    }

    const verificationToken = await generateEmailVerificationToken();
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await updateEmailVerificationToken(user.Id, verificationToken, tokenExpiry);

    sendVerificationEmail(user.Email, user.Name, verificationToken)
      .then(() => console.log(`Correo de verificaciÃ³n reenviado a: ${user.Email}`))
      .catch((err) => console.error('Error reenviando email de verificaciÃ³n:', err));

    return res.status(200).json({
      success: true,
      message: 'Si el email existe y no estÃ¡ verificado, recibirÃ¡s un correo.',
    });
  } catch (error) {
    console.error('Error en resendVerification:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor.' });
  }
};

/* =========================
   FORGOT PASSWORD
   ========================= */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await findUserByEmail(email);

    // Por seguridad siempre respondemos igual aunque el usuario no exista
    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'Si el email existe, recibirÃ¡s un enlace de recuperaciÃ³n de contraseÃ±a.',
      });
    }

    const resetToken = await generatePasswordResetToken();
    const tokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    const [record] = await UserPasswordReset.findOrCreate({
      where: { UserId: user.Id },
      defaults: { UserId: user.Id },
    });
    record.PasswordResetToken = resetToken;
    record.PasswordResetTokenExpiry = tokenExpiry;
    await record.save();

    sendPasswordResetEmail(user.Email, user.Name, resetToken).catch((err) =>
      console.error('Error enviando email de reset:', err)
    );

    // Solo en entorno estrictamente 'development' se expone el token para facilitar testing
    const isDev = process.env.NODE_ENV === 'development';
    return res.status(200).json({
      success: true,
      message: 'Si el email existe, recibirÃ¡s un enlace de recuperaciÃ³n de contraseÃ±a.',
      ...(isDev && { debug_token: resetToken }),
    });
  } catch (error) {
    console.error('Error en forgotPassword:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor.' });
  }
};

/* =========================
   RESET PASSWORD
   ========================= */
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const user = await findUserByPasswordResetToken(token);
    if (!user) {
      return res.status(400).json({ success: false, message: 'Token invÃ¡lido o expirado.' });
    }

    const hashedPassword = await hashPassword(newPassword);
    await updateUserPassword(user.Id, hashedPassword);

    sendPasswordChangedEmail(user.Email, user.Name).catch((err) =>
      console.error('Error enviando email de confirmaciÃ³n de cambio de contraseÃ±a:', err)
    );

    return res.status(200).json({
      success: true,
      message: 'ContraseÃ±a actualizada exitosamente.',
    });
  } catch (error) {
    console.error('Error en resetPassword:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor.' });
  }
};

/* =========================
   GET PROFILE (usuario autenticado)
   ========================= */
export const getProfile = async (req, res) => {
  try {
    const user = await findUserById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado.' });
    }
    return res.status(200).json({ success: true, data: buildUserResponse(user) });
  } catch (error) {
    console.error('Error en getProfile:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor.' });
  }
};

/* =========================
   LOGOUT
   ========================= */
import { revokeToken } from '../../helpers/token-blacklist.js';

export const logout = async (req, res) => {
  try {
    const { jti, exp } = req.tokenPayload ?? {};

    if (jti && exp) {
      revokeToken(jti, exp);
    }

    return res.status(200).json({
      success: true,
      message: 'SesiÃ³n cerrada exitosamente.',
    });
  } catch (error) {
    console.error('Error en logout:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno al cerrar sesiÃ³n.',
    });
  }
};

