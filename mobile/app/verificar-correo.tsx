import { zodResolver } from '@hookform/resolvers/zod';
import { Link, router } from 'expo-router';
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

const esquemaVerificacion = z.object({
  token: z
    .string()
    .trim()
    .min(10, 'Pega el token completo de verificación.')
});

type ValoresVerificacion = z.infer<typeof esquemaVerificacion>;

function obtenerMensajeError(error: unknown) {
  const errorApi = error as Partial<ErrorApi>;

  return (
    errorApi.mensaje ??
    'No fue posible verificar la cuenta. Revisa el token e intenta nuevamente.'
  );
}

function extraerToken(valor: string) {
  const texto = valor.trim();

  if (!texto.includes('token=')) {
    return texto;
  }

  try {
    const url = new URL(texto);
    return url.searchParams.get('token')?.trim() ?? texto;
  } catch {
    const [, token] = texto.split('token=');
    return token?.split('&')[0]?.trim() ?? texto;
  }
}

export default function VerificarCorreoScreen() {
  const [mensajeError, setMensajeError] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<ValoresVerificacion>({
    resolver: zodResolver(esquemaVerificacion),
    defaultValues: {
      token: ''
    }
  });

  const enviar = async (valores: ValoresVerificacion) => {
    setMensajeError(null);
    setMensajeExito(null);

    const tokenLimpio = extraerToken(valores.token);

    try {
      const respuesta = await authService.verificarCorreo({
        token: tokenLimpio
      });

      setMensajeExito(
        respuesta.message ??
          'Correo verificado correctamente. Ya puedes iniciar sesión.'
      );

      setTimeout(() => {
        router.replace('/login');
      }, 1400);
    } catch (error) {
      setMensajeError(obtenerMensajeError(error));
    }
  };

  return (
    <Pantalla>
      <View style={styles.encabezado}>
        <Text style={styles.marca}>Verificación ciudadana</Text>
        <Text style={styles.titulo}>Verifica tu correo</Text>
        <Text style={styles.descripcion}>
          Copia el token recibido en tu correo y pégalo aquí. También puedes pegar el enlace
          completo aunque diga localhost.
        </Text>
      </View>

      <MensajeEstado variante="info" titulo="Importante">
        Si el enlace del correo empieza con localhost, no lo abras desde el iPhone. Copia el enlace
        completo o solo el token y pégalo en esta pantalla.
      </MensajeEstado>

      {mensajeError ? (
        <MensajeEstado variante="error" titulo="No se pudo verificar">
          {mensajeError}
        </MensajeEstado>
      ) : null}

      {mensajeExito ? (
        <MensajeEstado variante="exito" titulo="Cuenta verificada">
          {mensajeExito}
        </MensajeEstado>
      ) : null}

      <View style={styles.formulario}>
        <Controller
          control={control}
          name="token"
          render={({ field: { value, onChange, onBlur } }) => (
            <CampoTexto
              etiqueta="Token o enlace de verificación"
              placeholder="Pega aquí tu token"
              autoCapitalize="none"
              autoCorrect={false}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              style={styles.textArea}
              error={errors.token?.message}
            />
          )}
        />

        <Boton cargando={isSubmitting} onPress={handleSubmit(enviar)}>
          Verificar cuenta
        </Boton>

        <Boton variante="fantasma" deshabilitado={isSubmitting} onPress={() => router.back()}>
          Volver
        </Boton>
      </View>

      <View style={styles.pie}>
        <Text style={styles.textoPie}>¿Ya verificaste tu cuenta?</Text>
        <Link href="/login" style={styles.enlace}>
          Iniciar sesión
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
  textArea: {
    minHeight: 110,
    paddingTop: espaciado.md
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