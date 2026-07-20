import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { z } from 'zod';

import { Boton } from '../../src/shared/components/Boton';
import { CampoTexto } from '../../src/shared/components/CampoTexto';
import { MensajeEstado } from '../../src/shared/components/MensajeEstado';
import type { ErrorApi } from '../../src/shared/services/manejadorErroresApi';
import { useAuth } from '../../src/modules/auth/hooks/useAuth';
import { colores } from '../../src/theme/colores';
import { espaciado } from '../../src/theme/espaciado';

const esquemaPassword = z
  .object({
    currentPassword: z.string().min(1, 'La contraseña actual es obligatoria.'),
    newPassword: z
      .string()
      .min(8, 'La nueva contraseña debe tener al menos 8 caracteres.')
      .regex(/[A-Z]/, 'La nueva contraseña debe incluir una letra mayúscula.')
      .regex(/[a-z]/, 'La nueva contraseña debe incluir una letra minúscula.')
      .regex(/[0-9]/, 'La nueva contraseña debe incluir un número.'),
    confirmPassword: z.string().min(1, 'Confirma la nueva contraseña.')
  })
  .refine((valores) => valores.newPassword === valores.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Las contraseñas no coinciden.'
  })
  .refine((valores) => valores.currentPassword !== valores.newPassword, {
    path: ['newPassword'],
    message: 'La nueva contraseña no puede ser igual a la actual.'
  });

type ValoresPassword = z.infer<typeof esquemaPassword>;

function obtenerMensajeError(error: unknown) {
  const errorApi = error as Partial<ErrorApi>;

  return (
    errorApi.mensaje ??
    'No fue posible cambiar tu contraseña. Revisa la información e intenta nuevamente.'
  );
}

export default function CambiarPasswordScreen() {
  const { cambiarPassword } = useAuth();
  const [mensajeError, setMensajeError] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [mostrarActual, setMostrarActual] = useState(false);
  const [mostrarNueva, setMostrarNueva] = useState(false);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<ValoresPassword>({
    resolver: zodResolver(esquemaPassword),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  });

  const enviar = async (valores: ValoresPassword) => {
    setMensajeError(null);
    setMensajeExito(null);

    try {
      await cambiarPassword({
        currentPassword: valores.currentPassword,
        newPassword: valores.newPassword
      });

      reset();
      setMensajeExito('Contraseña actualizada correctamente.');

      setTimeout(() => {
        router.back();
      }, 1000);
    } catch (error) {
      setMensajeError(obtenerMensajeError(error));
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.contenedor}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contenido}
        >
          <View style={styles.hero}>
            <Pressable
              accessibilityRole="button"
              style={styles.botonVolver}
              onPress={() => router.back()}
            >
              <Ionicons name="chevron-back" size={20} color={colores.texto} />
            </Pressable>

            <View style={styles.iconoHero}>
              <Ionicons name="key-outline" size={28} color={colores.primario} />
            </View>

            <Text style={styles.heroEtiqueta}>Seguridad</Text>
            <Text style={styles.heroTitulo}>Cambiar contraseña</Text>
            <Text style={styles.heroDescripcion}>
              Usa una contraseña segura para proteger tu cuenta ciudadana.
            </Text>
          </View>

          {mensajeError ? (
            <MensajeEstado variante="error" titulo="No se pudo cambiar">
              {mensajeError}
            </MensajeEstado>
          ) : null}

          {mensajeExito ? (
            <MensajeEstado variante="exito" titulo="Contraseña actualizada">
              {mensajeExito}
            </MensajeEstado>
          ) : null}

          <View style={styles.tarjeta}>
            <View style={styles.campoPassword}>
              <Controller
                control={control}
                name="currentPassword"
                render={({ field: { value, onChange, onBlur } }) => (
                  <CampoTexto
                    etiqueta="Contraseña actual"
                    placeholder="Ingresa tu contraseña actual"
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    secureTextEntry={!mostrarActual}
                    autoCapitalize="none"
                    error={errors.currentPassword?.message}
                  />
                )}
              />

              <Pressable
                accessibilityRole="button"
                style={styles.botonMostrar}
                onPress={() => setMostrarActual((valor) => !valor)}
              >
                <Ionicons
                  name={mostrarActual ? 'eye-off-outline' : 'eye-outline'}
                  size={21}
                  color={colores.textoSuave}
                />
              </Pressable>
            </View>

            <View style={styles.campoPassword}>
              <Controller
                control={control}
                name="newPassword"
                render={({ field: { value, onChange, onBlur } }) => (
                  <CampoTexto
                    etiqueta="Nueva contraseña"
                    placeholder="Crea una nueva contraseña"
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    secureTextEntry={!mostrarNueva}
                    autoCapitalize="none"
                    error={errors.newPassword?.message}
                  />
                )}
              />

              <Pressable
                accessibilityRole="button"
                style={styles.botonMostrar}
                onPress={() => setMostrarNueva((valor) => !valor)}
              >
                <Ionicons
                  name={mostrarNueva ? 'eye-off-outline' : 'eye-outline'}
                  size={21}
                  color={colores.textoSuave}
                />
              </Pressable>
            </View>

            <View style={styles.campoPassword}>
              <Controller
                control={control}
                name="confirmPassword"
                render={({ field: { value, onChange, onBlur } }) => (
                  <CampoTexto
                    etiqueta="Confirmar contraseña"
                    placeholder="Repite la nueva contraseña"
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    secureTextEntry={!mostrarConfirmacion}
                    autoCapitalize="none"
                    error={errors.confirmPassword?.message}
                  />
                )}
              />

              <Pressable
                accessibilityRole="button"
                style={styles.botonMostrar}
                onPress={() => setMostrarConfirmacion((valor) => !valor)}
              >
                <Ionicons
                  name={mostrarConfirmacion ? 'eye-off-outline' : 'eye-outline'}
                  size={21}
                  color={colores.textoSuave}
                />
              </Pressable>
            </View>

            <MensajeEstado variante="info" titulo="Requisitos de seguridad">
              La nueva contraseña debe tener mínimo 8 caracteres, una mayúscula, una minúscula y un número.
            </MensajeEstado>
          </View>

          <View style={styles.acciones}>
            <Boton cargando={isSubmitting} onPress={handleSubmit(enviar)}>
              Cambiar contraseña
            </Boton>

            <Boton variante="fantasma" deshabilitado={isSubmitting} onPress={() => router.back()}>
              Cancelar
            </Boton>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colores.fondo
  },
  contenedor: {
    flex: 1
  },
  contenido: {
    paddingHorizontal: espaciado.xl,
    paddingTop: espaciado.lg,
    paddingBottom: espaciado.xxl,
    gap: espaciado.lg
  },
  hero: {
    gap: espaciado.sm
  },
  botonVolver: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colores.tarjeta,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colores.borde,
    marginBottom: espaciado.md
  },
  iconoHero: {
    width: 58,
    height: 58,
    borderRadius: 22,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: espaciado.sm
  },
  heroEtiqueta: {
    color: colores.primario,
    fontSize: 13,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1
  },
  heroTitulo: {
    color: colores.texto,
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -0.7
  },
  heroDescripcion: {
    color: colores.textoSuave,
    fontSize: 16,
    lineHeight: 23
  },
  tarjeta: {
    backgroundColor: colores.tarjeta,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colores.borde,
    padding: espaciado.lg,
    gap: espaciado.lg,
    shadowColor: '#0F172A',
    shadowOpacity: 0.05,
    shadowRadius: 16,
    shadowOffset: {
      width: 0,
      height: 8
    },
    elevation: 2
  },
  campoPassword: {
    position: 'relative'
  },
  botonMostrar: {
    position: 'absolute',
    right: espaciado.md,
    top: 36,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center'
  },
  acciones: {
    gap: espaciado.md
  }
});