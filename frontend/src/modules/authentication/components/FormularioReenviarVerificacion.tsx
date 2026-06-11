import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import { z } from 'zod';

import { Alerta } from '../../../shared/components/feedback/Alerta';
import { Boton } from '../../../shared/components/ui/Boton';
import { obtenerMensajeError } from '../../../shared/services/manejadorErroresApi';
import { autenticacionServicio } from '../services/autenticacionServicio';

const esquemaReenviarVerificacion = z.object({
  email: z.string().trim().email('Ingresa un correo electrónico válido.')
});

type ValoresFormularioReenviarVerificacion = z.infer<typeof esquemaReenviarVerificacion>;

export function FormularioReenviarVerificacion() {
  const [mensajeError, setMensajeError] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<ValoresFormularioReenviarVerificacion>({
    resolver: zodResolver(esquemaReenviarVerificacion),
    defaultValues: {
      email: ''
    }
  });

  const enviarFormulario: SubmitHandler<ValoresFormularioReenviarVerificacion> = async (
    valores
  ) => {
    setMensajeError(null);
    setMensajeExito(null);

    try {
      const respuesta = await autenticacionServicio.reenviarVerificacion({
        email: valores.email
      });

      setMensajeExito(
        respuesta.message || 'Se enviaron nuevas instrucciones a tu correo electrónico.'
      );

      reset();
    } catch (error) {
      setMensajeError(obtenerMensajeError(error));
    }
  };

  return (
    <form className="formularioAutenticacion" onSubmit={handleSubmit(enviarFormulario)}>
      {mensajeExito ? (
        <Alerta variante="exito" titulo="Correo enviado">
          {mensajeExito}
        </Alerta>
      ) : null}

      {mensajeError ? (
        <Alerta variante="error" titulo="No fue posible reenviar la verificación">
          {mensajeError}
        </Alerta>
      ) : null}

      <label className="formularioAutenticacion__campo">
        <span>Correo electrónico</span>
        <input
          autoComplete="email"
          placeholder="correo@ejemplo.com"
          type="email"
          {...register('email')}
          aria-invalid={Boolean(errors.email)}
        />
        {errors.email?.message ? (
          <small className="mensajeCampoFormulario">{errors.email.message}</small>
        ) : null}
      </label>

      <Boton anchoCompleto disabled={isSubmitting} type="submit" variante="secundario">
        {isSubmitting ? 'Enviando...' : 'Reenviar verificación'}
      </Boton>
    </form>
  );
}