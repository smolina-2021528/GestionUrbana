import { zodResolver } from '@hookform/resolvers/zod';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { z } from 'zod';

import { Boton } from '../src/shared/components/Boton';
import { CampoTexto } from '../src/shared/components/CampoTexto';
import { MensajeEstado } from '../src/shared/components/MensajeEstado';
import { Pantalla } from '../src/shared/components/Pantalla';
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
  descripcion: string;
}> = [
  {
    valor: 'INFRAESTRUCTURA',
    etiqueta: 'Infraestructura',
    descripcion: 'Calles, banquetas, alumbrado, drenajes o daños urbanos.'
  },
  {
    valor: 'LIMPIEZA',
    etiqueta: 'Limpieza',
    descripcion: 'Basura, contaminación, desechos o espacios sucios.'
  },
  {
    valor: 'SEGURIDAD',
    etiqueta: 'Seguridad',
    descripcion: 'Riesgos, zonas peligrosas o situaciones que requieren atención.'
  }
];

const esquemaReporte = z.object({
  title: z.string().trim().min(5, 'El título debe tener al menos 5 caracteres.'),
  description: z.string().trim().min(10, 'La descripción debe tener al menos 10 caracteres.'),
  category: z.enum(['INFRAESTRUCTURA', 'SEGURIDAD', 'LIMPIEZA']),
  address: z.string().trim().optional()
});

type ValoresReporte = z.infer<typeof esquemaReporte>;

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

export default function CrearReporteScreen() {
  const [imagen, setImagen] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [coordenadas, setCoordenadas] = useState<CoordenadasReporte | null>(null);
  const [obteniendoUbicacion, setObteniendoUbicacion] = useState(false);
  const [mensajeError, setMensajeError] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
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

  const seleccionarImagenGaleria = async () => {
    setMensajeError(null);
    setMensajeExito(null);

    const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permiso.granted) {
      setMensajeError('Debes permitir acceso a tus fotos para seleccionar una imagen.');
      return;
    }

    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
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
      mediaTypes: ['images'],
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
    <Pantalla>
      <View style={styles.encabezado}>
        <Text style={styles.titulo}>Crear reporte</Text>
        <Text style={styles.descripcion}>
          Adjunta una fotografía, describe el problema y registra la ubicación para que pueda ser
          atendido.
        </Text>
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

      <View style={styles.seccion}>
        <Text style={styles.seccionTitulo}>1. Evidencia</Text>

        {imagen ? (
          <Image source={{ uri: imagen.uri }} style={styles.imagenPreview} />
        ) : (
          <View style={styles.imagenVacia}>
            <Text style={styles.imagenVaciaTitulo}>Sin fotografía</Text>
            <Text style={styles.imagenVaciaTexto}>
              Toma una foto o selecciona una imagen de tu galería.
            </Text>
          </View>
        )}

        <View style={styles.filaBotones}>
          <View style={styles.botonFlexible}>
            <Boton variante="secundario" onPress={tomarFoto}>
              Tomar foto
            </Boton>
          </View>

          <View style={styles.botonFlexible}>
            <Boton variante="secundario" onPress={seleccionarImagenGaleria}>
              Galería
            </Boton>
          </View>
        </View>
      </View>

      <View style={styles.seccion}>
        <Text style={styles.seccionTitulo}>2. Datos del reporte</Text>

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
              placeholder="Describe el problema con palabras sencillas."
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

              {categorias.map((categoria) => {
                const seleccionada = value === categoria.valor;

                return (
                  <Pressable
                    key={categoria.valor}
                    accessibilityRole="button"
                    onPress={() => onChange(categoria.valor)}
                    style={[
                      styles.categoria,
                      seleccionada ? styles.categoriaSeleccionada : null
                    ]}
                  >
                    <Text
                      style={[
                        styles.categoriaTitulo,
                        seleccionada ? styles.categoriaTituloSeleccionada : null
                      ]}
                    >
                      {categoria.etiqueta}
                    </Text>
                    <Text
                      style={[
                        styles.categoriaDescripcion,
                        seleccionada ? styles.categoriaDescripcionSeleccionada : null
                      ]}
                    >
                      {categoria.descripcion}
                    </Text>
                  </Pressable>
                );
              })}

              {errors.category?.message ? (
                <Text style={styles.errorCampo}>{errors.category.message}</Text>
              ) : null}
            </View>
          )}
        />
      </View>

      <View style={styles.seccion}>
        <Text style={styles.seccionTitulo}>3. Ubicación</Text>

        <Controller
          control={control}
          name="address"
          render={({ field: { value, onChange, onBlur } }) => (
            <CampoTexto
              etiqueta="Dirección o referencia"
              placeholder="Ej. Cerca del parque central"
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              error={errors.address?.message}
            />
          )}
        />

        <Boton
          variante="secundario"
          cargando={obteniendoUbicacion}
          onPress={obtenerUbicacionActual}
        >
          Usar ubicación GPS
        </Boton>

        {coordenadas ? (
          <View style={styles.coordenadas}>
            <Text style={styles.coordenadasTitulo}>Ubicación registrada</Text>
            <Text style={styles.coordenadasTexto}>
              Latitud: {formatearCoordenada(coordenadas.latitude)}
            </Text>
            <Text style={styles.coordenadasTexto}>
              Longitud: {formatearCoordenada(coordenadas.longitude)}
            </Text>
          </View>
        ) : (
          <MensajeEstado variante="info" titulo="Ubicación opcional">
            Puedes usar GPS o escribir una dirección manual. Lo ideal es enviar ambas referencias.
          </MensajeEstado>
        )}
      </View>

      <View style={styles.accionesFinales}>
        <Boton cargando={isSubmitting} onPress={handleSubmit(enviarReporte)}>
          Enviar reporte
        </Boton>

        <Boton variante="fantasma" deshabilitado={isSubmitting} onPress={() => router.back()}>
          Cancelar
        </Boton>
      </View>
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  encabezado: {
    gap: espaciado.sm,
    marginTop: espaciado.xl
  },
  titulo: {
    color: colores.texto,
    fontSize: 30,
    fontWeight: '900'
  },
  descripcion: {
    color: colores.textoSuave,
    fontSize: 16,
    lineHeight: 23
  },
  seccion: {
    backgroundColor: colores.tarjeta,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colores.borde,
    padding: espaciado.lg,
    gap: espaciado.lg
  },
  seccionTitulo: {
    color: colores.texto,
    fontSize: 18,
    fontWeight: '900'
  },
  imagenPreview: {
    width: '100%',
    height: 220,
    borderRadius: 16,
    backgroundColor: '#E2E8F0'
  },
  imagenVacia: {
    minHeight: 180,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colores.borde,
    alignItems: 'center',
    justifyContent: 'center',
    padding: espaciado.lg,
    gap: espaciado.sm
  },
  imagenVaciaTitulo: {
    color: colores.texto,
    fontSize: 17,
    fontWeight: '900'
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
  botonFlexible: {
    flex: 1
  },
  textArea: {
    minHeight: 120,
    paddingTop: espaciado.md
  },
  categorias: {
    gap: espaciado.sm
  },
  etiquetaCampo: {
    color: colores.texto,
    fontSize: 14,
    fontWeight: '700'
  },
  categoria: {
    borderWidth: 1,
    borderColor: colores.borde,
    backgroundColor: colores.tarjeta,
    borderRadius: 16,
    padding: espaciado.lg,
    gap: espaciado.xs
  },
  categoriaSeleccionada: {
    borderColor: colores.primario,
    backgroundColor: '#DBEAFE'
  },
  categoriaTitulo: {
    color: colores.texto,
    fontSize: 16,
    fontWeight: '900'
  },
  categoriaTituloSeleccionada: {
    color: colores.primarioOscuro
  },
  categoriaDescripcion: {
    color: colores.textoSuave,
    lineHeight: 20
  },
  categoriaDescripcionSeleccionada: {
    color: colores.primarioOscuro
  },
  errorCampo: {
    color: colores.error,
    fontSize: 13
  },
  coordenadas: {
    backgroundColor: '#ECFDF5',
    borderRadius: 16,
    padding: espaciado.lg,
    gap: espaciado.xs
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
  accionesFinales: {
    gap: espaciado.md,
    marginBottom: espaciado.xl
  }
});