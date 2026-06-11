import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import { Link, useSearchParams } from 'react-router-dom';
import { z } from 'zod';

import { rutasAplicacion } from '../../../config/constantesSistema';
import { Alerta } from '../../../shared/components/feedback/Alerta';
import { Boton } from '../../../shared/components/ui/Boton';
import { obtenerMensajeError } from '../../../shared/services/manejadorErroresApi';
import { autenticacionServicio } from '../services/autenticacionServicio';

const esquemaRestablecerPassword = z
  .object({
    token: z.string().trim().min(1, 'Ingresa el token de recuperación.'),
    newPassword: z
      .string()
      .min(8, 'La nueva contraseña debe tener al menos 8 caracteres.')
      .max(255, 'La nueva contraseña no puede superar 255 caracteres.')
      .regex(/[A-Z]/, 'La nueva contraseña debe contener al menos una letra mayúscula.')
      .regex(/[a-z]/, 'La nueva contraseña debe contener al menos una letra minúscula.')
      .regex(/[0-9]/, 'La nueva contraseña debe contener al menos un número.'),
    confirmarPassword: z.string().min(1, 'Confirma tu nueva contraseña.')
  })
  .refine((datos) => datos.newPassword === datos.confirmarPassword, {
    path: ['confirmarPassword'],
    message: 'Las contraseñas no coinciden.'
  });

type ValoresFormularioRestablecerPassword = z.infer<typeof esquemaRestablecerPassword>;

export function FormularioRestablecerPassword() {
  const [parametrosBusqueda] = useSearchParams();
  const [mensajeError, setMensajeError] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  const tokenDesdeUrl = useMemo(
    () => parametrosBusqueda.get('token')?.trim() ?? '',
    [parametrosBusqueda]
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<ValoresFormularioRestablecerPassword>({
    resolver: zodResolver(esquemaRestablecerPassword),
    defaultValues: {
      token: tokenDesdeUrl,
      newPassword: '',
      confirmarPassword: ''
    }
  });

  const enviarFormulario: SubmitHandler<ValoresFormularioRestablecerPassword> = async (valores) => {
    setMensajeError(null);
    setMensajeExito(null);

    try {
      const respuesta = await autenticacionServicio.restablecerPassword({
        token: valores.token,
        newPassword: valores.newPassword
      });

      setMensajeExito(
        respuesta.message || 'Tu contraseña fue actualizada correctamente. Ya puedes iniciar sesión.'
      );

      reset({
        token: '',
        newPassword: '',
        confirmarPassword: ''
      });
    } catch (error) {
      setMensajeError(obtenerMensajeError(error));
    }
  };

  return (
    <form className="formularioAutenticacion" onSubmit={handleSubmit(enviarFormulario)} noValidate>
      {mensajeExito ? (
        <Alerta variante="exito" titulo="Contraseña actualizada">
          {mensajeExito}
        </Alerta>
      ) : null}

      {mensajeError ? (
        <Alerta variante="error" titulo="No fue posible restablecer la contraseña">
          {mensajeError}
        </Alerta>
      ) : null}

      <label className="formularioAutenticacion__campo">
        <span>Token de recuperación</span>
        <input
          autoComplete="one-time-code"
          placeholder="Ingresa el token recibido"
          type="text"
          {...register('token')}
          aria-invalid={Boolean(errors.token)}
        />
        {errors.token?.message ? (
          <small className="mensajeCampoFormulario">{errors.token.message}</small>
        ) : null}
      </label>

      <label className="formularioAutenticacion__campo">
        <span>Nueva contraseña</span>
        <input
          autoComplete="new-password"
          placeholder="Nueva contraseña"
          type="password"
          {...register('newPassword')}
          aria-invalid={Boolean(errors.newPassword)}
        />
        {errors.newPassword?.message ? (
          <small className="mensajeCampoFormulario">{errors.newPassword.message}</small>
        ) : null}
      </label>

      <label className="formularioAutenticacion__campo">
        <span>Confirmar nueva contraseña</span>
        <input
          autoComplete="new-password"
          placeholder="Confirma tu nueva contraseña"
          type="password"
          {...register('confirmarPassword')}
          aria-invalid={Boolean(errors.confirmarPassword)}
        />
        {errors.confirmarPassword?.message ? (
          <small className="mensajeCampoFormulario">{errors.confirmarPassword.message}</small>
        ) : null}
      </label>

      <div className="formularioAutenticacion__acciones">
        <Boton anchoCompleto disabled={isSubmitting} type="submit">
          {isSubmitting ? 'Actualizando contraseña...' : 'Actualizar contraseña'}
        </Boton>

        <div className="formularioAutenticacion__enlaces">
          <Link to={rutasAplicacion.login}>Volver a login</Link>
          <Link to={rutasAplicacion.recuperarPassword}>Solicitar nuevo token</Link>
        </div>
      </div>
    </form>
  );
}