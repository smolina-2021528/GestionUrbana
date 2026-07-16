import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  Image,
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

import { Boton } from '../src/shared/components/Boton';
import { CampoTexto } from '../src/shared/components/CampoTexto';
import { MensajeEstado } from '../src/shared/components/MensajeEstado';
import type { ErrorApi } from '../src/shared/services/manejadorErroresApi';
import { reportesService } from '../src/modules/reports/services/reportes.service';
import type {
  CategoriaReporte,
  CoordenadasReporte
} from '../src/modules/reports/types/reportes.types';
import { colores } from '../src/theme/colores';
import { espaciado } from '../src/theme/espaciado';

const categorias: Array<{
  valor: CategoriaReporte;
  etiqueta: string;
  icono: keyof typeof Ionicons.glyphMap;
}> = [
  {
    valor: 'INFRAESTRUCTURA',
    etiqueta: 'Infraestructura',
    icono: 'construct-outline'
  },
  {
    valor: 'LIMPIEZA',
    etiqueta: 'Limpieza',
    icono: 'trash-outline'
  },
  {
    valor: 'SEGURIDAD',
    etiqueta: 'Seguridad',
    icono: 'shield-checkmark-outline'
  }
];

const esquemaReporte = z.object({
  title: z.string().trim().min(5, 'El título debe tener al menos 5 caracteres.'),
  description: z.string().trim().min(10, 'La descripción debe tener al menos 10 caracteres.'),
  category: z.enum(['INFRAESTRUCTURA', 'SEGURIDAD', 'LIMPIEZA']),
  address: z.string().trim().optional()
});

type ValoresReporte = z.infer<typeof esquemaReporte>;

type EstadoPaso = {
  titulo: string;
  completado: boolean;
  icono: keyof typeof Ionicons.glyphMap;
};

function obtenerMensajeError(error: unknown) {
  const errorApi = error as Partial<ErrorApi>;

  return (
    errorApi.mensaje ??
    'No fue posible crear el reporte. Revisa la información e intenta nuevamente.'
  );
}

function formatearCoordenada(valor: number) {
  return new Intl.NumberFormat('es-GT', {
    maximumFractionDigits: 6
  }).format(valor);
}

function obtenerTextoCategoria(categoria: CategoriaReporte) {
  if (categoria === 'INFRAESTRUCTURA') {
    return 'Calles, alumbrado, drenajes o daños urbanos.';
  }

  if (categoria === 'LIMPIEZA') {
    return 'Basura, contaminación, desechos o espacios sucios.';
  }

  return 'Riesgos o situaciones que requieren atención.';
}

export default function CrearReporteScreen() {
  const [imagen, setImagen] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [coordenadas, setCoordenadas] = useState<CoordenadasReporte | null>(null);
  const [obteniendoUbicacion, setObteniendoUbicacion] = useState(false);
  const [mensajeError, setMensajeError] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<ValoresReporte>({
    resolver: zodResolver(esquemaReporte),
    defaultValues: {
      title: '',
      description: '',
      category: 'INFRAESTRUCTURA',
      address: ''
    }
  });

  const tituloActual = watch('title');
  const descripcionActual = watch('description');
  const categoriaActual = watch('category');
  const direccionActual = watch('address');

  const pasos = useMemo<EstadoPaso[]>(
    () => [
      {
        titulo: 'Foto',
        completado: Boolean(imagen),
        icono: 'camera-outline'
      },
      {
        titulo: 'Datos',
        completado:
          tituloActual.trim().length >= 5 && descripcionActual.trim().length >= 10,
        icono: 'document-text-outline'
      },
      {
        titulo: 'Ubicación',
        completado: Boolean(coordenadas || direccionActual?.trim()),
        icono: 'location-outline'
      }
    ],
    [coordenadas, descripcionActual, direccionActual, imagen, tituloActual]
  );

  const seleccionarImagenGaleria = async () => {
    setMensajeError(null);
    setMensajeExito(null);

    const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permiso.granted) {
      setMensajeError('Debes permitir acceso a tus fotos para seleccionar una imagen.');
      return;
    }

    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.7
    });

    if (!resultado.canceled && resultado.assets.length > 0) {
      setImagen(resultado.assets[0]);
    }
  };

  const tomarFoto = async () => {
    setMensajeError(null);
    setMensajeExito(null);

    const permiso = await ImagePicker.requestCameraPermissionsAsync();

    if (!permiso.granted) {
      setMensajeError('Debes permitir acceso a la cámara para tomar una foto.');
      return;
    }

    const resultado = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.7
    });

    if (!resultado.canceled && resultado.assets.length > 0) {
      setImagen(resultado.assets[0]);
    }
  };

  const obtenerUbicacionActual = async () => {
    setMensajeError(null);
    setMensajeExito(null);
    setObteniendoUbicacion(true);

    try {
      const permiso = await Location.requestForegroundPermissionsAsync();

      if (!permiso.granted) {
        setMensajeError('Debes permitir acceso a tu ubicación para usar GPS.');
        return;
      }

      const ubicacion = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced
      });

      setCoordenadas({
        latitude: ubicacion.coords.latitude,
        longitude: ubicacion.coords.longitude
      });

      setMensajeExito('Ubicación GPS registrada correctamente.');
    } catch {
      setMensajeError(
        'No fue posible obtener tu ubicación. Puedes escribir una dirección manualmente.'
      );
    } finally {
      setObteniendoUbicacion(false);
    }
  };

  const enviarReporte = async (valores: ValoresReporte) => {
    setMensajeError(null);
    setMensajeExito(null);

    if (!imagen) {
      setMensajeError('Agrega una foto como evidencia antes de enviar el reporte.');
      return;
    }

    try {
      const respuesta = await reportesService.crearReporte({
        title: valores.title,
        description: valores.description,
        category: valores.category,
        address: valores.address,
        coordinates: coordenadas,
        image: imagen
      });

      if (respuesta.success === false) {
        setMensajeError(respuesta.message ?? 'No fue posible crear el reporte.');
        return;
      }

      setMensajeExito(respuesta.message ?? 'Reporte creado correctamente.');

      setTimeout(() => {
        router.replace('/mis-reportes');
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
          contentContainerStyle={styles.scrollContenido}
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
              <Text style={styles.heroEtiqueta}>Nuevo reporte ciudadano</Text>
              <Text style={styles.heroTitulo}>Cuéntanos qué sucede</Text>
              <Text style={styles.heroDescripcion}>
                Agrega una foto, describe el problema y confirma la ubicación.
              </Text>
            </View>
          </View>

          <View style={styles.progreso}>
            {pasos.map((paso) => (
              <View
                key={paso.titulo}
                style={[
                  styles.paso,
                  paso.completado ? styles.pasoCompletado : null
                ]}
              >
                <View
                  style={[
                    styles.pasoIcono,
                    paso.completado ? styles.pasoIconoCompletado : null
                  ]}
                >
                  <Ionicons
                    name={paso.completado ? 'checkmark' : paso.icono}
                    size={16}
                    color={paso.completado ? colores.textoInvertido : colores.primario}
                  />
                </View>
                <Text
                  style={[
                    styles.pasoTexto,
                    paso.completado ? styles.pasoTextoCompletado : null
                  ]}
                >
                  {paso.titulo}
                </Text>
              </View>
            ))}
          </View>

          {mensajeError ? (
            <MensajeEstado variante="error" titulo="No se pudo continuar">
              {mensajeError}
            </MensajeEstado>
          ) : null}

          {mensajeExito ? (
            <MensajeEstado variante="exito" titulo="Proceso completado">
              {mensajeExito}
            </MensajeEstado>
          ) : null}

          <View style={styles.tarjetaPrincipal}>
            <View style={styles.tarjetaEncabezado}>
              <View style={styles.tarjetaIcono}>
                <Ionicons name="camera-outline" size={22} color={colores.primario} />
              </View>

              <View style={styles.tarjetaTexto}>
                <Text style={styles.tarjetaTitulo}>Evidencia</Text>
                <Text style={styles.tarjetaDescripcion}>
                  Una foto ayuda a entender mejor el problema.
                </Text>
              </View>
            </View>

            {imagen ? (
              <View style={styles.previewContenedor}>
                <Image source={{ uri: imagen.uri }} style={styles.imagenPreview} />
                <View style={styles.previewOverlay}>
                  <Ionicons name="checkmark-circle" size={22} color="#FFFFFF" />
                  <Text style={styles.previewTexto}>Foto agregada</Text>
                </View>
              </View>
            ) : (
              <View style={styles.imagenVacia}>
                <View style={styles.imagenVaciaIcono}>
                  <Ionicons name="image-outline" size={34} color={colores.primario} />
                </View>

                <Text style={styles.imagenVaciaTitulo}>Agrega una fotografía</Text>
                <Text style={styles.imagenVaciaTexto}>
                  Puedes tomar una foto ahora o elegir una desde tu galería.
                </Text>
              </View>
            )}

            <View style={styles.filaBotones}>
              <Pressable style={styles.accionImagen} onPress={tomarFoto}>
                <Ionicons name="camera-outline" size={20} color={colores.primario} />
                <Text style={styles.accionImagenTexto}>Cámara</Text>
              </Pressable>

              <Pressable style={styles.accionImagen} onPress={seleccionarImagenGaleria}>
                <Ionicons name="images-outline" size={20} color={colores.primario} />
                <Text style={styles.accionImagenTexto}>Galería</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.tarjetaPrincipal}>
            <View style={styles.tarjetaEncabezado}>
              <View style={styles.tarjetaIcono}>
                <Ionicons name="document-text-outline" size={22} color={colores.primario} />
              </View>

              <View style={styles.tarjetaTexto}>
                <Text style={styles.tarjetaTitulo}>Datos del problema</Text>
                <Text style={styles.tarjetaDescripcion}>
                  Usa palabras sencillas y claras.
                </Text>
              </View>
            </View>

            <Controller
              control={control}
              name="title"
              render={({ field: { value, onChange, onBlur } }) => (
                <CampoTexto
                  etiqueta="Título"
                  placeholder="Ej. Bache grande en la calle"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  error={errors.title?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="description"
              render={({ field: { value, onChange, onBlur } }) => (
                <CampoTexto
                  etiqueta="Descripción"
                  placeholder="Describe qué ocurre, desde cuándo y por qué necesita atención."
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  multiline
                  numberOfLines={5}
                  textAlignVertical="top"
                  style={styles.textArea}
                  error={errors.description?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="category"
              render={({ field: { value, onChange } }) => (
                <View style={styles.categorias}>
                  <Text style={styles.etiquetaCampo}>Categoría</Text>

                  <View style={styles.categoriasFila}>
                    {categorias.map((categoria) => {
                      const seleccionada = value === categoria.valor;

                      return (
                        <Pressable
                          key={categoria.valor}
                          accessibilityRole="button"
                          onPress={() => onChange(categoria.valor)}
                          style={[
                            styles.categoriaChip,
                            seleccionada ? styles.categoriaChipSeleccionada : null
                          ]}
                        >
                          <Ionicons
                            name={categoria.icono}
                            size={18}
                            color={seleccionada ? colores.textoInvertido : colores.primario}
                          />
                          <Text
                            style={[
                              styles.categoriaChipTexto,
                              seleccionada ? styles.categoriaChipTextoSeleccionada : null
                            ]}
                          >
                            {categoria.etiqueta}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>

                  <View style={styles.categoriaAyuda}>
                    <Text style={styles.categoriaAyudaTexto}>
                      {obtenerTextoCategoria(categoriaActual)}
                    </Text>
                  </View>

                  {errors.category?.message ? (
                    <Text style={styles.errorCampo}>{errors.category.message}</Text>
                  ) : null}
                </View>
              )}
            />
          </View>

          <View style={styles.tarjetaPrincipal}>
            <View style={styles.tarjetaEncabezado}>
              <View style={styles.tarjetaIcono}>
                <Ionicons name="location-outline" size={22} color={colores.primario} />
              </View>

              <View style={styles.tarjetaTexto}>
                <Text style={styles.tarjetaTitulo}>Ubicación</Text>
                <Text style={styles.tarjetaDescripcion}>
                  Puedes usar GPS, escribir una referencia o ambas.
                </Text>
              </View>
            </View>

            <Controller
              control={control}
              name="address"
              render={({ field: { value, onChange, onBlur } }) => (
                <CampoTexto
                  etiqueta="Dirección o referencia"
                  placeholder="Ej. Frente al parque central"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  error={errors.address?.message}
                />
              )}
            />

            <Pressable
              accessibilityRole="button"
              disabled={obteniendoUbicacion}
              style={[
                styles.botonGps,
                obteniendoUbicacion ? styles.botonGpsDeshabilitado : null
              ]}
              onPress={obtenerUbicacionActual}
            >
              <Ionicons name="navigate-outline" size={20} color={colores.primario} />
              <Text style={styles.botonGpsTexto}>
                {obteniendoUbicacion ? 'Obteniendo ubicación...' : 'Usar ubicación GPS'}
              </Text>
            </Pressable>

            {coordenadas ? (
              <View style={styles.coordenadas}>
                <View style={styles.coordenadasIcono}>
                  <Ionicons name="checkmark-circle" size={22} color={colores.exito} />
                </View>

                <View style={styles.coordenadasTextoContenedor}>
                  <Text style={styles.coordenadasTitulo}>Ubicación registrada</Text>
                  <Text style={styles.coordenadasTexto}>
                    {formatearCoordenada(coordenadas.latitude)}, {formatearCoordenada(coordenadas.longitude)}
                  </Text>
                </View>
              </View>
            ) : (
              <View style={styles.ubicacionAyuda}>
                <Ionicons name="information-circle-outline" size={20} color={colores.primario} />
                <Text style={styles.ubicacionAyudaTexto}>
                  La ubicación ayuda a que el reporte sea atendido con mayor precisión.
                </Text>
              </View>
            )}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <View style={styles.footerResumen}>
            <Text style={styles.footerTitulo}>Reporte ciudadano</Text>
            <Text style={styles.footerTexto}>
              {imagen ? 'Con evidencia' : 'Falta foto'} ·{' '}
              {coordenadas || direccionActual?.trim() ? 'Con ubicación' : 'Falta ubicación'}
            </Text>
          </View>

          <Boton cargando={isSubmitting} onPress={handleSubmit(enviarReporte)}>
            Enviar
          </Boton>
        </View>
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
  scrollContenido: {
    paddingHorizontal: espaciado.xl,
    paddingTop: espaciado.lg,
    paddingBottom: 150,
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
  progreso: {
    flexDirection: 'row',
    gap: espaciado.sm
  },
  paso: {
    flex: 1,
    backgroundColor: colores.tarjeta,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colores.borde,
    padding: espaciado.sm,
    alignItems: 'center',
    gap: espaciado.xs
  },
  pasoCompletado: {
    borderColor: '#BFDBFE',
    backgroundColor: '#EFF6FF'
  },
  pasoIcono: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DBEAFE'
  },
  pasoIconoCompletado: {
    backgroundColor: colores.exito
  },
  pasoTexto: {
    color: colores.textoSuave,
    fontSize: 12,
    fontWeight: '800'
  },
  pasoTextoCompletado: {
    color: colores.texto
  },
  tarjetaPrincipal: {
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
  tarjetaEncabezado: {
    flexDirection: 'row',
    gap: espaciado.md,
    alignItems: 'center'
  },
  tarjetaIcono: {
    width: 46,
    height: 46,
    borderRadius: 18,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center'
  },
  tarjetaTexto: {
    flex: 1,
    gap: 2
  },
  tarjetaTitulo: {
    color: colores.texto,
    fontSize: 19,
    fontWeight: '900'
  },
  tarjetaDescripcion: {
    color: colores.textoSuave,
    fontSize: 14,
    lineHeight: 20
  },
  previewContenedor: {
    overflow: 'hidden',
    borderRadius: 20,
    backgroundColor: '#E2E8F0'
  },
  imagenPreview: {
    width: '100%',
    height: 230
  },
  previewOverlay: {
    position: 'absolute',
    left: espaciado.md,
    bottom: espaciado.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaciado.xs,
    backgroundColor: 'rgba(15, 23, 42, 0.72)',
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: espaciado.md
  },
  previewTexto: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900'
  },
  imagenVacia: {
    minHeight: 190,
    borderRadius: 20,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#CBD5E1',
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    padding: espaciado.xl,
    gap: espaciado.sm
  },
  imagenVaciaIcono: {
    width: 64,
    height: 64,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DBEAFE'
  },
  imagenVaciaTitulo: {
    color: colores.texto,
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center'
  },
  imagenVaciaTexto: {
    color: colores.textoSuave,
    textAlign: 'center',
    lineHeight: 20
  },
  filaBotones: {
    flexDirection: 'row',
    gap: espaciado.md
  },
  accionImagen: {
    flex: 1,
    minHeight: 52,
    borderRadius: 16,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: espaciado.sm
  },
  accionImagenTexto: {
    color: colores.primarioOscuro,
    fontSize: 15,
    fontWeight: '900'
  },
  textArea: {
    minHeight: 125,
    paddingTop: espaciado.md
  },
  categorias: {
    gap: espaciado.sm
  },
  etiquetaCampo: {
    color: colores.texto,
    fontSize: 14,
    fontWeight: '800'
  },
  categoriasFila: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: espaciado.sm
  },
  categoriaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaciado.xs,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    backgroundColor: '#EFF6FF',
    paddingVertical: 10,
    paddingHorizontal: espaciado.md
  },
  categoriaChipSeleccionada: {
    backgroundColor: colores.primario,
    borderColor: colores.primario
  },
  categoriaChipTexto: {
    color: colores.primarioOscuro,
    fontSize: 14,
    fontWeight: '900'
  },
  categoriaChipTextoSeleccionada: {
    color: colores.textoInvertido
  },
  categoriaAyuda: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: espaciado.md
  },
  categoriaAyudaTexto: {
    color: colores.textoSuave,
    lineHeight: 20
  },
  errorCampo: {
    color: colores.error,
    fontSize: 13
  },
  botonGps: {
    minHeight: 54,
    borderRadius: 18,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: espaciado.sm
  },
  botonGpsDeshabilitado: {
    opacity: 0.65
  },
  botonGpsTexto: {
    color: colores.primarioOscuro,
    fontSize: 16,
    fontWeight: '900'
  },
  coordenadas: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaciado.md,
    backgroundColor: '#ECFDF5',
    borderRadius: 18,
    padding: espaciado.lg
  },
  coordenadasIcono: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center'
  },
  coordenadasTextoContenedor: {
    flex: 1,
    gap: 2
  },
  coordenadasTitulo: {
    color: colores.exito,
    fontSize: 15,
    fontWeight: '900'
  },
  coordenadasTexto: {
    color: colores.texto,
    fontSize: 14
  },
  ubicacionAyuda: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: espaciado.sm,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: espaciado.md
  },
  ubicacionAyudaTexto: {
    flex: 1,
    color: colores.textoSuave,
    lineHeight: 20
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: espaciado.xl,
    paddingTop: espaciado.md,
    paddingBottom: Platform.OS === 'ios' ? espaciado.xl : espaciado.lg,
    backgroundColor: 'rgba(248, 250, 252, 0.97)',
    borderTopWidth: 1,
    borderTopColor: colores.borde,
    gap: espaciado.md
  },
  footerResumen: {
    gap: 2
  },
  footerTitulo: {
    color: colores.texto,
    fontSize: 14,
    fontWeight: '900'
  },
  footerTexto: {
    color: colores.textoSuave,
    fontSize: 13
  }
});