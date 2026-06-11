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

const esquemaVerificarCorreo = z.object({
  token: z.string().trim().min(1, 'Ingresa el token de verificación.')
});

type ValoresFormularioVerificarCorreo = z.infer<typeof esquemaVerificarCorreo>;

export function FormularioVerificarCorreo() {
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
  } = useForm<ValoresFormularioVerificarCorreo>({
    resolver: zodResolver(esquemaVerificarCorreo),
    defaultValues: {
      token: tokenDesdeUrl
    }
  });

  const enviarFormulario: SubmitHandler<ValoresFormularioVerificarCorreo> = async (valores) => {
    setMensajeError(null);
    setMensajeExito(null);

    try {
      const respuesta = await autenticacionServicio.verificarCorreo({
        token: valores.token
      });

      setMensajeExito(
        respuesta.message || 'Tu correo electrónico fue verificado correctamente.'
      );

      reset({
        token: ''
      });
    } catch (error) {
      setMensajeError(obtenerMensajeError(error));
    }
  };

  return (
    <form className="formularioAutenticacion" onSubmit={handleSubmit(enviarFormulario)}>
      {tokenDesdeUrl ? (
        <Alerta variante="informacion" titulo="Token detectado">
          Se encontró un token de verificación en el enlace. Puedes confirmar la verificación para
          continuar.
        </Alerta>
      ) : null}

      {mensajeExito ? (
        <Alerta variante="exito" titulo="Correo verificado">
          {mensajeExito}
        </Alerta>
      ) : null}

      {mensajeError ? (
        <Alerta variante="error" titulo="No fue posible verificar el correo">
          {mensajeError}
        </Alerta>
      ) : null}

      <label className="formularioAutenticacion__campo">
        <span>Token de verificación</span>
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

      <div className="formularioAutenticacion__acciones">
        <Boton anchoCompleto disabled={isSubmitting} type="submit">
          {isSubmitting ? 'Verificando...' : 'Verificar correo'}
        </Boton>

        <div className="formularioAutenticacion__enlaces">
          <Link to={rutasAplicacion.login}>Volver a login</Link>
        </div>
      </div>
    </form>
  );
}