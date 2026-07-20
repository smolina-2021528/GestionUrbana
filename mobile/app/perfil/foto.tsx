import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Boton } from '../../src/shared/components/Boton';
import { MensajeEstado } from '../../src/shared/components/MensajeEstado';
import type { ErrorApi } from '../../src/shared/services/manejadorErroresApi';
import { useAuth } from '../../src/modules/auth/hooks/useAuth';
import { colores } from '../../src/theme/colores';
import { espaciado } from '../../src/theme/espaciado';

function obtenerMensajeError(error: unknown) {
  const errorApi = error as Partial<ErrorApi>;

  return (
    errorApi.mensaje ??
    'No fue posible actualizar tu foto de perfil. Intenta nuevamente.'
  );
}

function obtenerInicial(nombre?: string) {
  if (!nombre?.trim()) {
    return 'C';
  }

  return nombre.trim().charAt(0).toUpperCase();
}

export default function CambiarFotoPerfilScreen() {
  const { usuario, actualizarFotoPerfil } = useAuth();
  const [imagen, setImagen] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [mensajeError, setMensajeError] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const imagenVistaPrevia = imagen?.uri ?? usuario?.profilePicture ?? null;

  const seleccionarGaleria = async () => {
    setMensajeError(null);
    setMensajeExito(null);

    const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permiso.granted) {
      setMensajeError('Necesitamos permiso para acceder a tu galería.');
      return;
    }

    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85
    });

    if (!resultado.canceled) {
      setImagen(resultado.assets[0]);
    }
  };

  const tomarFoto = async () => {
    setMensajeError(null);
    setMensajeExito(null);

    const permiso = await ImagePicker.requestCameraPermissionsAsync();

    if (!permiso.granted) {
      setMensajeError('Necesitamos permiso para usar la cámara.');
      return;
    }

    const resultado = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85
    });

    if (!resultado.canceled) {
      setImagen(resultado.assets[0]);
    }
  };

  const guardarFoto = async () => {
    if (!imagen) {
      setMensajeError('Selecciona o toma una fotografía antes de guardar.');
      return;
    }

    setMensajeError(null);
    setMensajeExito(null);
    setGuardando(true);

    try {
      await actualizarFotoPerfil({
        uri: imagen.uri,
        fileName: imagen.fileName,
        mimeType: imagen.mimeType
      });

      setMensajeExito('Foto de perfil actualizada correctamente.');

      setTimeout(() => {
        router.back();
      }, 900);
    } catch (error) {
      setMensajeError(obtenerMensajeError(error));
    } finally {
      setGuardando(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.contenido}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <Pressable
            accessibilityRole="button"
            style={styles.botonVolver}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={20} color={colores.texto} />
          </Pressable>

          <View style={styles.heroTexto}>
            <Text style={styles.heroEtiqueta}>Mi perfil</Text>
            <Text style={styles.heroTitulo}>Cambiar foto</Text>
            <Text style={styles.heroDescripcion}>
              Usa una imagen clara para identificar mejor tu cuenta ciudadana.
            </Text>
          </View>
        </View>

        {mensajeError ? (
          <MensajeEstado variante="error" titulo="No se pudo actualizar">
            {mensajeError}
          </MensajeEstado>
        ) : null}

        {mensajeExito ? (
          <MensajeEstado variante="exito" titulo="Foto actualizada">
            {mensajeExito}
          </MensajeEstado>
        ) : null}

        <View style={styles.tarjetaFoto}>
          <View style={styles.vistaPrevia}>
            {imagenVistaPrevia ? (
              <Image source={{ uri: imagenVistaPrevia }} style={styles.imagenPerfil} />
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.avatarTexto}>{obtenerInicial(usuario?.name)}</Text>
              </View>
            )}

            <View style={styles.badgeCamara}>
              <Ionicons name="camera-outline" size={18} color={colores.textoInvertido} />
            </View>
          </View>

          <Text style={styles.nombreUsuario}>
            {usuario?.name} {usuario?.surname}
          </Text>
          <Text style={styles.usuario}>@{usuario?.username}</Text>

          <View style={styles.accionesImagen}>
            <Boton variante="secundario" deshabilitado={guardando} onPress={seleccionarGaleria}>
              Elegir de galería
            </Boton>

            <Boton variante="secundario" deshabilitado={guardando} onPress={tomarFoto}>
              Tomar foto
            </Boton>
          </View>
        </View>

        <MensajeEstado variante="info" titulo="Recomendación">
          Usa una foto cuadrada, con buena iluminación y sin información sensible visible.
        </MensajeEstado>

        <View style={styles.acciones}>
          <Boton cargando={guardando} deshabilitado={!imagen} onPress={guardarFoto}>
            Guardar foto
          </Boton>

          <Boton variante="fantasma" deshabilitado={guardando} onPress={() => router.back()}>
            Cancelar
          </Boton>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colores.fondo
  },
  contenido: {
    paddingHorizontal: espaciado.xl,
    paddingTop: espaciado.lg,
    paddingBottom: espaciado.xxl,
    gap: espaciado.lg
  },
  hero: {
    gap: espaciado.lg
  },
  botonVolver: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colores.tarjeta,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colores.borde
  },
  heroTexto: {
    gap: espaciado.sm
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
  tarjetaFoto: {
    backgroundColor: colores.tarjeta,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: colores.borde,
    padding: espaciado.xl,
    alignItems: 'center',
    gap: espaciado.md,
    shadowColor: '#0F172A',
    shadowOpacity: 0.05,
    shadowRadius: 16,
    shadowOffset: {
      width: 0,
      height: 8
    },
    elevation: 2
  },
  vistaPrevia: {
    width: 150,
    height: 150,
    borderRadius: 48,
    position: 'relative',
    marginBottom: espaciado.sm
  },
  imagenPerfil: {
    width: 150,
    height: 150,
    borderRadius: 48,
    backgroundColor: '#E2E8F0'
  },
  avatar: {
    width: 150,
    height: 150,
    borderRadius: 48,
    backgroundColor: colores.primario,
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarTexto: {
    color: colores.textoInvertido,
    fontSize: 56,
    fontWeight: '900'
  },
  badgeCamara: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colores.primario,
    borderWidth: 3,
    borderColor: colores.tarjeta,
    alignItems: 'center',
    justifyContent: 'center'
  },
  nombreUsuario: {
    color: colores.texto,
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center'
  },
  usuario: {
    color: colores.textoSuave,
    fontSize: 15,
    fontWeight: '700'
  },
  accionesImagen: {
    width: '100%',
    gap: espaciado.md,
    marginTop: espaciado.sm
  },
  acciones: {
    gap: espaciado.md
  }
});