import { Ionicons } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Boton } from '../src/shared/components/Boton';
import { MensajeEstado } from '../src/shared/components/MensajeEstado';
import { useAuth } from '../src/modules/auth/hooks/useAuth';
import { colores } from '../src/theme/colores';
import { espaciado } from '../src/theme/espaciado';

const rutaEditarPerfil = '/perfil/editar' as Href;
const rutaFotoPerfil = '/perfil/foto' as Href;
const rutaPasswordPerfil = '/perfil/password' as Href;

function obtenerInicial(nombre?: string) {
  if (!nombre?.trim()) {
    return 'C';
  }

  return nombre.trim().charAt(0).toUpperCase();
}

function obtenerNombreCompleto(nombre?: string, apellido?: string) {
  const partes = [nombre, apellido].filter(Boolean).join(' ').trim();

  return partes || 'Ciudadano';
}

function obtenerTextoRoles(roles?: string[]) {
  if (!roles || roles.length === 0) {
    return 'Usuario ciudadano';
  }

  if (roles.includes('USER_ROLE')) {
    return 'Usuario ciudadano';
  }

  return roles.join(', ');
}

function FilaPerfil({
  icono,
  titulo,
  valor
}: {
  icono: keyof typeof Ionicons.glyphMap;
  titulo: string;
  valor?: string | null;
}) {
  return (
    <View style={styles.filaPerfil}>
      <View style={styles.filaIcono}>
        <Ionicons name={icono} size={19} color={colores.primario} />
      </View>

      <View style={styles.filaTexto}>
        <Text style={styles.filaTitulo}>{titulo}</Text>
        <Text style={styles.filaValor}>{valor?.trim() || 'No registrado'}</Text>
      </View>
    </View>
  );
}

function AccionPerfil({
  icono,
  titulo,
  descripcion,
  onPress
}: {
  icono: keyof typeof Ionicons.glyphMap;
  titulo: string;
  descripcion: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.accionPerfil,
        pressed ? styles.accionPerfilPresionada : null
      ]}
    >
      <View style={styles.accionIcono}>
        <Ionicons name={icono} size={22} color={colores.primario} />
      </View>

      <View style={styles.accionTexto}>
        <Text style={styles.accionTitulo}>{titulo}</Text>
        <Text style={styles.accionDescripcion}>{descripcion}</Text>
      </View>

      <Ionicons name="chevron-forward" size={20} color={colores.textoSuave} />
    </Pressable>
  );
}

export default function PerfilScreen() {
  const { usuario, cerrarSesion } = useAuth();

  const manejarCerrarSesion = async () => {
    await cerrarSesion();
    router.replace('/login');
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
            style={({ pressed }) => [
              styles.avatarWrapper,
              pressed ? styles.avatarWrapperPresionado : null
            ]}
            onPress={() => router.push(rutaFotoPerfil)}
          >
            {usuario?.profilePicture ? (
              <Image source={{ uri: usuario.profilePicture }} style={styles.avatarImagen} />
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.avatarTexto}>{obtenerInicial(usuario?.name)}</Text>
              </View>
            )}

            <View style={styles.avatarCamara}>
              <Ionicons name="camera-outline" size={16} color={colores.textoInvertido} />
            </View>
          </Pressable>

          <Text style={styles.nombreUsuario}>
            {obtenerNombreCompleto(usuario?.name, usuario?.surname)}
          </Text>

          <Text style={styles.usuario}>@{usuario?.username || 'usuario'}</Text>

          <View style={styles.rolBadge}>
            <Ionicons name="person-circle-outline" size={16} color={colores.primario} />
            <Text style={styles.rolTexto}>{obtenerTextoRoles(usuario?.roles)}</Text>
          </View>
        </View>

        <MensajeEstado variante="info" titulo="Perfil ciudadano">
          Puedes actualizar tus datos básicos, cambiar tu foto de perfil y modificar tu contraseña.
          El nombre de usuario y el correo se mantienen protegidos.
        </MensajeEstado>

        <View style={styles.tarjeta}>
          <Text style={styles.seccionTitulo}>Información personal</Text>

          <FilaPerfil icono="person-outline" titulo="Nombre" valor={usuario?.name} />
          <FilaPerfil icono="people-outline" titulo="Apellido" valor={usuario?.surname} />
          <FilaPerfil icono="at-outline" titulo="Usuario" valor={usuario?.username} />
          <FilaPerfil icono="mail-outline" titulo="Correo" valor={usuario?.email} />
          <FilaPerfil icono="call-outline" titulo="Teléfono" valor={usuario?.phone} />
        </View>

        <View style={styles.seccion}>
          <View style={styles.seccionEncabezado}>
            <Text style={styles.seccionTitulo}>Administrar cuenta</Text>
            <Text style={styles.seccionDescripcion}>
              Actualiza la información de tu cuenta ciudadana.
            </Text>
          </View>

          <AccionPerfil
            icono="create-outline"
            titulo="Editar datos básicos"
            descripcion="Actualizar nombre, apellido y teléfono."
            onPress={() => router.push(rutaEditarPerfil)}
          />

          <AccionPerfil
            icono="camera-outline"
            titulo="Cambiar foto de perfil"
            descripcion="Tomar foto o elegir una imagen de galería."
            onPress={() => router.push(rutaFotoPerfil)}
          />

          <AccionPerfil
            icono="key-outline"
            titulo="Cambiar contraseña"
            descripcion="Actualizar tu contraseña de acceso."
            onPress={() => router.push(rutaPasswordPerfil)}
          />
        </View>

        <View style={styles.zonaSesion}>
          <Boton variante="fantasma" onPress={manejarCerrarSesion}>
            Cerrar sesión
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
    backgroundColor: colores.tarjeta,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: colores.borde,
    padding: espaciado.xl,
    alignItems: 'center',
    gap: espaciado.sm,
    shadowColor: '#0F172A',
    shadowOpacity: 0.05,
    shadowRadius: 16,
    shadowOffset: {
      width: 0,
      height: 8
    },
    elevation: 2
  },
  avatarWrapper: {
    width: 104,
    height: 104,
    borderRadius: 36,
    position: 'relative',
    marginBottom: espaciado.sm
  },
  avatarWrapperPresionado: {
    opacity: 0.84
  },
  avatar: {
    width: 104,
    height: 104,
    borderRadius: 36,
    backgroundColor: colores.primario,
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarImagen: {
    width: 104,
    height: 104,
    borderRadius: 36,
    backgroundColor: '#E2E8F0'
  },
  avatarTexto: {
    color: colores.textoInvertido,
    fontSize: 42,
    fontWeight: '900'
  },
  avatarCamara: {
    position: 'absolute',
    right: -4,
    bottom: -4,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colores.primario,
    borderWidth: 3,
    borderColor: colores.tarjeta,
    alignItems: 'center',
    justifyContent: 'center'
  },
  nombreUsuario: {
    color: colores.texto,
    fontSize: 25,
    fontWeight: '900',
    textAlign: 'center'
  },
  usuario: {
    color: colores.textoSuave,
    fontSize: 15,
    fontWeight: '700'
  },
  rolBadge: {
    marginTop: espaciado.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    backgroundColor: '#DBEAFE',
    paddingHorizontal: espaciado.md,
    paddingVertical: 7
  },
  rolTexto: {
    color: colores.primario,
    fontSize: 13,
    fontWeight: '900'
  },
  tarjeta: {
    backgroundColor: colores.tarjeta,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colores.borde,
    padding: espaciado.lg,
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
  seccion: {
    gap: espaciado.md
  },
  seccionEncabezado: {
    gap: 3
  },
  seccionTitulo: {
    color: colores.texto,
    fontSize: 21,
    fontWeight: '900'
  },
  seccionDescripcion: {
    color: colores.textoSuave,
    fontSize: 14
  },
  filaPerfil: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaciado.md,
    borderBottomWidth: 1,
    borderBottomColor: colores.borde,
    paddingBottom: espaciado.md
  },
  filaIcono: {
    width: 42,
    height: 42,
    borderRadius: 16,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center'
  },
  filaTexto: {
    flex: 1,
    gap: 3
  },
  filaTitulo: {
    color: colores.textoSuave,
    fontSize: 13,
    fontWeight: '800'
  },
  filaValor: {
    color: colores.texto,
    fontSize: 16,
    fontWeight: '800'
  },
  accionPerfil: {
    backgroundColor: colores.tarjeta,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colores.borde,
    padding: espaciado.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaciado.md,
    shadowColor: '#0F172A',
    shadowOpacity: 0.04,
    shadowRadius: 14,
    shadowOffset: {
      width: 0,
      height: 7
    },
    elevation: 2
  },
  accionPerfilPresionada: {
    opacity: 0.82
  },
  accionIcono: {
    width: 50,
    height: 50,
    borderRadius: 19,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center'
  },
  accionTexto: {
    flex: 1,
    gap: 3
  },
  accionTitulo: {
    color: colores.texto,
    fontSize: 17,
    fontWeight: '900'
  },
  accionDescripcion: {
    color: colores.textoSuave,
    fontSize: 14,
    lineHeight: 20
  },
  zonaSesion: {
    paddingTop: espaciado.md
  }
});