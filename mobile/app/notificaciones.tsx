import { Ionicons } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';
import {
  ActivityIndicator,
  Alert,
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
import {
  useEliminarNotificacion,
  useMarcarNotificacionLeida,
  useMarcarTodasNotificacionesLeidas,
  useNotificaciones
} from '../src/modules/notifications/hooks/useNotificaciones';
import type {
  Notificacion,
  TipoNotificacion
} from '../src/modules/notifications/types/notificaciones.types';
import { colores } from '../src/theme/colores';
import { espaciado } from '../src/theme/espaciado';

const etiquetasTipo: Record<string, string> = {
  STATUS_CHANGED: 'Cambio de estado',
  NEW_COMMENT: 'Nuevo comentario',
  REPORT_ASSIGNED: 'Asignación'
};

function obtenerMensajeError(error: unknown) {
  const errorApi = error as Partial<ErrorApi>;

  return (
    errorApi.mensaje ??
    'No fue posible cargar tus notificaciones. Revisa tu conexión e intenta nuevamente.'
  );
}

function obtenerIconoTipo(tipo: TipoNotificacion) {
  if (tipo === 'STATUS_CHANGED') {
    return 'swap-horizontal-outline' as const;
  }

  if (tipo === 'NEW_COMMENT') {
    return 'chatbubble-ellipses-outline' as const;
  }

  if (tipo === 'REPORT_ASSIGNED') {
    return 'person-add-outline' as const;
  }

  return 'notifications-outline' as const;
}

function obtenerColorTipo(tipo: TipoNotificacion) {
  if (tipo === 'STATUS_CHANGED') {
    return {
      fondo: '#EFF6FF',
      texto: colores.primario
    };
  }

  if (tipo === 'NEW_COMMENT') {
    return {
      fondo: '#ECFDF5',
      texto: colores.exito
    };
  }

  if (tipo === 'REPORT_ASSIGNED') {
    return {
      fondo: '#FFFBEB',
      texto: colores.advertencia
    };
  }

  return {
    fondo: '#F8FAFC',
    texto: colores.textoSuave
  };
}

function formatearFecha(fecha: string) {
  const fechaParseada = new Date(fecha);

  if (Number.isNaN(fechaParseada.getTime())) {
    return 'Fecha no disponible';
  }

  return new Intl.DateTimeFormat('es-GT', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(fechaParseada);
}

function TarjetaNotificacion({
  notificacion,
  marcando,
  eliminando,
  onMarcarLeida,
  onEliminar
}: {
  notificacion: Notificacion;
  marcando: boolean;
  eliminando: boolean;
  onMarcarLeida: (notificacion: Notificacion) => void;
  onEliminar: (notificacion: Notificacion) => void;
}) {
  const coloresTipo = obtenerColorTipo(notificacion.type);
  const reporteId = notificacion.report?.id;

  const abrirReporte = () => {
    if (!reporteId) {
      return;
    }

    router.push(`/reporte/${encodeURIComponent(reporteId)}` as Href);
  };

  return (
    <View
      style={[
        styles.tarjetaNotificacion,
        !notificacion.isRead ? styles.tarjetaNotificacionNoLeida : null
      ]}
    >
      <Pressable
        accessibilityRole={reporteId ? 'button' : 'text'}
        disabled={!reporteId}
        onPress={abrirReporte}
        style={({ pressed }) => [
          styles.notificacionContenido,
          pressed && reporteId ? styles.notificacionPresionada : null
        ]}
      >
        <View style={[styles.notificacionIcono, { backgroundColor: coloresTipo.fondo }]}>
          <Ionicons
            name={obtenerIconoTipo(notificacion.type)}
            size={22}
            color={coloresTipo.texto}
          />
        </View>

        <View style={styles.notificacionTexto}>
          <View style={styles.notificacionTituloFila}>
            <Text style={styles.notificacionTipo}>
              {etiquetasTipo[notificacion.type] ?? 'Notificación'}
            </Text>

            {!notificacion.isRead ? (
              <View style={styles.indicadorNoLeida}>
                <Text style={styles.indicadorNoLeidaTexto}>Nueva</Text>
              </View>
            ) : null}
          </View>

          <Text style={styles.notificacionMensaje}>{notificacion.message}</Text>

          {notificacion.report ? (
            <Text style={styles.notificacionReporte} numberOfLines={1}>
              Reporte: {notificacion.report.title}
            </Text>
          ) : null}

          <Text style={styles.notificacionFecha}>{formatearFecha(notificacion.createdAt)}</Text>
        </View>

        {reporteId ? (
          <Ionicons name="chevron-forward" size={20} color={colores.textoSuave} />
        ) : null}
      </Pressable>

      <View style={styles.notificacionAcciones}>
        {!notificacion.isRead ? (
          <Boton
            variante="secundario"
            cargando={marcando}
            deshabilitado={eliminando}
            onPress={() => onMarcarLeida(notificacion)}
          >
            Marcar leída
          </Boton>
        ) : null}

        <Boton
          variante="fantasma"
          cargando={eliminando}
          deshabilitado={marcando}
          onPress={() => onEliminar(notificacion)}
        >
          Eliminar
        </Boton>
      </View>
    </View>
  );
}

export default function NotificacionesScreen() {
  const consultaNotificaciones = useNotificaciones({
    page: 1,
    limit: 30
  });

  const mutacionMarcarLeida = useMarcarNotificacionLeida();
  const mutacionMarcarTodas = useMarcarTodasNotificacionesLeidas();
  const mutacionEliminar = useEliminarNotificacion();

  const notificaciones = consultaNotificaciones.data?.notificaciones ?? [];
  const unreadCount = consultaNotificaciones.data?.unreadCount ?? 0;

  const mensajeError = consultaNotificaciones.error
    ? obtenerMensajeError(consultaNotificaciones.error)
    : null;

  const refrescar = () => {
    void consultaNotificaciones.refetch();
  };

  const marcarLeida = (notificacion: Notificacion) => {
    mutacionMarcarLeida.mutate(notificacion.id);
  };

  const marcarTodas = () => {
    if (unreadCount === 0) {
      return;
    }

    mutacionMarcarTodas.mutate();
  };

  const eliminarNotificacion = (notificacion: Notificacion) => {
    Alert.alert(
      'Eliminar notificación',
      'Esta notificación se quitará de tu lista. ¿Deseas continuar?',
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => mutacionEliminar.mutate(notificacion.id)
        }
      ]
    );
  };

  const estaActualizando =
    consultaNotificaciones.isRefetching ||
    mutacionMarcarLeida.isPending ||
    mutacionMarcarTodas.isPending ||
    mutacionEliminar.isPending;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.contenido}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={consultaNotificaciones.isRefetching}
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
            <Text style={styles.heroEtiqueta}>Avisos ciudadanos</Text>
            <Text style={styles.heroTitulo}>Notificaciones</Text>
            <Text style={styles.heroDescripcion}>
              Revisa cambios de estado, comentarios y actualizaciones importantes de tus reportes.
            </Text>
          </View>
        </View>

        <View style={styles.resumen}>
          <View style={styles.resumenIcono}>
            <Ionicons name="notifications-outline" size={24} color={colores.primario} />
          </View>

          <View style={styles.resumenTexto}>
            <Text style={styles.resumenTitulo}>{unreadCount}</Text>
            <Text style={styles.resumenDescripcion}>
              {unreadCount === 1 ? 'notificación no leída' : 'notificaciones no leídas'}
            </Text>
          </View>

          <Boton
            variante="secundario"
            cargando={mutacionMarcarTodas.isPending}
            deshabilitado={unreadCount === 0 || estaActualizando}
            onPress={marcarTodas}
          >
            Leer todas
          </Boton>
        </View>

        {mensajeError ? (
          <MensajeEstado variante="error" titulo="No se pudieron cargar tus notificaciones">
            {mensajeError}
          </MensajeEstado>
        ) : null}

        {mutacionMarcarLeida.error ? (
          <MensajeEstado variante="error" titulo="No se pudo actualizar">
            {obtenerMensajeError(mutacionMarcarLeida.error)}
          </MensajeEstado>
        ) : null}

        {mutacionMarcarTodas.error ? (
          <MensajeEstado variante="error" titulo="No se pudieron marcar todas">
            {obtenerMensajeError(mutacionMarcarTodas.error)}
          </MensajeEstado>
        ) : null}

        {mutacionEliminar.error ? (
          <MensajeEstado variante="error" titulo="No se pudo eliminar">
            {obtenerMensajeError(mutacionEliminar.error)}
          </MensajeEstado>
        ) : null}

        {consultaNotificaciones.isLoading ? (
          <View style={styles.estadoCarga}>
            <ActivityIndicator color={colores.primario} size="large" />
            <Text style={styles.estadoCargaTexto}>Cargando notificaciones...</Text>
          </View>
        ) : null}

        {!consultaNotificaciones.isLoading && !mensajeError && notificaciones.length === 0 ? (
          <View style={styles.estadoVacio}>
            <View style={styles.estadoVacioIcono}>
              <Ionicons name="notifications-off-outline" size={42} color={colores.primario} />
            </View>

            <Text style={styles.estadoVacioTitulo}>No tienes notificaciones</Text>
            <Text style={styles.estadoVacioTexto}>
              Cuando haya cambios importantes en tus reportes, aparecerán en esta pantalla.
            </Text>

            <Boton onPress={() => router.push('/mis-reportes')}>
              Ver mis reportes
            </Boton>
          </View>
        ) : null}

        {!consultaNotificaciones.isLoading && notificaciones.length > 0 ? (
          <View style={styles.listaNotificaciones}>
            {notificaciones.map((notificacion) => (
              <TarjetaNotificacion
                key={notificacion.id}
                notificacion={notificacion}
                marcando={
                  mutacionMarcarLeida.isPending &&
                  mutacionMarcarLeida.variables === notificacion.id
                }
                eliminando={
                  mutacionEliminar.isPending &&
                  mutacionEliminar.variables === notificacion.id
                }
                onMarcarLeida={marcarLeida}
                onEliminar={eliminarNotificacion}
              />
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
  listaNotificaciones: {
    gap: espaciado.md
  },
  tarjetaNotificacion: {
    backgroundColor: colores.tarjeta,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colores.borde,
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOpacity: 0.04,
    shadowRadius: 14,
    shadowOffset: {
      width: 0,
      height: 7
    },
    elevation: 2
  },
  tarjetaNotificacionNoLeida: {
    borderColor: '#93C5FD'
  },
  notificacionContenido: {
    padding: espaciado.lg,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: espaciado.md
  },
  notificacionPresionada: {
    opacity: 0.82
  },
  notificacionIcono: {
    width: 48,
    height: 48,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center'
  },
  notificacionTexto: {
    flex: 1,
    gap: 6
  },
  notificacionTituloFila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaciado.sm,
    flexWrap: 'wrap'
  },
  notificacionTipo: {
    color: colores.texto,
    fontSize: 16,
    fontWeight: '900'
  },
  indicadorNoLeida: {
    borderRadius: 999,
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 8,
    paddingVertical: 3
  },
  indicadorNoLeidaTexto: {
    color: colores.primario,
    fontSize: 11,
    fontWeight: '900'
  },
  notificacionMensaje: {
    color: colores.textoSuave,
    fontSize: 15,
    lineHeight: 22
  },
  notificacionReporte: {
    color: colores.texto,
    fontSize: 13,
    fontWeight: '800'
  },
  notificacionFecha: {
    color: colores.textoSuave,
    fontSize: 12,
    fontWeight: '700'
  },
  notificacionAcciones: {
    borderTopWidth: 1,
    borderTopColor: colores.borde,
    padding: espaciado.md,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: espaciado.sm,
    flexWrap: 'wrap'
  }
});