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

const esquemaRegistro = z
  .object({
    name: z.string().trim().min(1, 'Ingresa tu nombre.'),
    surname: z.string().trim().min(1, 'Ingresa tu apellido.'),
    username: z
      .string()
      .trim()
      .min(3, 'El usuario debe tener al menos 3 caracteres.')
      .max(40, 'El usuario no debe superar 40 caracteres.'),
    email: z.string().trim().email('Ingresa un correo electrónico válido.'),
    phone: z
      .string()
      .trim()
      .min(8, 'Ingresa un teléfono válido.')
      .max(20, 'El teléfono no debe superar 20 caracteres.')
      .regex(/^[0-9+\-\s()]+$/, 'El teléfono solo puede incluir números y signos básicos.'),
    password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres.'),
    confirmarPassword: z.string().min(1, 'Confirma tu contraseña.')
  })
  .refine((datos) => datos.password === datos.confirmarPassword, {
    path: ['confirmarPassword'],
    message: 'Las contraseñas no coinciden.'
  });

type ValoresFormularioRegistro = z.infer<typeof esquemaRegistro>;

export function FormularioRegistro() {
  const [mensajeError, setMensajeError] = useState<string | null>(null);
  const [registroCompletado, setRegistroCompletado] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<ValoresFormularioRegistro>({
    resolver: zodResolver(esquemaRegistro),
    defaultValues: {
      name: '',
      surname: '',
      username: '',
      email: '',
      phone: '',
      password: '',
      confirmarPassword: ''
    }
  });

  const enviarFormulario: SubmitHandler<ValoresFormularioRegistro> = async (valores) => {
    setMensajeError(null);
    setRegistroCompletado(false);

    try {
      await autenticacionServicio.registrarUsuario({
        name: valores.name,
        surname: valores.surname,
        username: valores.username,
        email: valores.email,
        phone: valores.phone,
        password: valores.password
      });

      reset();
      setRegistroCompletado(true);
    } catch (error) {
      setMensajeError(obtenerMensajeError(error));
    }
  };

  return (
    <form
      className="formularioAutenticacion formularioAutenticacion--dosColumnas"
      onSubmit={handleSubmit(enviarFormulario)}
    >
      {registroCompletado ? (
        <div className="formularioAutenticacion__campoCompleto">
          <Alerta variante="exito" titulo="Cuenta creada correctamente">
            Tu cuenta fue registrada. Revisa tu correo electrónico para continuar con la
            verificación.
          </Alerta>
        </div>
      ) : null}

      {mensajeError ? (
        <div className="formularioAutenticacion__campoCompleto">
          <Alerta variante="error" titulo="No fue posible crear la cuenta">
            {mensajeError}
          </Alerta>
        </div>
      ) : null}

      <label className="formularioAutenticacion__campo">
        <span>Nombre</span>
        <input
          autoComplete="given-name"
          placeholder="Nombre"
          type="text"
          {...register('name')}
          aria-invalid={Boolean(errors.name)}
        />
        {errors.name?.message ? (
          <small className="mensajeCampoFormulario">{errors.name.message}</small>
        ) : null}
      </label>

      <label className="formularioAutenticacion__campo">
        <span>Apellido</span>
        <input
          autoComplete="family-name"
          placeholder="Apellido"
          type="text"
          {...register('surname')}
          aria-invalid={Boolean(errors.surname)}
        />
        {errors.surname?.message ? (
          <small className="mensajeCampoFormulario">{errors.surname.message}</small>
        ) : null}
      </label>

      <label className="formularioAutenticacion__campo">
        <span>Usuario</span>
        <input
          autoComplete="username"
          placeholder="usuario"
          type="text"
          {...register('username')}
          aria-invalid={Boolean(errors.username)}
        />
        {errors.username?.message ? (
          <small className="mensajeCampoFormulario">{errors.username.message}</small>
        ) : null}
      </label>

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

      <label className="formularioAutenticacion__campo">
        <span>Teléfono</span>
        <input
          autoComplete="tel"
          placeholder="55550000"
          type="tel"
          {...register('phone')}
          aria-invalid={Boolean(errors.phone)}
        />
        {errors.phone?.message ? (
          <small className="mensajeCampoFormulario">{errors.phone.message}</small>
        ) : null}
      </label>

      <label className="formularioAutenticacion__campo">
        <span>Contraseña</span>
        <input
          autoComplete="new-password"
          placeholder="Contraseña segura"
          type="password"
          {...register('password')}
          aria-invalid={Boolean(errors.password)}
        />
        {errors.password?.message ? (
          <small className="mensajeCampoFormulario">{errors.password.message}</small>
        ) : null}
      </label>

      <label className="formularioAutenticacion__campo formularioAutenticacion__campoCompleto">
        <span>Confirmar contraseña</span>
        <input
          autoComplete="new-password"
          placeholder="Confirma tu contraseña"
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
          {isSubmitting ? 'Creando cuenta...' : 'Crear cuenta'}
        </Boton>

        <div className="formularioAutenticacion__enlaces">
          <Link to={rutasAplicacion.login}>Ya tengo cuenta</Link>
        </div>
      </div>
    </form>
  );
}