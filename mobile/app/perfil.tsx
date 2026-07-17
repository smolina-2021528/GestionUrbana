import { Ionicons } from "@expo/vector-icons";
import { router, type Href } from "expo-router";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Boton } from "../src/shared/components/Boton";
import { MensajeEstado } from "../src/shared/components/MensajeEstado";
import { useAuth } from "../src/modules/auth/hooks/useAuth";
import { colores } from "../src/theme/colores";
import { espaciado } from "../src/theme/espaciado";

const rutaEditarPerfil = "/perfil/editar" as Href;

function obtenerInicial(nombre?: string) {
  if (!nombre?.trim()) {
    return "C";
  }

  return nombre.trim().charAt(0).toUpperCase();
}

function obtenerNombreCompleto(nombre?: string, apellido?: string) {
  const partes = [nombre, apellido].filter(Boolean).join(" ").trim();

  return partes || "Ciudadano";
}

function obtenerTextoRoles(roles?: string[]) {
  if (!roles || roles.length === 0) {
    return "Usuario ciudadano";
  }

  if (roles.includes("USER_ROLE")) {
    return "Usuario ciudadano";
  }

  return roles.join(", ");
}

function FilaPerfil({
  icono,
  titulo,
  valor,
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
        <Text style={styles.filaValor}>{valor?.trim() || "No registrado"}</Text>
      </View>
    </View>
  );
}

function AccionPerfil({
  icono,
  titulo,
  descripcion,
  deshabilitado,
  onPress,
}: {
  icono: keyof typeof Ionicons.glyphMap;
  titulo: string;
  descripcion: string;
  deshabilitado?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={deshabilitado}
      onPress={onPress}
      style={({ pressed }) => [
        styles.accionPerfil,
        pressed ? styles.accionPerfilPresionada : null,
        deshabilitado ? styles.accionPerfilDeshabilitada : null,
      ]}
    >
      <View style={styles.accionIcono}>
        <Ionicons name={icono} size={22} color={colores.primario} />
      </View>

      <View style={styles.accionTexto}>
        <Text style={styles.accionTitulo}>{titulo}</Text>
        <Text style={styles.accionDescripcion}>{descripcion}</Text>
      </View>

      <Ionicons
        name={deshabilitado ? "lock-closed-outline" : "chevron-forward"}
        size={20}
        color={colores.textoSuave}
      />
    </Pressable>
  );
}

export default function PerfilScreen() {
  const { usuario, cerrarSesion } = useAuth();

  const manejarCerrarSesion = async () => {
    await cerrarSesion();
    router.replace("/login");
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

          <Text style={styles.heroEtiqueta}>Cuenta ciudadana</Text>
          <Text style={styles.heroTitulo}>Mi perfil</Text>
          <Text style={styles.heroDescripcion}>
            Consulta tus datos personales y administra la información de tu
            cuenta.
          </Text>
        </View>

        <View style={styles.tarjetaPerfil}>
          <View style={styles.avatarContenedor}>
            {usuario?.profilePicture ? (
              <Image
                source={{ uri: usuario.profilePicture }}
                style={styles.avatarImagen}
              />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarTexto}>
                  {obtenerInicial(usuario?.name)}
                </Text>
              </View>
            )}
          </View>

          <Text style={styles.nombreUsuario}>
            {obtenerNombreCompleto(usuario?.name, usuario?.surname)}
          </Text>

          <Text style={styles.usuario}>@{usuario?.username || "usuario"}</Text>

          <View style={styles.rolBadge}>
            <Ionicons
              name="person-circle-outline"
              size={16}
              color={colores.primario}
            />
            <Text style={styles.rolTexto}>
              {obtenerTextoRoles(usuario?.roles)}
            </Text>
          </View>
        </View>

        <MensajeEstado variante="info" titulo="Próximamente editable">
          En los siguientes commits habilitaremos editar datos, cambiar foto de
          perfil y actualizar contraseña.
        </MensajeEstado>

        <View style={styles.tarjeta}>
          <Text style={styles.seccionTitulo}>Información personal</Text>

          <FilaPerfil
            icono="person-outline"
            titulo="Nombre"
            valor={usuario?.name}
          />

          <FilaPerfil
            icono="people-outline"
            titulo="Apellido"
            valor={usuario?.surname}
          />

          <FilaPerfil
            icono="mail-outline"
            titulo="Correo"
            valor={usuario?.email}
          />

          <FilaPerfil
            icono="call-outline"
            titulo="Teléfono"
            valor={usuario?.phone}
          />
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
            deshabilitado
          />

          <AccionPerfil
            icono="key-outline"
            titulo="Cambiar contraseña"
            descripcion="Actualizar tu contraseña de acceso."
            deshabilitado
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
    backgroundColor: colores.fondo,
  },
  contenido: {
    paddingHorizontal: espaciado.xl,
    paddingTop: espaciado.lg,
    paddingBottom: espaciado.xxl,
    gap: espaciado.lg,
  },
  hero: {
    gap: espaciado.sm,
  },
  botonVolver: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colores.tarjeta,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colores.borde,
    marginBottom: espaciado.sm,
  },
  heroEtiqueta: {
    color: colores.primario,
    fontSize: 13,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  heroTitulo: {
    color: colores.texto,
    fontSize: 32,
    fontWeight: "900",
    letterSpacing: -0.7,
  },
  heroDescripcion: {
    color: colores.textoSuave,
    fontSize: 16,
    lineHeight: 23,
  },
  tarjetaPerfil: {
    backgroundColor: colores.texto,
    borderRadius: 30,
    padding: espaciado.xl,
    alignItems: "center",
    gap: espaciado.sm,
    shadowColor: "#0F172A",
    shadowOpacity: 0.14,
    shadowRadius: 22,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    elevation: 4,
  },
  avatarContenedor: {
    width: 108,
    height: 108,
    borderRadius: 38,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: espaciado.sm,
  },
  avatarImagen: {
    width: 96,
    height: 96,
    borderRadius: 34,
  },
  avatarFallback: {
    width: 96,
    height: 96,
    borderRadius: 34,
    backgroundColor: colores.primario,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarTexto: {
    color: colores.textoInvertido,
    fontSize: 42,
    fontWeight: "900",
  },
  nombreUsuario: {
    color: colores.textoInvertido,
    fontSize: 26,
    fontWeight: "900",
    textAlign: "center",
  },
  usuario: {
    color: "#CBD5E1",
    fontSize: 15,
    fontWeight: "700",
  },
  rolBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: espaciado.xs,
    backgroundColor: "#DBEAFE",
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: espaciado.md,
    marginTop: espaciado.sm,
  },
  rolTexto: {
    color: colores.primarioOscuro,
    fontSize: 13,
    fontWeight: "900",
  },
  tarjeta: {
    backgroundColor: colores.tarjeta,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colores.borde,
    padding: espaciado.lg,
    gap: espaciado.lg,
    shadowColor: "#0F172A",
    shadowOpacity: 0.05,
    shadowRadius: 16,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    elevation: 2,
  },
  seccion: {
    gap: espaciado.md,
  },
  seccionEncabezado: {
    gap: 3,
  },
  seccionTitulo: {
    color: colores.texto,
    fontSize: 21,
    fontWeight: "900",
  },
  seccionDescripcion: {
    color: colores.textoSuave,
    fontSize: 14,
    lineHeight: 20,
  },
  filaPerfil: {
    flexDirection: "row",
    alignItems: "center",
    gap: espaciado.md,
  },
  filaIcono: {
    width: 42,
    height: 42,
    borderRadius: 16,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
  },
  filaTexto: {
    flex: 1,
    gap: 2,
  },
  filaTitulo: {
    color: colores.texto,
    fontSize: 14,
    fontWeight: "900",
  },
  filaValor: {
    color: colores.textoSuave,
    fontSize: 15,
  },
  accionPerfil: {
    backgroundColor: colores.tarjeta,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colores.borde,
    padding: espaciado.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: espaciado.md,
    shadowColor: "#0F172A",
    shadowOpacity: 0.04,
    shadowRadius: 14,
    shadowOffset: {
      width: 0,
      height: 7,
    },
    elevation: 2,
  },
  accionPerfilPresionada: {
    opacity: 0.82,
  },
  accionPerfilDeshabilitada: {
    opacity: 0.72,
  },
  accionIcono: {
    width: 50,
    height: 50,
    borderRadius: 19,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
  },
  accionTexto: {
    flex: 1,
    gap: 3,
  },
  accionTitulo: {
    color: colores.texto,
    fontSize: 17,
    fontWeight: "900",
  },
  accionDescripcion: {
    color: colores.textoSuave,
    fontSize: 14,
    lineHeight: 20,
  },
  zonaSesion: {
    marginTop: espaciado.md,
    marginBottom: espaciado.xl,
  },
});
