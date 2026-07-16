import { zodResolver } from '@hookform/resolvers/zod';
import { Link, router, type Href } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  StyleSheet,
  Text,
  View
} from 'react-native';
import { z } from 'zod';

import { Boton } from '../src/shared/components/Boton';
import { CampoTexto } from '../src/shared/components/CampoTexto';
import { MensajeEstado } from '../src/shared/components/MensajeEstado';
import { Pantalla } from '../src/shared/components/Pantalla';
import type { ErrorApi } from '../src/shared/services/manejadorErroresApi';
import { authService } from '../src/modules/auth/services/auth.service';
import { colores } from '../src/theme/colores';
import { espaciado } from '../src/theme/espaciado';


const rutaVerificarCorreo = '/verificar-correo' as Href;

const esquemaRegistro = z.object({
  name: z.string().trim().min(2, 'Ingresa tu nombre.'),
  surname: z.string().trim().min(2, 'Ingresa tu apellido.'),
  username: z.string().trim().min(3, 'El usuario debe tener al menos 3 caracteres.'),
  email: z.string().trim().email('Ingresa un correo válido.'),
  phone: z.string().trim().min(8, 'Ingresa un teléfono válido.'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres.')
});

type ValoresRegistro = z.infer<typeof esquemaRegistro>;

function obtenerMensajeError(error: unknown) {
  const errorApi = error as Partial<ErrorApi>;

  return (
    errorApi.mensaje ??
    'No fue posible crear la cuenta. Revisa los datos e intenta nuevamente.'
  );
}

export default function RegistroScreen() {
  const [mensajeError, setMensajeError] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<ValoresRegistro>({
    resolver: zodResolver(esquemaRegistro),
    defaultValues: {
      name: '',
      surname: '',
      username: '',
      email: '',
      phone: '',
      password: ''
    }
  });

  const enviar = async (valores: ValoresRegistro) => {
    setMensajeError(null);
    setMensajeExito(null);

    try {
      const respuesta = await authService.registrarUsuario(valores);

      setMensajeExito(
        respuesta.message ??
          'Cuenta creada. Revisa tu correo para activar tu usuario antes de iniciar sesión.'
      );

      setTimeout(() => {
        router.replace('/login');
      }, 1600);
    } catch (error) {
      setMensajeError(obtenerMensajeError(error));
    }
  };

  return (
    <Pantalla>
      <View style={styles.encabezado}>
        <Text style={styles.marca}>Registro ciudadano</Text>
        <Text style={styles.titulo}>Crea tu cuenta</Text>
        <Text style={styles.descripcion}>
          Esta app es únicamente para usuarios ciudadanos. Las funciones administrativas se
          mantienen en la versión web.
        </Text>
      </View>

      {mensajeError ? (
        <MensajeEstado variante="error" titulo="No se pudo registrar">
          {mensajeError}
        </MensajeEstado>
      ) : null}

      {mensajeExito ? (
        <MensajeEstado variante="exito" titulo="Cuenta creada">
          {mensajeExito}
        </MensajeEstado>
      ) : null}

      <View style={styles.formulario}>
        <Controller
          control={control}
          name="name"
          render={({ field: { value, onChange, onBlur } }) => (
            <CampoTexto
              etiqueta="Nombre"
              placeholder="Tu nombre"
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              error={errors.name?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="surname"
          render={({ field: { value, onChange, onBlur } }) => (
            <CampoTexto
              etiqueta="Apellido"
              placeholder="Tu apellido"
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              error={errors.surname?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="username"
          render={({ field: { value, onChange, onBlur } }) => (
            <CampoTexto
              etiqueta="Usuario"
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="usuario"
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              error={errors.username?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="email"
          render={({ field: { value, onChange, onBlur } }) => (
            <CampoTexto
              etiqueta="Correo"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              placeholder="correo@ejemplo.com"
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              error={errors.email?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="phone"
          render={({ field: { value, onChange, onBlur } }) => (
            <CampoTexto
              etiqueta="Teléfono"
              keyboardType="phone-pad"
              placeholder="Tu teléfono"
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              error={errors.phone?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({ field: { value, onChange, onBlur } }) => (
            <CampoTexto
              etiqueta="Contraseña"
              placeholder="Mínimo 8 caracteres"
              secureTextEntry
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              error={errors.password?.message}
            />
          )}
        />

        <Boton cargando={isSubmitting} onPress={handleSubmit(enviar)}>
          Crear cuenta
        </Boton>
      </View>

      <View style={styles.pie}>
              <Text style={styles.textoPie}>¿Todavía no tienes cuenta?</Text>
              <Link href="/registro" style={styles.enlace}>
                Crear cuenta ciudadana
              </Link>
      
              <Text style={styles.textoPie}>¿Ya tienes token de verificación?</Text>
              <Link href={rutaVerificarCorreo} style={styles.enlace}>
                Verificar correo
              </Link>
      </View>
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  encabezado: {
    gap: espaciado.sm,
    marginTop: espaciado.xl
  },
  marca: {
    color: colores.primario,
    fontSize: 16,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1
  },
  titulo: {
    color: colores.texto,
    fontSize: 30,
    fontWeight: '900'
  },
  descripcion: {
    color: colores.textoSuave,
    fontSize: 16,
    lineHeight: 23
  },
  formulario: {
    gap: espaciado.lg,
    marginTop: espaciado.lg
  },
  pie: {
    alignItems: 'center',
    gap: espaciado.sm,
    marginTop: espaciado.xl
  },
  textoPie: {
    color: colores.textoSuave
  },
  enlace: {
    color: colores.primario,
    fontWeight: '800'
  }
});