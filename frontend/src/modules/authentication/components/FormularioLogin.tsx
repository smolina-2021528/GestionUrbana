import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';
import { z } from 'zod';

import {
  obtenerRutaInicioPorRoles,
  rutasAplicacion
} from '../../../config/constantesSistema';
import { Alerta } from '../../../shared/components/feedback/Alerta';
import { Boton } from '../../../shared/components/ui/Boton';
import { obtenerMensajeError } from '../../../shared/services/manejadorErroresApi';
import { usarAutenticacion } from '../hooks/usarAutenticacion';
import { autenticacionServicio } from '../services/autenticacionServicio';

type EstadoNavegacion = {
  desde?: string;
};

const esquemaLogin = z.object({
  identificador: z
    .string()
    .trim()
    .min(1, 'Ingresa tu correo o usuario.'),
  password: z
    .string()
    .min(1, 'Ingresa tu contraseña.')
});

type ValoresFormularioLogin = z.infer<typeof esquemaLogin>;

export function FormularioLogin() {
  const navegar = useNavigate();
  const ubicacion = useLocation();
  const { iniciarSesion } = usarAutenticacion();
  const [mensajeError, setMensajeError] = useState<string | null>(null);

  const estadoNavegacion = ubicacion.state as EstadoNavegacion | null;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<ValoresFormularioLogin>({
    resolver: zodResolver(esquemaLogin),
    defaultValues: {
      identificador: '',
      password: ''
    }
  });

  const enviarFormulario: SubmitHandler<ValoresFormularioLogin> = async (valores) => {
    setMensajeError(null);

    try {
      const respuesta = await autenticacionServicio.iniciarSesion({
        emailOrUsername: valores.identificador,
        password: valores.password
      });

      iniciarSesion(respuesta.token, respuesta.user);

      const rutaDestino =
        estadoNavegacion?.desde && estadoNavegacion.desde !== rutasAplicacion.login
          ? estadoNavegacion.desde
          : obtenerRutaInicioPorRoles(respuesta.user.roles);

      navegar(rutaDestino, { replace: true });
    } catch (error) {
      setMensajeError(obtenerMensajeError(error));
    }
  };

  return (
    <form className="formularioAutenticacion" onSubmit={handleSubmit(enviarFormulario)}>
      {mensajeError ? (
        <Alerta variante="error" titulo="No fue posible iniciar sesión">
          {mensajeError}
        </Alerta>
      ) : null}

      <label className="formularioAutenticacion__campo">
        <span>Correo o usuario</span>
        <input
          autoComplete="username"
          placeholder="correo@ejemplo.com"
          type="text"
          {...register('identificador')}
          aria-invalid={Boolean(errors.identificador)}
        />
        {errors.identificador?.message ? (
          <small className="mensajeCampoFormulario">{errors.identificador.message}</small>
        ) : null}
      </label>

      <label className="formularioAutenticacion__campo">
        <span>Contraseña</span>
        <input
          autoComplete="current-password"
          placeholder="Ingresa tu contraseña"
          type="password"
          {...register('password')}
          aria-invalid={Boolean(errors.password)}
        />
        {errors.password?.message ? (
          <small className="mensajeCampoFormulario">{errors.password.message}</small>
        ) : null}
      </label>

      <div className="formularioAutenticacion__acciones">
        <Boton anchoCompleto disabled={isSubmitting} type="submit">
          {isSubmitting ? 'Ingresando...' : 'Ingresar'}
        </Boton>

        <div className="formularioAutenticacion__enlaces">
          <a href={rutasAplicacion.registro}>Crear cuenta</a>
          <a href={rutasAplicacion.login}>Recuperar contraseña</a>
        </div>
      </div>
    </form>
  );
}