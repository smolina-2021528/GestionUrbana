import { Ionicons } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';
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
import { useMisReportes } from '../src/modules/reports/hooks/useMisReportes';
import type {
  CategoriaReporte,
  EstadoReporte,
  PrioridadReporte,
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

const etiquetasCategoria: Record<CategoriaReporte, string> = {
  INFRAESTRUCTURA: 'Infraestructura',
  LIMPIEZA: 'Limpieza',
  SEGURIDAD: 'Seguridad'
};

const etiquetasPrioridad: Record<PrioridadReporte, string> = {
  ALTA: 'Alta',
  MEDIA: 'Media',
  BAJA: 'Baja'
};

function obtenerMensajeError(error: unknown) {
  const errorApi = error as Partial<ErrorApi>;

  return (
    errorApi.mensaje ??
    'No fue posible cargar tus reportes. Revisa tu conexión e intenta nuevamente.'
  );
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

function obtenerIconoCategoria(categoria: CategoriaReporte) {
  if (categoria === 'LIMPIEZA') {
    return 'trash-outline' as const;
  }

  if (categoria === 'SEGURIDAD') {
    return 'shield-checkmark-outline' as const;
  }

  return 'construct-outline' as const;
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

function truncarTexto(texto: string, limite = 120) {
  if (texto.length <= limite) {
    return texto;
  }

  return `${texto.slice(0, limite).trim()}...`;
}

function TarjetaReporte({ reporte }: { reporte: ReporteResumen }) {
  const estado = obtenerColorEstado(reporte.status);
  const tieneUbicacion = Boolean(reporte.address || reporte.latitude || reporte.longitude);

  const abrirDetalle = () => {
  router.push(`/reporte/${encodeURIComponent(reporte.id)}` as Href);
};

  return (
    <Pressable
      accessibilityRole="button"
      onPress={abrirDetalle}
      style={({ pressed }) => [
        styles.tarjetaReporte,
        pressed ? styles.tarjetaReportePresionada : null
      ]}
    >
      <View style={styles.tarjetaReporteEncabezado}>
        <View style={styles.iconoCategoria}>
          <Ionicons
            name={obtenerIconoCategoria(reporte.category)}
            size={22}
            color={colores.primario}
          />
        </View>

        <View style={styles.reporteInfoPrincipal}>
          <Text style={styles.reporteTitulo}>{reporte.title}</Text>
          <Text style={styles.reporteFecha}>{formatearFecha(reporte.createdAt)}</Text>
        </View>

        <Ionicons name="chevron-forward" size={20} color={colores.textoSuave} />
      </View>

      <Text style={styles.reporteDescripcion}>{truncarTexto(reporte.description)}</Text>

      <View style={styles.reporteMeta}>
        <View style={[styles.estadoBadge, { backgroundColor: estado.fondo }]}>
          <Ionicons name={estado.icono} size={15} color={estado.texto} />
          <Text style={[styles.estadoTexto, { color: estado.texto }]}>
            {etiquetasEstado[reporte.status] ?? reporte.status}
          </Text>
        </View>

        <View style={styles.metaBadge}>
          <Text style={styles.metaTexto}>
            {etiquetasCategoria[reporte.category] ?? reporte.category}
          </Text>
        </View>

        <View style={styles.metaBadge}>
          <Text style={styles.metaTexto}>
            {etiquetasPrioridad[reporte.priority] ?? reporte.priority}
          </Text>
        </View>
      </View>

      <View style={styles.ubicacionFila}>
        <Ionicons
          name={tieneUbicacion ? 'location-outline' : 'alert-circle-outline'}
          size={17}
          color={tieneUbicacion ? colores.primario : colores.textoSuave}
        />
        <Text style={styles.ubicacionTexto}>
          {reporte.address?.trim()
            ? reporte.address
            : tieneUbicacion
              ? 'Ubicación registrada'
              : 'Sin ubicación registrada'}
        </Text>
      </View>
    </Pressable>
  );
}

export default function MisReportesScreen() {
  const consultaReportes = useMisReportes();

  const reportes = consultaReportes.data?.reportes ?? [];
  const mensajeError = consultaReportes.error
    ? obtenerMensajeError(consultaReportes.error)
    : null;

  const refrescar = () => {
    void consultaReportes.refetch();
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
          <Pressable
            accessibilityRole="button"
            style={styles.botonVolver}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={20} color={colores.texto} />
          </Pressable>

          <View style={styles.heroTexto}>
            <Text style={styles.heroEtiqueta}>Seguimiento ciudadano</Text>
            <Text style={styles.heroTitulo}>Mis reportes</Text>
            <Text style={styles.heroDescripcion}>
              Consulta el estado de los casos que has enviado.
            </Text>
          </View>
        </View>

        <View style={styles.resumen}>
          <View style={styles.resumenIcono}>
            <Ionicons name="document-text-outline" size={24} color={colores.primario} />
          </View>

          <View style={styles.resumenTexto}>
            <Text style={styles.resumenTitulo}>{reportes.length}</Text>
            <Text style={styles.resumenDescripcion}>
              {reportes.length === 1 ? 'reporte registrado' : 'reportes registrados'}
            </Text>
          </View>

          <Boton variante="secundario" onPress={() => router.push('/crear-reporte')}>
            Nuevo
          </Boton>
        </View>

        {mensajeError ? (
          <MensajeEstado variante="error" titulo="No se pudieron cargar tus reportes">
            {mensajeError}
          </MensajeEstado>
        ) : null}

        {consultaReportes.isLoading ? (
          <View style={styles.estadoCarga}>
            <ActivityIndicator color={colores.primario} size="large" />
            <Text style={styles.estadoCargaTexto}>Cargando tus reportes...</Text>
          </View>
        ) : null}

        {!consultaReportes.isLoading && !mensajeError && reportes.length === 0 ? (
          <View style={styles.estadoVacio}>
            <View style={styles.estadoVacioIcono}>
              <Ionicons name="map-outline" size={42} color={colores.primario} />
            </View>

            <Text style={styles.estadoVacioTitulo}>Aún no tienes reportes</Text>
            <Text style={styles.estadoVacioTexto}>
              Cuando envíes tu primer reporte, podrás darle seguimiento desde esta pantalla.
            </Text>

            <Boton onPress={() => router.push('/crear-reporte')}>
              Crear mi primer reporte
            </Boton>
          </View>
        ) : null}

        {!consultaReportes.isLoading && reportes.length > 0 ? (
          <View style={styles.listaReportes}>
            {reportes.map((reporte) => (
              <TarjetaReporte key={reporte.id} reporte={reporte} />
            ))}
          </View>
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
  resumen: {
    backgroundColor: colores.tarjeta,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colores.borde,
    padding: espaciado.lg,
    flexDirection: 'row',
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
  resumenIcono: {
    width: 52,
    height: 52,
    borderRadius: 20,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center'
  },
  resumenTexto: {
    flex: 1
  },
  resumenTitulo: {
    color: colores.texto,
    fontSize: 26,
    fontWeight: '900'
  },
  resumenDescripcion: {
    color: colores.textoSuave,
    fontSize: 14
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
  estadoVacio: {
    backgroundColor: colores.tarjeta,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colores.borde,
    padding: espaciado.xl,
    alignItems: 'center',
    gap: espaciado.md
  },
  estadoVacioIcono: {
    width: 76,
    height: 76,
    borderRadius: 28,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center'
  },
  estadoVacioTitulo: {
    color: colores.texto,
    fontSize: 21,
    fontWeight: '900',
    textAlign: 'center'
  },
  estadoVacioTexto: {
    color: colores.textoSuave,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center'
  },
  listaReportes: {
    gap: espaciado.md
  },
  tarjetaReporte: {
    backgroundColor: colores.tarjeta,
    borderRadius: 22,
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
  tarjetaReportePresionada: {
    opacity: 0.82
  },
  tarjetaReporteEncabezado: {
    flexDirection: 'row',
    gap: espaciado.md,
    alignItems: 'center'
  },
  iconoCategoria: {
    width: 48,
    height: 48,
    borderRadius: 18,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center'
  },
  reporteInfoPrincipal: {
    flex: 1,
    gap: 3
  },
  reporteTitulo: {
    color: colores.texto,
    fontSize: 18,
    fontWeight: '900'
  },
  reporteFecha: {
    color: colores.textoSuave,
    fontSize: 13
  },
  reporteDescripcion: {
    color: colores.textoSuave,
    fontSize: 15,
    lineHeight: 22
  },
  reporteMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: espaciado.sm
  },
  estadoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: espaciado.md
  },
  estadoTexto: {
    fontSize: 13,
    fontWeight: '900'
  },
  metaBadge: {
    backgroundColor: '#F8FAFC',
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: espaciado.md,
    borderWidth: 1,
    borderColor: colores.borde
  },
  metaTexto: {
    color: colores.textoSuave,
    fontSize: 13,
    fontWeight: '800'
  },
  ubicacionFila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaciado.sm
  },
  ubicacionTexto: {
    flex: 1,
    color: colores.textoSuave,
    fontSize: 14
  }
});