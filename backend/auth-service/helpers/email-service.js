import nodemailer from 'nodemailer';
import { config } from '../configs/config.js';

const crearUrlFrontend = (ruta, token) => {
  const frontendUrl = (config.app.frontendUrl || 'http://localhost:5173').replace(/\/+$/, '');
  return `${frontendUrl}${ruta}?token=${encodeURIComponent(token)}`;
};

const escaparHtml = (valor) => {
  return String(valor ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
};

// Configurar el transportador de email
const createTransporter = () => {
  if (!config.smtp.username || !config.smtp.password) {
    console.warn('SMTP | Credenciales no configuradas. El envío de emails no funcionará.');
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
    port,
    secure,
    auth: {
      user: config.smtp.username,
      pass: config.smtp.password
    },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 10_000,
    tls: tlsOptions
  });
};

const transporter = createTransporter();

// Email de verificación de cuenta
export const sendVerificationEmail = async (email, name, verificationToken) => {
  if (!transporter) throw new Error('SMTP transporter no configurado');

  try {
    const verificationUrl = crearUrlFrontend('/verificar-correo', verificationToken);
    const nombreSeguro = escaparHtml(name);

    const mailOptions = {
      from: `"${config.smtp.fromName}" <${config.smtp.fromEmail}>`,
      to: email,
      subject: 'Verifica tu dirección de correo - Ciudad Activa',
      text: `Bienvenido/a, ${name}.

Gracias por registrarte en Ciudad Activa.

Verifica tu dirección de correo ingresando al siguiente enlace:
${verificationUrl}

Este enlace expira en 24 horas.

Si no creaste una cuenta, puedes ignorar este correo.`,
      html: `
        <!doctype html>
        <html lang="es">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Verifica tu correo</title>
          </head>
          <body style="margin: 0; padding: 0; background-color: #f5f7fb; font-family: Arial, sans-serif;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e4e4e4; border-radius: 8px; overflow: hidden;">
              <div style="background-color: #1565C0; color: white; padding: 24px; text-align: center;">
                <h1 style="margin: 0; font-size: 24px;">Ciudad Activa</h1>
              </div>

              <div style="padding: 32px; color: #333333; line-height: 1.6;">
                <h2 style="margin-top: 0;">¡Bienvenido/a, ${nombreSeguro}!</h2>

                <p>
                  Gracias por registrarte en Ciudad Activa. Por favor verifica tu dirección de correo haciendo clic en el siguiente botón:
                </p>

                <div style="text-align: center; margin: 32px 0;">
                  <a href="${verificationUrl}" style="display: inline-block; background-color: #1565C0; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                    Verificar mi correo
                  </a>
                </div>

                <p>Si no puedes hacer clic en el botón, copia y pega esta URL en tu navegador:</p>

                <p style="word-break: break-all; color: #1565C0;">
                  ${verificationUrl}
                </p>

                <p>Este enlace expira en <strong>24 horas</strong>.</p>

                <p style="color: #666666; font-size: 14px;">
                  Si no creaste una cuenta, puedes ignorar este correo.
                </p>
              </div>
            </div>
          </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error enviando correo de verificación:', error);
    throw error;
  }
};

// Email de bienvenida tras verificar cuenta
export const sendWelcomeEmail = async (email, name) => {
  if (!transporter) throw new Error('SMTP transporter no configurado');

  try {
    const nombreSeguro = escaparHtml(name);

    const mailOptions = {
      from: `"${config.smtp.fromName}" <${config.smtp.fromEmail}>`,
      to: email,
      subject: '¡Cuenta activada! Bienvenido/a a Ciudad Activa',
      text: `Tu cuenta está activa, ${name}.

Tu cuenta ha sido verificada correctamente. Ya puedes iniciar sesión y comenzar a reportar incidencias urbanas.`,
      html: `
        <!doctype html>
        <html lang="es">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Cuenta activada</title>
          </head>
          <body style="margin: 0; padding: 0; background-color: #f5f7fb; font-family: Arial, sans-serif;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e4e4e4; border-radius: 8px; overflow: hidden;">
              <div style="background-color: #2E7D32; color: white; padding: 24px; text-align: center;">
                <h1 style="margin: 0; font-size: 24px;">Ciudad Activa</h1>
              </div>

              <div style="padding: 32px; color: #333333; line-height: 1.6;">
                <h2 style="margin-top: 0;">¡Tu cuenta está activa, ${nombreSeguro}!</h2>

                <p>
                  Tu cuenta ha sido verificada correctamente. Ya puedes iniciar sesión y comenzar a reportar incidencias urbanas.
                </p>

                <p>Con Ciudad Activa puedes:</p>

                <ul>
                  <li>Reportar problemas urbanos con ubicación.</li>
                  <li>Dar seguimiento al estado de tus reportes.</li>
                  <li>Ayudar a mejorar la atención de incidencias en la ciudad.</li>
                </ul>

                <p>¡Juntos hacemos una ciudad mejor!</p>

                <p style="color: #666666; font-size: 14px;">
                  El equipo de Ciudad Activa
                </p>
              </div>
            </div>
          </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error enviando correo de bienvenida:', error);
    throw error;
  }
};

// Email de recuperación de contraseña
export const sendPasswordResetEmail = async (email, name, resetToken) => {
  if (!transporter) throw new Error('SMTP transporter no configurado');

  try {
    const resetUrl = crearUrlFrontend('/restablecer-password', resetToken);
    const nombreSeguro = escaparHtml(name);

    const mailOptions = {
      from: `"${config.smtp.fromName}" <${config.smtp.fromEmail}>`,
      to: email,
      subject: 'Recuperación de contraseña - Ciudad Activa',
      text: `Hola ${name}.

Recibimos una solicitud para restablecer la contraseña de tu cuenta.

Puedes continuar desde el siguiente enlace:
${resetUrl}

Este enlace expira en 1 hora.

Si no solicitaste este cambio, ignora este correo.`,
      html: `
        <!doctype html>
        <html lang="es">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Recuperación de contraseña</title>
          </head>
          <body style="margin: 0; padding: 0; background-color: #f5f7fb; font-family: Arial, sans-serif;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e4e4e4; border-radius: 8px; overflow: hidden;">
              <div style="background-color: #C62828; color: white; padding: 24px; text-align: center;">
                <h1 style="margin: 0; font-size: 24px;">Ciudad Activa</h1>
              </div>

              <div style="padding: 32px; color: #333333; line-height: 1.6;">
                <h2 style="margin-top: 0;">Recuperación de contraseña</h2>

                <p>
                  Hola ${nombreSeguro}, recibimos una solicitud para restablecer la contraseña de tu cuenta. Haz clic en el botón para continuar:
                </p>

                <div style="text-align: center; margin: 32px 0;">
                  <a href="${resetUrl}" style="display: inline-block; background-color: #C62828; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                    Restablecer contraseña
                  </a>
                </div>

                <p>Si no puedes hacer clic en el botón, copia y pega esta URL:</p>

                <p style="word-break: break-all; color: #C62828;">
                  ${resetUrl}
                </p>

                <p>Este enlace expira en <strong>1 hora</strong>.</p>

                <p style="color: #666666; font-size: 14px;">
                  Si no solicitaste este cambio, ignora este correo y tu contraseña seguirá siendo la misma.
                </p>
              </div>
            </div>
          </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error enviando correo de recuperación de contraseña:', error);
    throw error;
  }
};

// Email de confirmación tras cambiar la contraseña
export const sendPasswordChangedEmail = async (email, name) => {
  if (!transporter) throw new Error('SMTP transporter no configurado');

  try {
    const nombreSeguro = escaparHtml(name);

    const mailOptions = {
      from: `"${config.smtp.fromName}" <${config.smtp.fromEmail}>`,
      to: email,
      subject: 'Contraseña actualizada - Ciudad Activa',
      text: `Hola ${name}.

Tu contraseña ha sido actualizada correctamente.

Si no realizaste este cambio, contacta a soporte inmediatamente.`,
      html: `
        <!doctype html>
        <html lang="es">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Contraseña actualizada</title>
          </head>
          <body style="margin: 0; padding: 0; background-color: #f5f7fb; font-family: Arial, sans-serif;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e4e4e4; border-radius: 8px; overflow: hidden;">
              <div style="background-color: #1565C0; color: white; padding: 24px; text-align: center;">
                <h1 style="margin: 0; font-size: 24px;">Ciudad Activa</h1>
              </div>

              <div style="padding: 32px; color: #333333; line-height: 1.6;">
                <h2 style="margin-top: 0;">Contraseña actualizada</h2>

                <p>
                  Hola ${nombreSeguro}, tu contraseña ha sido actualizada correctamente.
                </p>

                <p>
                  Si no realizaste este cambio, contacta a soporte inmediatamente.
                </p>

                <p style="color: #666666; font-size: 14px;">
                  Este es un correo automático, no respondas a este mensaje.
                </p>
              </div>
            </div>
          </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error enviando correo de contraseña cambiada:', error);
    throw error;
  }
};