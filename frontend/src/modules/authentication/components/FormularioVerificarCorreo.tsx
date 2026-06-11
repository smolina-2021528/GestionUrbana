import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import { Link, useSearchParams } from 'react-router-dom';
import { z } from 'zod';

import { rutasAplicacion } from '../../../config/constantesSistema';
import { Alerta } from '../../../shared/components/feedback/Alerta';
import { Cargando } from '../../../shared/components/feedback/Cargando';
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
  const [verificandoAutomaticamente, setVerificandoAutomaticamente] = useState(false);
  const tokenProcesadoRef = useRef(false);

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

  const verificarToken = useCallback(
    async (token: string) => {
      setMensajeError(null);
      setMensajeExito(null);

      try {
        const respuesta = await autenticacionServicio.verificarCorreo({
          token
        });

        setMensajeExito(respuesta.message || 'Tu correo electrónico fue verificado correctamente.');

        reset({
          token: ''
        });
      } catch (error) {
        setMensajeError(obtenerMensajeError(error));
      }
    },
    [reset]
  );

  useEffect(() => {
    if (!tokenDesdeUrl || tokenProcesadoRef.current) {
      return;
    }

    tokenProcesadoRef.current = true;
    setVerificandoAutomaticamente(true);

    verificarToken(tokenDesdeUrl).finally(() => {
      setVerificandoAutomaticamente(false);
    });
  }, [tokenDesdeUrl, verificarToken]);

  const enviarFormulario: SubmitHandler<ValoresFormularioVerificarCorreo> = async (valores) => {
    await verificarToken(valores.token);
  };

  if (verificandoAutomaticamente) {
    return (
      <div className="grupoFormulariosAutenticacion">
        <Alerta variante="informacion" titulo="Verificando correo">
          Estamos validando tu enlace de verificación.
        </Alerta>
        <Cargando texto="Verificando cuenta..." />
      </div>
    );
  }

  return (
    <form className="formularioAutenticacion" onSubmit={handleSubmit(enviarFormulario)} noValidate>
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

      {!mensajeExito ? (
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
      ) : null}

      <div className="formularioAutenticacion__acciones">
        {!mensajeExito ? (
          <Boton anchoCompleto disabled={isSubmitting} type="submit">
            {isSubmitting ? 'Verificando...' : 'Verificar correo'}
          </Boton>
        ) : null}

        <div className="formularioAutenticacion__enlaces">
          <Link to={rutasAplicacion.login}>Volver a login</Link>
        </div>
      </div>
    </form>
  );
}