import { zodResolver } from "@hookform/resolvers/zod";
import { Link, router, type Href } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, Text, View } from "react-native";
import { z } from "zod";

import { Boton } from "../src/shared/components/Boton";
import { CampoTexto } from "../src/shared/components/CampoTexto";
import { MensajeEstado } from "../src/shared/components/MensajeEstado";
import { Pantalla } from "../src/shared/components/Pantalla";
import type { ErrorApi } from "../src/shared/services/manejadorErroresApi";
import { useAuth } from "../src/modules/auth/hooks/useAuth";
import { colores } from "../src/theme/colores";
import { espaciado } from "../src/theme/espaciado";

const rutaVerificarCorreo = "/verificar-correo" as Href;

const esquemaLogin = z.object({
  emailOrUsername: z.string().trim().min(1, "Ingresa tu correo o usuario."),
  password: z.string().min(1, "Ingresa tu contraseña."),
});

type ValoresLogin = z.infer<typeof esquemaLogin>;

function obtenerMensajeError(error: unknown) {
  const errorApi = error as Partial<ErrorApi>;

  return (
    errorApi.mensaje ??
    "No fue posible iniciar sesión. Revisa tus datos e intenta nuevamente."
  );
}

export default function LoginScreen() {
  const { iniciarSesion } = useAuth();
  const [mensajeError, setMensajeError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ValoresLogin>({
    resolver: zodResolver(esquemaLogin),
    defaultValues: {
      emailOrUsername: "",
      password: "",
    },
  });

  const enviar = async (valores: ValoresLogin) => {
    setMensajeError(null);

    try {
      await iniciarSesion(valores);
      router.replace("/inicio");
    } catch (error) {
      setMensajeError(obtenerMensajeError(error));
    }
  };

  return (
    <Pantalla>
      <View style={styles.encabezado}>
        <Text style={styles.marca}>Ciudad Activa</Text>
        <Text style={styles.titulo}>Bienvenido ciudadano</Text>
        <Text style={styles.descripcion}>
          Inicia sesión para crear reportes urbanos y dar seguimiento a tus
          casos.
        </Text>
      </View>

      {mensajeError ? (
        <MensajeEstado variante="error" titulo="No fue posible iniciar sesión">
          {mensajeError}
        </MensajeEstado>
      ) : null}

      <View style={styles.formulario}>
        <Controller
          control={control}
          name="emailOrUsername"
          render={({ field: { value, onChange, onBlur } }) => (
            <CampoTexto
              etiqueta="Correo o usuario"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              placeholder="correo@ejemplo.com"
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              error={errors.emailOrUsername?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({ field: { value, onChange, onBlur } }) => (
            <CampoTexto
              etiqueta="Contraseña"
              placeholder="Ingresa tu contraseña"
              secureTextEntry
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              error={errors.password?.message}
            />
          )}
        />

        <Boton cargando={isSubmitting} onPress={handleSubmit(enviar)}>
          Ingresar
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
    marginTop: espaciado.xl,
  },
  marca: {
    color: colores.primario,
    fontSize: 16,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  titulo: {
    color: colores.texto,
    fontSize: 30,
    fontWeight: "900",
  },
  descripcion: {
    color: colores.textoSuave,
    fontSize: 16,
    lineHeight: 23,
  },
  formulario: {
    gap: espaciado.lg,
    marginTop: espaciado.lg,
  },
  pie: {
    alignItems: "center",
    gap: espaciado.sm,
    marginTop: espaciado.xl,
  },
  textoPie: {
    color: colores.textoSuave,
  },
  enlace: {
    color: colores.primario,
    fontWeight: "800",
  },
});
