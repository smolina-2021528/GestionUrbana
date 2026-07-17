import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Boton } from '../src/shared/components/Boton';
import { MensajeEstado } from '../src/shared/components/MensajeEstado';
import type { ErrorApi } from '../src/shared/services/manejadorErroresApi';
import { useAuth } from '../src/modules/auth/hooks/useAuth';
import { useMisReportes } from '../src/modules/reports/hooks/useMisReportes';
import type {
  EstadoReporte,
  ReporteResumen
} from '../src/modules/reports/types/reportes.types';
import { colores } from '../src/theme/colores';
import { espaciado } from '../src/theme/espaciado';

const etiquetasEstado: Record<EstadoReporte, string> = {
  PENDIENTE: 'Pendiente',
  EN_PROCESO: 'En proceso',
  RESUELTO: 'Resuelto',
  RECHAZADO: 'Rechazado'
};

function obtenerPrimerNombre(nombre?: string) {
  if (!nombre?.trim()) {
    return 'ciudadano';
  }

  return nombre.trim().split(' ')[0];
}

function obtenerMensajeError(error: unknown) {
  const errorApi = error as Partial<ErrorApi>;

  return (
    errorApi.mensaje ??
    'No fue posible cargar tu resumen ciudadano. Revisa tu conexión e intenta nuevamente.'
  );
}

function contarPorEstado(reportes: ReporteResumen[], estado: EstadoReporte) {
  return reportes.filter((reporte) => reporte.status === estado).length;
}

function obtenerUltimoReporte(reportes: ReporteResumen[]) {
  if (reportes.length === 0) {
    return null;
  }

  return [...reportes].sort((a, b) => {
    const fechaA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const fechaB = b.createdAt ? new Date(b.createdAt).getTime() : 0;

    return fechaB - fechaA;
  })[0];
}

function formatearFecha(fecha?: string) {
  if (!fecha) {
    return 'Fecha no disponible';
  }

  const fechaParseada = new Date(fecha);

  if (Number.isNaN(fechaParseada.getTime())) {
    return 'Fecha no disponible';
  }

  return new Intl.DateTimeFormat('es-GT', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(fechaParseada);
}

function obtenerColorEstado(estado: EstadoReporte) {
  if (estado === 'RESUELTO') {
    return {
      fondo: '#ECFDF5',
      texto: colores.exito,
      icono: 'checkmark-circle-outline' as const
    };
  }

  if (estado === 'EN_PROCESO') {
    return {
      fondo: '#EFF6FF',
      texto: colores.primario,
      icono: 'sync-outline' as const
    };
  }

  if (estado === 'RECHAZADO') {
    return {
      fondo: '#FEF2F2',
      texto: colores.error,
      icono: 'close-circle-outline' as const
    };
  }

  return {
    fondo: '#FFFBEB',
    texto: colores.advertencia,
    icono: 'time-outline' as const
  };
}

function TarjetaMetrica({
  titulo,
  valor,
  icono,
  tono
}: {
  titulo: string;
  valor: number;
  icono: keyof typeof Ionicons.glyphMap;
  tono: 'azul' | 'amarillo' | 'verde';
}) {
  const estilosTono = {
    azul: {
      fondo: '#EFF6FF',
      icono: colores.primario
    },
    amarillo: {
      fondo: '#FFFBEB',
      icono: colores.advertencia
    },
    verde: {
      fondo: '#ECFDF5',
      icono: colores.exito
    }
  }[tono];

  return (
    <View style={styles.metrica}>
      <View style={[styles.metricaIcono, { backgroundColor: estilosTono.fondo }]}>
        <Ionicons name={icono} size={22} color={estilosTono.icono} />
      </View>

      <Text style={styles.metricaValor}>{valor}</Text>
      <Text style={styles.metricaTitulo}>{titulo}</Text>
    </View>
  );
}

function AccesoRapido({
  titulo,
  descripcion,
  icono,
  onPress
}: {
  titulo: string;
  descripcion: string;
  icono: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.acceso,
        pressed ? styles.accesoPresionado : null
      ]}
    >
      <View style={styles.accesoIcono}>
        <Ionicons name={icono} size={24} color={colores.primario} />
      </View>

      <View style={styles.accesoTexto}>
        <Text style={styles.accesoTitulo}>{titulo}</Text>
        <Text style={styles.accesoDescripcion}>{descripcion}</Text>
      </View>

      <Ionicons name="chevron-forward" size={20} color={colores.textoSuave} />
    </Pressable>
  );
}

function UltimoReporteCard({ reporte }: { reporte: ReporteResumen | null }) {
  if (!reporte) {
    return (
      <View style={styles.ultimoReporteVacio}>
        <View style={styles.ultimoReporteVacioIcono}>
          <Ionicons name="map-outline" size={34} color={colores.primario} />
        </View>

        <Text style={styles.ultimoReporteVacioTitulo}>Aún no has creado reportes</Text>
        <Text style={styles.ultimoReporteVacioTexto}>
          Cuando envíes tu primer reporte, aparecerá aquí para darle seguimiento rápido.
        </Text>

        <Boton onPress={() => router.push('/crear-reporte')}>
          Crear primer reporte
        </Boton>
      </View>
    );
  }

  const estado = obtenerColorEstado(reporte.status);

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => router.push(`/reporte/${encodeURIComponent(reporte.id)}` as never)}
      style={({ pressed }) => [
        styles.ultimoReporte,
        pressed ? styles.accesoPresionado : null
      ]}
    >
      <View style={styles.ultimoReporteEncabezado}>
        <View style={[styles.estadoIcono, { backgroundColor: estado.fondo }]}>
          <Ionicons name={estado.icono} size={22} color={estado.texto} />
        </View>

        <View style={styles.ultimoReporteTexto}>
          <Text style={styles.ultimoReporteEtiqueta}>Último reporte</Text>
          <Text style={styles.ultimoReporteTitulo}>{reporte.title}</Text>
        </View>
      </View>

      <Text style={styles.ultimoReporteDescripcion} numberOfLines={2}>
        {reporte.description}
      </Text>

      <View style={styles.ultimoReportePie}>
        <View style={[styles.estadoBadge, { backgroundColor: estado.fondo }]}>
          <Text style={[styles.estadoTexto, { color: estado.texto }]}>
            {etiquetasEstado[reporte.status] ?? reporte.status}
          </Text>
        </View>

        <Text style={styles.ultimoReporteFecha}>
          {formatearFecha(reporte.createdAt)}
        </Text>
      </View>
    </Pressable>
  );
}

export default function InicioScreen() {
  const { usuario, cerrarSesion } = useAuth();
  const consultaReportes = useMisReportes();

  const reportes = consultaReportes.data?.reportes ?? [];
  const totalReportes = reportes.length;
  const reportesPendientes = contarPorEstado(reportes, 'PENDIENTE');
  const reportesEnProceso = contarPorEstado(reportes, 'EN_PROCESO');
  const reportesResueltos = contarPorEstado(reportes, 'RESUELTO');
  const ultimoReporte = obtenerUltimoReporte(reportes);

  const mensajeError = consultaReportes.error
    ? obtenerMensajeError(consultaReportes.error)
    : null;

  const refrescar = () => {
    void consultaReportes.refetch();
  };

  const manejarCerrarSesion = async () => {
    await cerrarSesion();
    router.replace('/login');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.contenido}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={consultaReportes.isRefetching}
            onRefresh={refrescar}
            tintColor={colores.primario}
          />
        }
      >
        <View style={styles.hero}>
          <View style={styles.heroSuperior}>
            <View style={styles.avatar}>
              <Text style={styles.avatarTexto}>
                {obtenerPrimerNombre(usuario?.name).charAt(0).toUpperCase()}
              </Text>
            </View>

            <Pressable
              accessibilityRole="button"
              style={styles.botonCerrarSesion}
              onPress={manejarCerrarSesion}
            >
              <Ionicons name="log-out-outline" size={20} color={colores.textoSuave} />
            </Pressable>
          </View>

          <View style={styles.heroTexto}>
            <Text style={styles.heroEtiqueta}>Ciudad Activa</Text>
            <Text style={styles.heroTitulo}>
              Hola, {obtenerPrimerNombre(usuario?.name)}
            </Text>
            <Text style={styles.heroDescripcion}>
              Reporta problemas urbanos y revisa el avance de tus solicitudes ciudadanas.
            </Text>
          </View>
        </View>

        {mensajeError ? (
          <MensajeEstado variante="error" titulo="No se pudo cargar tu resumen">
            {mensajeError}
          </MensajeEstado>
        ) : null}

        {consultaReportes.isLoading ? (
          <View style={styles.estadoCarga}>
            <ActivityIndicator color={colores.primario} size="large" />
            <Text style={styles.estadoCargaTexto}>Cargando resumen ciudadano...</Text>
          </View>
        ) : null}

        {!consultaReportes.isLoading ? (
          <>
            <View style={styles.resumenPrincipal}>
              <View style={styles.resumenIcono}>
                <Ionicons name="document-text-outline" size={26} color={colores.primario} />
              </View>

              <View style={styles.resumenTexto}>
                <Text style={styles.resumenValor}>{totalReportes}</Text>
                <Text style={styles.resumenTitulo}>
                  {totalReportes === 1 ? 'reporte ciudadano' : 'reportes ciudadanos'}
                </Text>
                <Text style={styles.resumenDescripcion}>
                  Este es el historial de solicitudes registradas con tu cuenta.
                </Text>
              </View>
            </View>

            <View style={styles.metricas}>
              <TarjetaMetrica
                titulo="Pendientes"
                valor={reportesPendientes}
                icono="time-outline"
                tono="amarillo"
              />

              <TarjetaMetrica
                titulo="En proceso"
                valor={reportesEnProceso}
                icono="sync-outline"
                tono="azul"
              />

              <TarjetaMetrica
                titulo="Resueltos"
                valor={reportesResueltos}
                icono="checkmark-circle-outline"
                tono="verde"
              />
            </View>

            <View style={styles.seccion}>
              <View style={styles.seccionEncabezado}>
                <Text style={styles.seccionTitulo}>Acciones rápidas</Text>
                <Text style={styles.seccionDescripcion}>
                  Usa las opciones principales de la app.
                </Text>
              </View>

              <AccesoRapido
                titulo="Crear reporte"
                descripcion="Reporta un problema con foto y ubicación."
                icono="add-circle-outline"
                onPress={() => router.push('/crear-reporte')}
              />

              <AccesoRapido
                titulo="Mis reportes"
                descripcion="Consulta el estado de tus solicitudes."
                icono="albums-outline"
                onPress={() => router.push('/mis-reportes')}
              />
            </View>

            <View style={styles.seccion}>
              <View style={styles.seccionEncabezado}>
                <Text style={styles.seccionTitulo}>Seguimiento reciente</Text>
                <Text style={styles.seccionDescripcion}>
                  Accede rápido a tu último reporte.
                </Text>
              </View>

              <UltimoReporteCard reporte={ultimoReporte} />
            </View>
          </>
        ) : null}
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
    backgroundColor: colores.texto,
    borderRadius: 30,
    padding: espaciado.xl,
    gap: espaciado.xl,
    shadowColor: '#0F172A',
    shadowOpacity: 0.14,
    shadowRadius: 22,
    shadowOffset: {
      width: 0,
      height: 10
    },
    elevation: 4
  },
  heroSuperior: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 20,
    backgroundColor: colores.primario,
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarTexto: {
    color: colores.textoInvertido,
    fontSize: 22,
    fontWeight: '900'
  },
  botonCerrarSesion: {
    width: 44,
    height: 44,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  heroTexto: {
    gap: espaciado.sm
  },
  heroEtiqueta: {
    color: '#93C5FD',
    fontSize: 13,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1
  },
  heroTitulo: {
    color: colores.textoInvertido,
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -0.7
  },
  heroDescripcion: {
    color: '#CBD5E1',
    fontSize: 16,
    lineHeight: 23
  },
  estadoCarga: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: espaciado.md,
    paddingVertical: espaciado.xxl
  },
  estadoCargaTexto: {
    color: colores.textoSuave,
    fontSize: 15,
    fontWeight: '700'
  },
  resumenPrincipal: {
    backgroundColor: colores.tarjeta,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: colores.borde,
    padding: espaciado.lg,
    flexDirection: 'row',
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
  resumenIcono: {
    width: 56,
    height: 56,
    borderRadius: 22,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center'
  },
  resumenTexto: {
    flex: 1,
    gap: 2
  },
  resumenValor: {
    color: colores.texto,
    fontSize: 30,
    fontWeight: '900'
  },
  resumenTitulo: {
    color: colores.texto,
    fontSize: 17,
    fontWeight: '900'
  },
  resumenDescripcion: {
    color: colores.textoSuave,
    fontSize: 14,
    lineHeight: 20
  },
  metricas: {
    flexDirection: 'row',
    gap: espaciado.sm
  },
  metrica: {
    flex: 1,
    backgroundColor: colores.tarjeta,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colores.borde,
    padding: espaciado.md,
    alignItems: 'center',
    gap: espaciado.xs
  },
  metricaIcono: {
    width: 42,
    height: 42,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center'
  },
  metricaValor: {
    color: colores.texto,
    fontSize: 24,
    fontWeight: '900'
  },
  metricaTitulo: {
    color: colores.textoSuave,
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center'
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
  acceso: {
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
  accesoPresionado: {
    opacity: 0.82
  },
  accesoIcono: {
    width: 50,
    height: 50,
    borderRadius: 19,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center'
  },
  accesoTexto: {
    flex: 1,
    gap: 3
  },
  accesoTitulo: {
    color: colores.texto,
    fontSize: 17,
    fontWeight: '900'
  },
  accesoDescripcion: {
    color: colores.textoSuave,
    fontSize: 14,
    lineHeight: 20
  },
  ultimoReporte: {
    backgroundColor: colores.tarjeta,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colores.borde,
    padding: espaciado.lg,
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
  ultimoReporteEncabezado: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaciado.md
  },
  estadoIcono: {
    width: 50,
    height: 50,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center'
  },
  ultimoReporteTexto: {
    flex: 1,
    gap: 3
  },
  ultimoReporteEtiqueta: {
    color: colores.textoSuave,
    fontSize: 13,
    fontWeight: '800'
  },
  ultimoReporteTitulo: {
    color: colores.texto,
    fontSize: 18,
    fontWeight: '900'
  },
  ultimoReporteDescripcion: {
    color: colores.textoSuave,
    fontSize: 15,
    lineHeight: 22
  },
  ultimoReportePie: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: espaciado.md,
    alignItems: 'center'
  },
  estadoBadge: {
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: espaciado.md
  },
  estadoTexto: {
    fontSize: 13,
    fontWeight: '900'
  },
  ultimoReporteFecha: {
    flex: 1,
    color: colores.textoSuave,
    fontSize: 13,
    textAlign: 'right'
  },
  ultimoReporteVacio: {
    backgroundColor: colores.tarjeta,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colores.borde,
    padding: espaciado.xl,
    alignItems: 'center',
    gap: espaciado.md
  },
  ultimoReporteVacioIcono: {
    width: 76,
    height: 76,
    borderRadius: 28,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center'
  },
  ultimoReporteVacioTitulo: {
    color: colores.texto,
    fontSize: 20,
    fontWeight: '900',
    textAlign: 'center'
  },
  ultimoReporteVacioTexto: {
    color: colores.textoSuave,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center'
  }
});