import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  KeyboardAvoidingView,
  Platform,
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

const esquemaPerfil = z.object({
  name: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres.'),
  surname: z.string().trim().min(2, 'El apellido debe tener al menos 2 caracteres.'),
  phone: z
    .string()
    .trim()
    .optional()
    .refine((valor) => !valor || valor.length >= 8, {
      message: 'El teléfono debe tener al menos 8 caracteres.'
    })
});

type ValoresPerfil = z.infer<typeof esquemaPerfil>;

function obtenerMensajeError(error: unknown) {
  const errorApi = error as Partial<ErrorApi>;

  return (
    errorApi.mensaje ??
    'No fue posible actualizar tu perfil. Revisa la información e intenta nuevamente.'
  );
}

export default function EditarPerfilScreen() {
  const { usuario, actualizarPerfil } = useAuth();
  const [mensajeError, setMensajeError] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<ValoresPerfil>({
    resolver: zodResolver(esquemaPerfil),
    defaultValues: {
      name: usuario?.name ?? '',
      surname: usuario?.surname ?? '',
      phone: usuario?.phone ?? ''
    }
  });

  const enviar = async (valores: ValoresPerfil) => {
    setMensajeError(null);
    setMensajeExito(null);

    try {
      await actualizarPerfil({
        name: valores.name,
        surname: valores.surname,
        phone: valores.phone ?? ''
      });

      setMensajeExito('Perfil actualizado correctamente.');

      setTimeout(() => {
        router.back();
      }, 900);
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
            <View style={styles.iconoHero}>
              <Ionicons name="create-outline" size={28} color={colores.primario} />
            </View>

            <Text style={styles.heroEtiqueta}>Mi perfil</Text>
            <Text style={styles.heroTitulo}>Editar datos</Text>
            <Text style={styles.heroDescripcion}>
              Actualiza la información básica de tu cuenta ciudadana.
            </Text>
          </View>

          {mensajeError ? (
            <MensajeEstado variante="error" titulo="No se pudo actualizar">
              {mensajeError}
            </MensajeEstado>
          ) : null}

          {mensajeExito ? (
            <MensajeEstado variante="exito" titulo="Perfil actualizado">
              {mensajeExito}
            </MensajeEstado>
          ) : null}

          <View style={styles.tarjeta}>
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
              name="phone"
              render={({ field: { value, onChange, onBlur } }) => (
                <CampoTexto
                  etiqueta="Teléfono"
                  placeholder="Tu número de teléfono"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  keyboardType="phone-pad"
                  error={errors.phone?.message}
                />
              )}
            />

            <MensajeEstado variante="info" titulo="Correo protegido">
              Por seguridad, el correo no se editará desde esta pantalla.
            </MensajeEstado>
          </View>

          <View style={styles.acciones}>
            <Boton cargando={isSubmitting} onPress={handleSubmit(enviar)}>
              Guardar cambios
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
  acciones: {
    gap: espaciado.md
  }
});