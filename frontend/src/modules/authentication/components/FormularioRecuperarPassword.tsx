import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { z } from 'zod';

import { rutasAplicacion } from '../../../config/constantesSistema';
import { Alerta } from '../../../shared/components/feedback/Alerta';
import { Boton } from '../../../shared/components/ui/Boton';
import { obtenerMensajeError } from '../../../shared/services/manejadorErroresApi';
import { autenticacionServicio } from '../services/autenticacionServicio';

const esquemaRecuperarPassword = z.object({
  email: z.string().trim().email('Ingresa un correo electrónico válido.')
});

type ValoresFormularioRecuperarPassword = z.infer<typeof esquemaRecuperarPassword>;

export function FormularioRecuperarPassword() {
  const [mensajeError, setMensajeError] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [tokenDesarrollo, setTokenDesarrollo] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<ValoresFormularioRecuperarPassword>({
    resolver: zodResolver(esquemaRecuperarPassword),
    defaultValues: {
      email: ''
    }
  });

  const enviarFormulario: SubmitHandler<ValoresFormularioRecuperarPassword> = async (valores) => {
    setMensajeError(null);
    setMensajeExito(null);
    setTokenDesarrollo(null);

    try {
      const respuesta = await autenticacionServicio.solicitarRecuperacionPassword({
        email: valores.email
      });

      setMensajeExito(
        respuesta.message ||
          'Solicitud enviada. Revisa tu correo electrónico para continuar el proceso.'
      );

      if (respuesta.debug_token) {
        setTokenDesarrollo(respuesta.debug_token);
      }

      reset();
    } catch (error) {
      setMensajeError(obtenerMensajeError(error));
    }
  };

  return (
    <form className="formularioAutenticacion" onSubmit={handleSubmit(enviarFormulario)}>
      {mensajeExito ? (
        <Alerta variante="exito" titulo="Solicitud enviada">
          {mensajeExito}
        </Alerta>
      ) : null}

      {tokenDesarrollo ? (
        <Alerta variante="informacion" titulo="Token de recuperación">
          Usa este token para probar el restablecimiento de contraseña: {tokenDesarrollo}
        </Alerta>
      ) : null}

      {mensajeError ? (
        <Alerta variante="error" titulo="No fue posible enviar la solicitud">
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

      <div className="formularioAutenticacion__acciones">
        <Boton anchoCompleto disabled={isSubmitting} type="submit">
          {isSubmitting ? 'Enviando solicitud...' : 'Enviar instrucciones'}
        </Boton>

        <div className="formularioAutenticacion__enlaces">
          <Link to={rutasAplicacion.login}>Volver a login</Link>
          <Link to={rutasAplicacion.restablecerPassword}>Ya tengo un token</Link>
        </div>
      </div>
    </form>
  );
}