import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import { z } from 'zod';

import { Lock } from 'lucide-react';

import { Alerta } from '../../../shared/components/feedback/Alerta';
import { Boton } from '../../../shared/components/ui/Boton';
import { obtenerMensajeError } from '../../../shared/services/manejadorErroresApi';
import { perfilServicio } from '../services/perfilServicio';

const esquemaCambioPassword = z
  .object({
    currentPassword: z.string().min(1, 'Ingresa tu contraseña actual.'),
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
  })
  .refine((datos) => datos.currentPassword !== datos.newPassword, {
    path: ['newPassword'],
    message: 'La nueva contraseña debe ser diferente a la actual.'
  });

type ValoresFormularioCambioPassword = z.infer<typeof esquemaCambioPassword>;

export function FormularioCambioPassword() {
  const [mensajeError, setMensajeError] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<ValoresFormularioCambioPassword>({
    resolver: zodResolver(esquemaCambioPassword),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmarPassword: ''
    }
  });

  const enviarFormulario: SubmitHandler<ValoresFormularioCambioPassword> = async (valores) => {
    setMensajeError(null);
    setMensajeExito(null);

    try {
      await perfilServicio.cambiarPassword({
        currentPassword: valores.currentPassword,
        newPassword: valores.newPassword
      });

      reset();
      setMensajeExito('Contraseña actualizada correctamente.');
    } catch (error) {
      setMensajeError(obtenerMensajeError(error));
    }
  };

  return (
    <form className="formularioTemporal" onSubmit={handleSubmit(enviarFormulario)} noValidate>
      {mensajeExito ? (
        <Alerta variante="exito" titulo="Contraseña actualizada">
          {mensajeExito}
        </Alerta>
      ) : null}

      {mensajeError ? (
        <Alerta variante="error" titulo="No fue posible cambiar la contraseña">
          {mensajeError}
        </Alerta>
      ) : null}

      <label className="campoTemporal">
        <span>Contraseña actual</span>
        <input
          autoComplete="current-password"
          placeholder="Ingresa tu contraseña actual"
          type="password"
          {...register('currentPassword')}
          aria-invalid={Boolean(errors.currentPassword)}
        />
        {errors.currentPassword?.message ? (
          <small className="mensajeCampoFormulario">{errors.currentPassword.message}</small>
        ) : null}
      </label>

      <label className="campoTemporal">
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

      <label className="campoTemporal">
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

      <div className="accionesFormularioTemporal">
        <Boton
          disabled={isSubmitting}
          type="submit"
          variante="primario"
          iconoIzquierdo={<Lock size={16} />}
        >
          {isSubmitting ? 'Actualizando contraseña...' : 'Actualizar contraseña'}
        </Boton>
      </div>
    </form>
  );
}