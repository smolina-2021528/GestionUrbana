import nodemailer from 'nodemailer';
import { config } from '../configs/config.js';

// Configurar el transportador de email
const createTransporter = () => {
  if (!config.smtp.username || !config.smtp.password) {
    console.warn('SMTP | Credenciales no configuradas. El envÃ­o de emails no funcionarÃ¡.');
    return null;
  }

  const port = config.smtp.port;
  const secure = port === 465;
  const tlsOptions = { minVersion: 'TLSv1.2', maxVersion: 'TLSv1.3' };

  if (process.env.NODE_ENV !== 'production') {
    tlsOptions.rejectUnauthorized = false;
  }

  return nodemailer.createTransport({
    host: config.smtp.host,
    port: port,
    secure: secure,
    auth: {
      user: config.smtp.username,
      pass: config.smtp.password,
    },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 10_000,
    tls: tlsOptions,
  });
};

const transporter = createTransporter();

// Email de verificaciÃ³n de cuenta
export const sendVerificationEmail = async (email, name, verificationToken) => {
  if (!transporter) throw new Error('SMTP transporter no configurado');

  try {
    const frontendUrl = config.app.frontendUrl || 'http://localhost:5173';
    const verificationUrl = `${frontendUrl}/verify-email?token=${verificationToken}`;

    const mailOptions = {
      from: `"${config.smtp.fromName}" <${config.smtp.fromEmail}>`,
      to: email,
      subject: 'Verifica tu direcciÃ³n de correo - GestiÃ³n Urbana Inteligente',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e4e4e4; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #1565C0; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">ðŸ™ï¸ GestiÃ³n Urbana Inteligente</h1>
          </div>
          <div style="padding: 30px; color: #333; line-height: 1.6;">
            <h2>Â¡Bienvenido/a, ${name}!</h2>
            <p>Gracias por registrarte en el Sistema de GestiÃ³n Urbana Inteligente. Por favor verifica tu direcciÃ³n de correo haciendo clic en el siguiente botÃ³n:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" style="background-color: #1565C0; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                Verificar mi correo
              </a>
            </div>
            <p>Si no puedes hacer clic en el botÃ³n, copia y pega esta URL en tu navegador:</p>
            <p style="word-break: break-all; color: #1565C0;">${verificationUrl}</p>
            <p>Este enlace expira en <strong>24 horas</strong>.</p>
            <p style="color: #666; font-size: 14px;">Si no creaste una cuenta, puedes ignorar este correo.</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error enviando correo de verificaciÃ³n:', error);
    throw error;
  }
};

// Email de bienvenida tras verificar cuenta
export const sendWelcomeEmail = async (email, name) => {
  if (!transporter) throw new Error('SMTP transporter no configurado');

  try {
    const mailOptions = {
      from: `"${config.smtp.fromName}" <${config.smtp.fromEmail}>`,
      to: email,
      subject: 'Â¡Cuenta activada! Bienvenido/a a GestiÃ³n Urbana Inteligente',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e4e4e4; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #2E7D32; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">ðŸ™ï¸ GestiÃ³n Urbana Inteligente</h1>
          </div>
          <div style="padding: 30px; color: #333; line-height: 1.6;">
            <h2>Â¡Tu cuenta estÃ¡ activa, ${name}!</h2>
            <p>Tu cuenta ha sido verificada y activada exitosamente. Ya puedes iniciar sesiÃ³n y comenzar a reportar problemas urbanos en tu ciudad.</p>
            <p>Con nuestra plataforma puedes:</p>
            <ul>
              <li>ðŸ“ Reportar problemas urbanos con geolocalizaciÃ³n</li>
              <li>ðŸ¤– Recibir clasificaciÃ³n automÃ¡tica con IA</li>
              <li>ðŸ“Š Seguir el estado de tus reportes en tiempo real</li>
            </ul>
            <p>Â¡Juntos hacemos una ciudad mejor!</p>
            <p style="color: #666; font-size: 14px;">El equipo de GestiÃ³n Urbana Inteligente</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error enviando correo de bienvenida:', error);
    throw error;
  }
};

// Email de recuperaciÃ³n de contraseÃ±a
export const sendPasswordResetEmail = async (email, name, resetToken) => {
  if (!transporter) throw new Error('SMTP transporter no configurado');

  try {
    const frontendUrl = config.app.frontendUrl || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: `"${config.smtp.fromName}" <${config.smtp.fromEmail}>`,
      to: email,
      subject: 'RecuperaciÃ³n de contraseÃ±a - GestiÃ³n Urbana Inteligente',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e4e4e4; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #C62828; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">ðŸ™ï¸ GestiÃ³n Urbana Inteligente</h1>
          </div>
          <div style="padding: 30px; color: #333; line-height: 1.6;">
            <h2>RecuperaciÃ³n de contraseÃ±a</h2>
            <p>Hola ${name}, recibimos una solicitud para restablecer la contraseÃ±a de tu cuenta. Haz clic en el botÃ³n a continuaciÃ³n:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background-color: #C62828; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                Restablecer contraseÃ±a
              </a>
            </div>
            <p>Si no puedes hacer clic en el botÃ³n, copia y pega esta URL:</p>
            <p style="word-break: break-all; color: #C62828;">${resetUrl}</p>
            <p>Este enlace expira en <strong>1 hora</strong>.</p>
            <p style="color: #666; font-size: 14px;">Si no solicitaste este cambio, ignora este correo y tu contraseÃ±a seguirÃ¡ siendo la misma.</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error enviando correo de reset de contraseÃ±a:', error);
    throw error;
  }
};

// Email de confirmaciÃ³n tras cambiar la contraseÃ±a
export const sendPasswordChangedEmail = async (email, name) => {
  if (!transporter) throw new Error('SMTP transporter no configurado');

  try {
    const mailOptions = {
      from: `"${config.smtp.fromName}" <${config.smtp.fromEmail}>`,
      to: email,
      subject: 'ContraseÃ±a actualizada - GestiÃ³n Urbana Inteligente',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e4e4e4; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #1565C0; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">ðŸ™ï¸ GestiÃ³n Urbana Inteligente</h1>
          </div>
          <div style="padding: 30px; color: #333; line-height: 1.6;">
            <h2>ContraseÃ±a actualizada</h2>
            <p>Hola ${name}, tu contraseÃ±a ha sido actualizada exitosamente.</p>
            <p>Si no realizaste este cambio, contacta a soporte inmediatamente.</p>
            <p style="color: #666; font-size: 14px;">Este es un correo automÃ¡tico, no respondas a este mensaje.</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error enviando correo de contraseÃ±a cambiada:', error);
    throw error;
  }
};

