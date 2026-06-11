import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import { z } from 'zod';

import { Alerta } from '../../../shared/components/feedback/Alerta';
import { Boton } from '../../../shared/components/ui/Boton';
import { obtenerMensajeError } from '../../../shared/services/manejadorErroresApi';
import { usarAutenticacion } from '../../authentication/hooks/usarAutenticacion';
import { perfilServicio } from '../services/perfilServicio';

const esquemaPerfil = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Ingresa tu nombre.')
    .max(25, 'El nombre no puede tener más de 25 caracteres.')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo puede contener letras y espacios.'),
  surname: z
    .string()
    .trim()
    .min(1, 'Ingresa tu apellido.')
    .max(25, 'El apellido no puede tener más de 25 caracteres.')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El apellido solo puede contener letras y espacios.'),
  username: z
    .string()
    .trim()
    .min(3, 'El usuario debe tener al menos 3 caracteres.')
    .max(50, 'El usuario no debe superar 50 caracteres.'),
  phone: z
    .string()
    .trim()
    .regex(/^\d{8}$/, 'El teléfono debe tener exactamente 8 dígitos.')
});

type ValoresFormularioPerfil = z.infer<typeof esquemaPerfil>;

export function FormularioPerfil() {
  const { usuario, refrescarPerfil } = usarAutenticacion();
  const [mensajeError, setMensajeError] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<ValoresFormularioPerfil>({
    resolver: zodResolver(esquemaPerfil),
    defaultValues: {
      name: usuario?.name ?? '',
      surname: usuario?.surname ?? '',
      username: usuario?.username ?? '',
      phone: usuario?.phone ?? ''
    }
  });

  useEffect(() => {
    reset({
      name: usuario?.name ?? '',
      surname: usuario?.surname ?? '',
      username: usuario?.username ?? '',
      phone: usuario?.phone ?? ''
    });
  }, [reset, usuario]);

  const enviarFormulario: SubmitHandler<ValoresFormularioPerfil> = async (valores) => {
    setMensajeError(null);
    setMensajeExito(null);

    try {
      await perfilServicio.actualizarPerfil({
        name: valores.name,
        surname: valores.surname,
        username: valores.username,
        phone: valores.phone
      });

      await refrescarPerfil();
      setMensajeExito('Perfil actualizado correctamente.');
    } catch (error) {
      setMensajeError(obtenerMensajeError(error));
    }
  };

  return (
    <form
      className="formularioTemporal formularioTemporal--dosColumnas"
      onSubmit={handleSubmit(enviarFormulario)}
      noValidate
    >
      {mensajeExito ? (
        <div className="formularioAutenticacion__campoCompleto">
          <Alerta variante="exito" titulo="Perfil actualizado">
            {mensajeExito}
          </Alerta>
        </div>
      ) : null}

      {mensajeError ? (
        <div className="formularioAutenticacion__campoCompleto">
          <Alerta variante="error" titulo="No fue posible actualizar el perfil">
            {mensajeError}
          </Alerta>
        </div>
      ) : null}

      <label className="campoTemporal">
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

      <label className="campoTemporal">
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

      <label className="campoTemporal">
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

      <label className="campoTemporal">
        <span>Teléfono</span>
        <input
          autoComplete="tel"
          inputMode="numeric"
          maxLength={8}
          placeholder="55550000"
          type="tel"
          {...register('phone')}
          aria-invalid={Boolean(errors.phone)}
        />
        {errors.phone?.message ? (
          <small className="mensajeCampoFormulario">{errors.phone.message}</small>
        ) : null}
      </label>

      <label className="campoTemporal formularioAutenticacion__campoCompleto">
        <span>Correo electrónico</span>
        <input disabled type="email" value={usuario?.email ?? ''} />
      </label>

      <div className="accionesFormularioTemporal formularioAutenticacion__campoCompleto">
        <Boton disabled={isSubmitting} type="submit">
          {isSubmitting ? 'Guardando cambios...' : 'Guardar cambios'}
        </Boton>
      </div>
    </form>
  );
}