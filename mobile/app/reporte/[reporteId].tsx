import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Boton } from "../../src/shared/components/Boton";
import { MensajeEstado } from "../../src/shared/components/MensajeEstado";
import type { ErrorApi } from "../../src/shared/services/manejadorErroresApi";
import { useReporteDetalle } from "../../src/modules/reports/hooks/useMisReportes";
import { useEliminarReporte } from "../../src/modules/reports/hooks/useEliminarReporte";
import type {
  CategoriaReporte,
  EstadoReporte,
  ImagenReporte,
  PrioridadReporte,
  ReporteResumen,
} from "../../src/modules/reports/types/reportes.types";
import { colores } from "../../src/theme/colores";
import { espaciado } from "../../src/theme/espaciado";

const etiquetasEstado: Record<EstadoReporte, string> = {
  PENDIENTE: "Pendiente",
  EN_PROCESO: "En proceso",
  RESUELTO: "Resuelto",
  RECHAZADO: "Rechazado",
};

const etiquetasCategoria: Record<CategoriaReporte, string> = {
  INFRAESTRUCTURA: "Infraestructura",
  LIMPIEZA: "Limpieza",
  SEGURIDAD: "Seguridad",
};

const etiquetasPrioridad: Record<PrioridadReporte, string> = {
  ALTA: "Alta",
  MEDIA: "Media",
  BAJA: "Baja",
};

function obtenerReporteId(parametro: string | string[] | undefined) {
  if (Array.isArray(parametro)) {
    return parametro[0] ?? "";
  }

  return parametro ?? "";
}

function obtenerMensajeError(error: unknown) {
  const errorApi = error as Partial<ErrorApi>;

  return (
    errorApi.mensaje ??
    "No fue posible cargar el detalle del reporte. Revisa tu conexión e intenta nuevamente."
  );
}

function obtenerColorEstado(estado: EstadoReporte) {
  if (estado === "RESUELTO") {
    return {
      fondo: "#ECFDF5",
      texto: colores.exito,
      icono: "checkmark-circle-outline" as const,
    };
  }

  if (estado === "EN_PROCESO") {
    return {
      fondo: "#EFF6FF",
      texto: colores.primario,
      icono: "sync-outline" as const,
    };
  }

  if (estado === "RECHAZADO") {
    return {
      fondo: "#FEF2F2",
      texto: colores.error,
      icono: "close-circle-outline" as const,
    };
  }

  return {
    fondo: "#FFFBEB",
    texto: colores.advertencia,
    icono: "time-outline" as const,
  };
}

function obtenerIconoCategoria(categoria: CategoriaReporte) {
  if (categoria === "LIMPIEZA") {
    return "trash-outline" as const;
  }

  if (categoria === "SEGURIDAD") {
    return "shield-checkmark-outline" as const;
  }

  return "construct-outline" as const;
}

function formatearFecha(fecha?: string) {
  if (!fecha) {
    return "Fecha no disponible";
  }

  const fechaParseada = new Date(fecha);

  if (Number.isNaN(fechaParseada.getTime())) {
    return "Fecha no disponible";
  }

  return new Intl.DateTimeFormat("es-GT", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(fechaParseada);
}

function formatearCoordenada(valor?: number | null) {
  if (valor === null || valor === undefined) {
    return null;
  }

  return new Intl.NumberFormat("es-GT", {
    maximumFractionDigits: 6,
  }).format(valor);
}

function obtenerUrlImagen(imagen?: ImagenReporte) {
  if (!imagen) {
    return null;
  }

  return imagen.url ?? imagen.imageUrl ?? imagen.ImageUrl ?? null;
}

function obtenerImagenPrincipal(reporte: ReporteResumen) {
  if (!Array.isArray(reporte.images) || reporte.images.length === 0) {
    return null;
  }

  return obtenerUrlImagen(reporte.images[0]);
}

function FilaDetalle({
  icono,
  titulo,
  valor,
}: {
  icono: keyof typeof Ionicons.glyphMap;
  titulo: string;
  valor: string;
}) {
  return (
    <View style={styles.filaDetalle}>
      <View style={styles.filaDetalleIcono}>
        <Ionicons name={icono} size={18} color={colores.primario} />
      </View>

      <View style={styles.filaDetalleTexto}>
        <Text style={styles.filaDetalleTitulo}>{titulo}</Text>
        <Text style={styles.filaDetalleValor}>{valor}</Text>
      </View>
    </View>
  );
}

function EncabezadoDetalle({ reporte }: { reporte: ReporteResumen }) {
  const estado = obtenerColorEstado(reporte.status);

  return (
    <View style={styles.hero}>
      <Pressable
        accessibilityRole="button"
        style={styles.botonVolver}
        onPress={() => router.back()}
      >
        <Ionicons name="chevron-back" size={20} color={colores.texto} />
      </Pressable>

      <View style={styles.heroTexto}>
        <Text style={styles.heroEtiqueta}>Detalle ciudadano</Text>
        <Text style={styles.heroTitulo}>{reporte.title}</Text>
        <Text style={styles.heroDescripcion}>
          Revisa la información registrada y el estado actual de tu reporte.
        </Text>
      </View>

      <View style={[styles.estadoPrincipal, { backgroundColor: estado.fondo }]}>
        <Ionicons name={estado.icono} size={20} color={estado.texto} />
        <Text style={[styles.estadoPrincipalTexto, { color: estado.texto }]}>
          {etiquetasEstado[reporte.status] ?? reporte.status}
        </Text>
      </View>
    </View>
  );
}

export default function ReporteDetalleMobileScreen() {
  const parametros = useLocalSearchParams<{ reporteId?: string | string[] }>();
  const reporteId = obtenerReporteId(parametros.reporteId);

  const consultaDetalle = useReporteDetalle(reporteId);
  const eliminarReporteMutation = useEliminarReporte();
  const reporte = consultaDetalle.data?.reporte ?? null;
  const mensajeError = consultaDetalle.error
    ? obtenerMensajeError(consultaDetalle.error)
    : null;
  const imagenPrincipal = reporte ? obtenerImagenPrincipal(reporte) : null;

  const refrescar = () => {
    void consultaDetalle.refetch();
  };

  const confirmarEliminacion = () => {
    Alert.alert(
      "Eliminar reporte",
      "Esta acción eliminará el reporte y sus imágenes asociadas. No podrás deshacer este cambio.",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await eliminarReporteMutation.mutateAsync(reporteId);
              router.replace("/mis-reportes");
            } catch (error) {
              Alert.alert("No se pudo eliminar", obtenerMensajeError(error));
            }
          },
        },
      ],
    );
  };

  if (!reporteId) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.estadoCentrado}>
          <MensajeEstado variante="error" titulo="Reporte no identificado">
            No fue posible identificar el reporte que deseas consultar.
          </MensajeEstado>

          <Boton variante="secundario" onPress={() => router.back()}>
            Volver
          </Boton>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.contenido}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={consultaDetalle.isRefetching}
            onRefresh={refrescar}
            tintColor={colores.primario}
          />
        }
      >
        {consultaDetalle.isLoading ? (
          <View style={styles.estadoCentrado}>
            <ActivityIndicator color={colores.primario} size="large" />
            <Text style={styles.estadoTexto}>
              Cargando detalle del reporte...
            </Text>
          </View>
        ) : null}

        {mensajeError ? (
          <View style={styles.estadoCentrado}>
            <MensajeEstado
              variante="error"
              titulo="No se pudo cargar el reporte"
            >
              {mensajeError}
            </MensajeEstado>

            <Boton variante="secundario" onPress={refrescar}>
              Reintentar
            </Boton>
          </View>
        ) : null}

        {!consultaDetalle.isLoading && !mensajeError && !reporte ? (
          <View style={styles.estadoCentrado}>
            <MensajeEstado
              variante="advertencia"
              titulo="Reporte no encontrado"
            >
              No encontramos información para este reporte.
            </MensajeEstado>

            <Boton variante="secundario" onPress={() => router.back()}>
              Volver
            </Boton>
          </View>
        ) : null}

        {reporte ? (
          <>
            <EncabezadoDetalle reporte={reporte} />

            {imagenPrincipal ? (
              <View style={styles.imagenContenedor}>
                <Image
                  source={{ uri: imagenPrincipal }}
                  style={styles.imagen}
                />
              </View>
            ) : (
              <View style={styles.sinImagen}>
                <Ionicons
                  name="image-outline"
                  size={36}
                  color={colores.primario}
                />
                <Text style={styles.sinImagenTitulo}>
                  Sin imagen disponible
                </Text>
              </View>
            )}

            <View style={styles.tarjeta}>
              <View style={styles.tarjetaEncabezado}>
                <View style={styles.tarjetaIcono}>
                  <Ionicons
                    name={obtenerIconoCategoria(reporte.category)}
                    size={22}
                    color={colores.primario}
                  />
                </View>

                <View style={styles.tarjetaTexto}>
                  <Text style={styles.tarjetaTitulo}>
                    Información del reporte
                  </Text>
                  <Text style={styles.tarjetaDescripcion}>
                    Datos enviados por el ciudadano.
                  </Text>
                </View>
              </View>

              <Text style={styles.descripcionReporte}>
                {reporte.description}
              </Text>

              <View style={styles.badges}>
                <View style={styles.badge}>
                  <Text style={styles.badgeTexto}>
                    {etiquetasCategoria[reporte.category] ?? reporte.category}
                  </Text>
                </View>

                <View style={styles.badge}>
                  <Text style={styles.badgeTexto}>
                    Prioridad{" "}
                    {etiquetasPrioridad[reporte.priority] ?? reporte.priority}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.tarjeta}>
              <Text style={styles.seccionTitulo}>Seguimiento</Text>

              <FilaDetalle
                icono="calendar-outline"
                titulo="Fecha de creación"
                valor={formatearFecha(reporte.createdAt)}
              />

              <FilaDetalle
                icono="refresh-outline"
                titulo="Última actualización"
                valor={formatearFecha(reporte.updatedAt)}
              />
            </View>

            <View style={styles.tarjeta}>
              <Text style={styles.seccionTitulo}>Ubicación</Text>

              <FilaDetalle
                icono="location-outline"
                titulo="Dirección o referencia"
                valor={reporte.address?.trim() || "Sin dirección registrada"}
              />

              <FilaDetalle
                icono="navigate-outline"
                titulo="Coordenadas"
                valor={
                  formatearCoordenada(reporte.latitude) &&
                  formatearCoordenada(reporte.longitude)
                    ? `${formatearCoordenada(reporte.latitude)}, ${formatearCoordenada(reporte.longitude)}`
                    : "Sin coordenadas registradas"
                }
              />
            </View>

            <Boton variante="secundario" onPress={refrescar}>
              Actualizar detalle
            </Boton>

            <Boton
              variante="fantasma"
              cargando={eliminarReporteMutation.isPending}
              onPress={confirmarEliminacion}
            >
              Eliminar reporte
            </Boton>
          </>
        ) : null}
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
  estadoCentrado: {
    flex: 1,
    minHeight: 420,
    justifyContent: "center",
    gap: espaciado.lg,
  },
  estadoTexto: {
    color: colores.textoSuave,
    fontSize: 15,
    textAlign: "center",
    fontWeight: "700",
  },
  hero: {
    gap: espaciado.lg,
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
  },
  heroTexto: {
    gap: espaciado.sm,
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
    fontSize: 30,
    fontWeight: "900",
    letterSpacing: -0.7,
  },
  heroDescripcion: {
    color: colores.textoSuave,
    fontSize: 16,
    lineHeight: 23,
  },
  estadoPrincipal: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: espaciado.sm,
    borderRadius: 999,
    paddingVertical: 9,
    paddingHorizontal: espaciado.md,
  },
  estadoPrincipalTexto: {
    fontSize: 14,
    fontWeight: "900",
  },
  imagenContenedor: {
    overflow: "hidden",
    borderRadius: 24,
    backgroundColor: "#E2E8F0",
    borderWidth: 1,
    borderColor: colores.borde,
  },
  imagen: {
    width: "100%",
    height: 260,
  },
  sinImagen: {
    backgroundColor: colores.tarjeta,
    borderRadius: 24,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colores.borde,
    minHeight: 180,
    alignItems: "center",
    justifyContent: "center",
    gap: espaciado.sm,
  },
  sinImagenTitulo: {
    color: colores.texto,
    fontSize: 17,
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
  tarjetaEncabezado: {
    flexDirection: "row",
    gap: espaciado.md,
    alignItems: "center",
  },
  tarjetaIcono: {
    width: 46,
    height: 46,
    borderRadius: 18,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
  },
  tarjetaTexto: {
    flex: 1,
    gap: 2,
  },
  tarjetaTitulo: {
    color: colores.texto,
    fontSize: 19,
    fontWeight: "900",
  },
  tarjetaDescripcion: {
    color: colores.textoSuave,
    fontSize: 14,
    lineHeight: 20,
  },
  descripcionReporte: {
    color: colores.textoSuave,
    fontSize: 16,
    lineHeight: 24,
  },
  badges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: espaciado.sm,
  },
  badge: {
    backgroundColor: "#F8FAFC",
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: espaciado.md,
    borderWidth: 1,
    borderColor: colores.borde,
  },
  badgeTexto: {
    color: colores.textoSuave,
    fontSize: 13,
    fontWeight: "800",
  },
  seccionTitulo: {
    color: colores.texto,
    fontSize: 19,
    fontWeight: "900",
  },
  filaDetalle: {
    flexDirection: "row",
    gap: espaciado.md,
    alignItems: "center",
  },
  filaDetalleIcono: {
    width: 40,
    height: 40,
    borderRadius: 16,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
  },
  filaDetalleTexto: {
    flex: 1,
    gap: 2,
  },
  filaDetalleTitulo: {
    color: colores.texto,
    fontSize: 14,
    fontWeight: "900",
  },
  filaDetalleValor: {
    color: colores.textoSuave,
    fontSize: 14,
    lineHeight: 20,
  },
});
