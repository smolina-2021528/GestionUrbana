import type { ChangeEvent, FormEvent } from 'react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ImagePlus } from 'lucide-react';

import { rutasAplicacion } from '../../../config/constantesSistema';
import { textosSistema } from '../../../design/identity/textosSistema';
import { Alerta } from '../../../shared/components/feedback/Alerta';
import { Boton } from '../../../shared/components/ui/Boton';
import { Tarjeta } from '../../../shared/components/ui/Tarjeta';
import { esErrorApi } from '../../../shared/types/errorApi';
import {
  AnalisisReportePanel,
  type AnalisisReporteAplicado
} from '../components/AnalisisReportePanel';
import {
  DuplicadosReportePanel,
  type ResultadoRevisionDuplicados
} from '../components/DuplicadosReportePanel';
import { SelectorUbicacionMapa } from '../components/SelectorUbicacionMapa';
import { usarCrearReporte } from '../hooks/usarCrearReporte';
import {
  categoriasReporte,
  type CategoriaReporte,
  type CoordenadasGeograficas,
  type CrearReportePayload
} from '../types/reportesTipos';
import {
  esLatitudReporteValida,
  esLongitudReporteValida
} from '../utils/validacionesGeograficas';
import './crearReportePagina.css';

type FormularioCrearReporte = {
  title: string;
  description: string;
  category: CategoriaReporte | '';
  address: string;
  latitude: string;
  longitude: string;
  images: File[];
};

type CampoTextoCrearReporte = Exclude<keyof FormularioCrearReporte, 'images'>;

type ErroresFormularioCrearReporte = Partial<Record<keyof FormularioCrearReporte, string>>;

type RevisionDuplicadosFormulario = {
  revisado: boolean;
  hayDuplicados: boolean;
  totalCandidatos: number;
};

const formularioInicial: FormularioCrearReporte = {
  title: '',
  description: '',
  category: '',
  address: '',
  latitude: '',
  longitude: '',
  images: []
};

const revisionDuplicadosInicial: RevisionDuplicadosFormulario = {
  revisado: false,
  hayDuplicados: false,
  totalCandidatos: 0
};

const etiquetasCategoria: Record<CategoriaReporte, string> = {
  INFRAESTRUCTURA: 'Infraestructura',
  SEGURIDAD: 'Seguridad',
  LIMPIEZA: 'Limpieza'
};

const tiposImagenPermitidos = ['image/jpeg', 'image/png', 'image/webp'];
const maximoImagenes = 3;
const maximoTamanoImagenMb = 5;
const maximoTamanoImagenBytes = maximoTamanoImagenMb * 1024 * 1024;

const camposQueInvalidanRevisionDuplicados: CampoTextoCrearReporte[] = [
  'title',
  'description',
  'category',
  'latitude',
  'longitude'
];

function obtenerMensajeError(error: unknown) {
  if (esErrorApi(error)) {
    return error.mensaje;
  }

  return 'No fue posible crear el reporte. Revisa la información e intenta nuevamente.';
}

function limpiarTexto(valor: string) {
  return valor.trim();
}

function convertirNumero(valor: string) {
  const textoLimpio = limpiarTexto(valor);

  if (!textoLimpio) {
    return undefined;
  }

  const numero = Number(textoLimpio);

  return Number.isFinite(numero) ? numero : undefined;
}

function esCategoriaReporte(valor: string): valor is CategoriaReporte {
  return categoriasReporte.includes(valor as CategoriaReporte);
}

function obtenerCoordenadasValidas(formulario: FormularioCrearReporte) {
  const latitud = convertirNumero(formulario.latitude);
  const longitud = convertirNumero(formulario.longitude);

  if (
    latitud === undefined ||
    longitud === undefined ||
    !esLatitudReporteValida(latitud) ||
    !esLongitudReporteValida(longitud)
  ) {
    return null;
  }

  return {
    latitude: latitud,
    longitude: longitud
  };
}

function validarFormularioCrearReporte(formulario: FormularioCrearReporte) {
  const errores: ErroresFormularioCrearReporte = {};

  const titulo = limpiarTexto(formulario.title);
  const descripcion = limpiarTexto(formulario.description);
  const direccion = limpiarTexto(formulario.address);
  const latitudTexto = limpiarTexto(formulario.latitude);
  const longitudTexto = limpiarTexto(formulario.longitude);

  if (titulo.length < 3) {
    errores.title = 'Ingresa un título de al menos 3 caracteres.';
  }

  if (titulo.length > 150) {
    errores.title = 'El título no puede superar 150 caracteres.';
  }

  if (descripcion.length < 10) {
    errores.description = 'Describe el problema con al menos 10 caracteres.';
  }

  if (descripcion.length > 2000) {
    errores.description = 'La descripción no puede superar 2000 caracteres.';
  }

  if (!formulario.category || !esCategoriaReporte(formulario.category)) {
    errores.category = 'Selecciona una categoría válida.';
  }

  if (direccion.length > 500) {
    errores.address = 'La dirección no puede superar 500 caracteres.';
  }

  if ((latitudTexto && !longitudTexto) || (!latitudTexto && longitudTexto)) {
    errores.latitude = 'Ingresa latitud y longitud juntas, o deja ambos campos vacíos.';
    errores.longitude = 'Ingresa latitud y longitud juntas, o deja ambos campos vacíos.';
  }

  if (latitudTexto) {
    const latitud = Number(latitudTexto);

    if (!Number.isFinite(latitud) || !esLatitudReporteValida(latitud)) {
      errores.latitude = 'La latitud debe ser un número entre -90 y 90.';
    }
  }

  if (longitudTexto) {
    const longitud = Number(longitudTexto);

    if (!Number.isFinite(longitud) || !esLongitudReporteValida(longitud)) {
      errores.longitude = 'La longitud debe ser un número entre -180 y 180.';
    }
  }

  if (formulario.images.length > maximoImagenes) {
    errores.images = `Puedes adjuntar máximo ${maximoImagenes} imágenes.`;
  }

  const imagenNoPermitida = formulario.images.find(
    (imagen) => !tiposImagenPermitidos.includes(imagen.type)
  );

  if (imagenNoPermitida) {
    errores.images = 'Solo se permiten imágenes JPEG, PNG o WebP.';
  }

  const imagenMuyGrande = formulario.images.find((imagen) => imagen.size > maximoTamanoImagenBytes);

  if (imagenMuyGrande) {
    errores.images = `Cada imagen debe pesar máximo ${maximoTamanoImagenMb} MB.`;
  }

  return errores;
}

function construirPayloadCrearReporte(formulario: FormularioCrearReporte): CrearReportePayload {
  return {
    title: limpiarTexto(formulario.title),
    description: limpiarTexto(formulario.description),
    category: formulario.category || undefined,
    address: limpiarTexto(formulario.address) || undefined,
    latitude: convertirNumero(formulario.latitude),
    longitude: convertirNumero(formulario.longitude),
    images: formulario.images.length > 0 ? formulario.images : undefined
  };
}

function formatearTamanoArchivo(bytes: number) {
  if (bytes < 1024 * 1024) {
    return `${new Intl.NumberFormat('es-GT', {
      maximumFractionDigits: 1
    }).format(bytes / 1024)} KB`;
  }

  return `${new Intl.NumberFormat('es-GT', {
    maximumFractionDigits: 1
  }).format(bytes / (1024 * 1024))} MB`;
}

function formatearCoordenada(valor: string) {
  const numero = convertirNumero(valor);

  if (numero === undefined) {
    return 'No registrada';
  }

  return new Intl.NumberFormat('es-GT', {
    maximumFractionDigits: 6
  }).format(numero);
}

function obtenerUrlMapa(formulario: FormularioCrearReporte) {
  const coordenadas = obtenerCoordenadasValidas(formulario);

  if (!coordenadas) {
    return null;
  }

  return `https://www.google.com/maps/search/?api=1&query=${coordenadas.latitude},${coordenadas.longitude}`;
}

export function CrearReportePagina() {
  const navigate = useNavigate();
  const crearReporte = usarCrearReporte();

  const [formulario, setFormulario] = useState<FormularioCrearReporte>(formularioInicial);
  const [errores, setErrores] = useState<ErroresFormularioCrearReporte>({});
  const [mensajeError, setMensajeError] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [mensajeUbicacion, setMensajeUbicacion] = useState<string | null>(null);
  const [solicitandoUbicacion, setSolicitandoUbicacion] = useState(false);
  const [llaveInputImagenes, setLlaveInputImagenes] = useState(0);
  const [revisionDuplicados, setRevisionDuplicados] =
    useState<RevisionDuplicadosFormulario>(revisionDuplicadosInicial);

  const totalImagenes = formulario.images.length;
  const urlMapa = obtenerUrlMapa(formulario);
  const coordenadasValidas = obtenerCoordenadasValidas(formulario);
  const tieneDireccion = limpiarTexto(formulario.address).length > 0;
  const tieneUbicacion = tieneDireccion || Boolean(coordenadasValidas);

  const resumenUbicacion = useMemo(() => {
    const direccion = limpiarTexto(formulario.address);
    const latitud = limpiarTexto(formulario.latitude);
    const longitud = limpiarTexto(formulario.longitude);

    if (direccion && latitud && longitud) {
      return `${direccion} · ${latitud}, ${longitud}`;
    }

    if (direccion) {
      return direccion;
    }

    if (latitud && longitud) {
      return `${latitud}, ${longitud}`;
    }

    return 'Sin ubicación registrada';
  }, [formulario.address, formulario.latitude, formulario.longitude]);

  const invalidarRevisionDuplicados = () => {
    setRevisionDuplicados(revisionDuplicadosInicial);
  };

  const actualizarCampo = <TCampo extends CampoTextoCrearReporte>(
    campo: TCampo,
    valor: FormularioCrearReporte[TCampo]
  ) => {
    setFormulario((formularioActual) => ({
      ...formularioActual,
      [campo]: valor
    }));

    if (camposQueInvalidanRevisionDuplicados.includes(campo)) {
      invalidarRevisionDuplicados();
    }

    setErrores((erroresActuales) => {
      const erroresActualizados = { ...erroresActuales };
      delete erroresActualizados[campo];
      return erroresActualizados;
    });

    setMensajeError(null);
    setMensajeExito(null);
    setMensajeUbicacion(null);
  };

  const cambiarCategoria = (evento: ChangeEvent<HTMLSelectElement>) => {
    const valor = evento.target.value;
    const categoria = valor && esCategoriaReporte(valor) ? valor : '';

    actualizarCampo('category', categoria);
  };

  const cambiarImagenes = (evento: ChangeEvent<HTMLInputElement>) => {
    const archivos = Array.from(evento.target.files ?? []);

    setFormulario((formularioActual) => ({
      ...formularioActual,
      images: archivos.slice(0, maximoImagenes)
    }));

    setErrores((erroresActuales) => {
      const erroresActualizados = { ...erroresActuales };
      delete erroresActualizados.images;
      return erroresActualizados;
    });

    setMensajeError(null);
    setMensajeExito(null);
  };

  const limpiarImagenes = () => {
    setFormulario((formularioActual) => ({
      ...formularioActual,
      images: []
    }));

    setLlaveInputImagenes((llaveActual) => llaveActual + 1);

    setErrores((erroresActuales) => {
      const erroresActualizados = { ...erroresActuales };
      delete erroresActualizados.images;
      return erroresActualizados;
    });
  };

  const seleccionarCoordenadasMapa = (coordenadas: CoordenadasGeograficas) => {
    setFormulario((formularioActual) => ({
      ...formularioActual,
      latitude: coordenadas.latitude.toFixed(6),
      longitude: coordenadas.longitude.toFixed(6)
    }));

    invalidarRevisionDuplicados();

    setErrores((erroresActuales) => {
      const erroresActualizados = { ...erroresActuales };
      delete erroresActualizados.latitude;
      delete erroresActualizados.longitude;
      return erroresActualizados;
    });

    setMensajeError(null);
    setMensajeExito(null);
    setMensajeUbicacion(
      'Punto seleccionado en el mapa. Puedes ajustar los campos manualmente si es necesario.'
    );
  };

  const limpiarUbicacion = () => {
    setFormulario((formularioActual) => ({
      ...formularioActual,
      address: '',
      latitude: '',
      longitude: ''
    }));

    invalidarRevisionDuplicados();

    setErrores((erroresActuales) => {
      const erroresActualizados = { ...erroresActuales };
      delete erroresActualizados.address;
      delete erroresActualizados.latitude;
      delete erroresActualizados.longitude;
      return erroresActualizados;
    });

    setMensajeUbicacion(null);
    setMensajeError(null);
    setMensajeExito(null);
  };

  const usarUbicacionActual = () => {
    if (!navigator.geolocation) {
      setMensajeUbicacion('Tu navegador no permite obtener tu ubicación actual.');
      return;
    }

    setSolicitandoUbicacion(true);
    setMensajeUbicacion(null);

    navigator.geolocation.getCurrentPosition(
      (posicion) => {
        setFormulario((formularioActual) => ({
          ...formularioActual,
          latitude: posicion.coords.latitude.toFixed(6),
          longitude: posicion.coords.longitude.toFixed(6)
        }));

        invalidarRevisionDuplicados();

        setErrores((erroresActuales) => {
          const erroresActualizados = { ...erroresActuales };
          delete erroresActualizados.latitude;
          delete erroresActualizados.longitude;
          return erroresActualizados;
        });

        setSolicitandoUbicacion(false);
        setMensajeUbicacion(
          'Ubicación detectada. Puedes agregar una dirección o referencia para completar el reporte.'
        );
      },
      () => {
        setSolicitandoUbicacion(false);
        setMensajeUbicacion(
          'No fue posible obtener tu ubicación. Puedes ingresar las coordenadas manualmente.'
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  const aplicarAnalisisReporte = ({ analysis, location }: AnalisisReporteAplicado) => {
    setFormulario((formularioActual) => ({
      ...formularioActual,
      title: analysis.title,
      description: analysis.description,
      category: analysis.category,
      address: location.address ?? formularioActual.address,
      latitude:
        location.latitude !== null ? location.latitude.toFixed(6) : formularioActual.latitude,
      longitude:
        location.longitude !== null ? location.longitude.toFixed(6) : formularioActual.longitude
    }));

    invalidarRevisionDuplicados();

    setErrores((erroresActuales) => {
      const erroresActualizados = { ...erroresActuales };
      delete erroresActualizados.title;
      delete erroresActualizados.description;
      delete erroresActualizados.category;
      delete erroresActualizados.address;
      delete erroresActualizados.latitude;
      delete erroresActualizados.longitude;
      return erroresActualizados;
    });

    setMensajeError(null);
    setMensajeExito(null);

    if (location.found) {
      setMensajeUbicacion(
        'Ubicación sugerida aplicada. Puedes ajustarla manualmente antes de enviar.'
      );
      return;
    }

    setMensajeUbicacion(
      'Sugerencias aplicadas. La ubicación puede completarse o ajustarse manualmente.'
    );
  };

  const completarRevisionDuplicados = (resultado: ResultadoRevisionDuplicados) => {
    setRevisionDuplicados({
      revisado: resultado.revisado,
      hayDuplicados: resultado.hayDuplicados,
      totalCandidatos: resultado.totalCandidatos
    });

    setMensajeError(null);
  };

  const limpiarFormulario = () => {
    setFormulario(formularioInicial);
    setErrores({});
    setMensajeError(null);
    setMensajeExito(null);
    setMensajeUbicacion(null);
    setSolicitandoUbicacion(false);
    setRevisionDuplicados(revisionDuplicadosInicial);
    setLlaveInputImagenes((llaveActual) => llaveActual + 1);
  };

  const volverAMisReportes = () => {
    navigate(rutasAplicacion.misReportes);
  };

  const manejarEnvio = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();

    const erroresFormulario = validarFormularioCrearReporte(formulario);
    setErrores(erroresFormulario);
    setMensajeError(null);
    setMensajeExito(null);

    if (Object.keys(erroresFormulario).length > 0) {
      setMensajeError('Revisa los campos marcados antes de enviar el reporte.');
      return;
    }

    if (!revisionDuplicados.revisado) {
      setMensajeError('Antes de enviar, realiza la revisión de posibles reportes duplicados.');
      return;
    }

    try {
      const respuesta = await crearReporte.mutateAsync(construirPayloadCrearReporte(formulario));

      if (respuesta.success === false) {
        setMensajeError(
          respuesta.message ?? respuesta.error ?? 'No fue posible crear el reporte urbano.'
        );
        return;
      }

      setMensajeExito(respuesta.message ?? 'Reporte creado exitosamente.');

      const reporteCreado = respuesta.data;

      if (reporteCreado?.id) {
        navigate(`${rutasAplicacion.reportes}/${encodeURIComponent(reporteCreado.id)}`);
        return;
      }

      navigate(rutasAplicacion.misReportes);
    } catch (error) {
      setMensajeError(obtenerMensajeError(error));
    }
  };

  return (
    <main className="paginaTemporal crearReportePagina">
      <section className="crearReportePagina__encabezado">
        <div>
          <span className="etiquetaInicial">Reporte ciudadano</span>
          <h1>{textosSistema.reportes.tituloCrear}</h1>
          <p>{textosSistema.reportes.descripcionCrear}</p>
        </div>

        <div className="crearReportePagina__accionesEncabezado">
          <Boton variante="secundario" onClick={volverAMisReportes}>
            Ver mis reportes
          </Boton>
        </div>
      </section>

      {mensajeError ? (
        <Alerta variante="error" titulo="No se pudo enviar el reporte">
          <p>{mensajeError}</p>
        </Alerta>
      ) : null}

      {mensajeExito ? (
        <Alerta variante="exito" titulo="Reporte creado">
          <p>{mensajeExito}</p>
        </Alerta>
      ) : null}

      <form className="crearReportePagina__formulario" onSubmit={manejarEnvio}>
        <section className="crearReportePagina__grid">
          <div className="crearReportePagina__columnaPrincipal">
            <Tarjeta
              titulo="1. Problema"
              descripcion="Describe con claridad la incidencia urbana que deseas reportar."
            >
              <div className="crearReportePagina__campos">
                <label className="crearReportePagina__campo">
                  <span>Título del reporte</span>
                  <input
                    type="text"
                    value={formulario.title}
                    maxLength={150}
                    placeholder="Ej. Bache frente a parada de bus"
                    disabled={crearReporte.isPending}
                    onChange={(evento) => actualizarCampo('title', evento.target.value)}
                  />
                  {errores.title ? (
                    <small className="crearReportePagina__error">{errores.title}</small>
                  ) : (
                    <small>Usa un título breve y fácil de identificar.</small>
                  )}
                </label>

                <label className="crearReportePagina__campo">
                  <span>Descripción del problema</span>
                  <textarea
                    value={formulario.description}
                    maxLength={2000}
                    placeholder="Describe qué ocurre, desde cuándo y cómo afecta a la zona."
                    disabled={crearReporte.isPending}
                    onChange={(evento) => actualizarCampo('description', evento.target.value)}
                  />
                  {errores.description ? (
                    <small className="crearReportePagina__error">{errores.description}</small>
                  ) : (
                    <small>{formulario.description.length}/2000 caracteres.</small>
                  )}
                </label>

                <label className="crearReportePagina__campo">
                  <span>Categoría</span>
                  <select
                    value={formulario.category}
                    disabled={crearReporte.isPending}
                    onChange={cambiarCategoria}
                  >
                    <option value="">Selecciona una categoría</option>
                    {categoriasReporte.map((categoria) => (
                      <option key={categoria} value={categoria}>
                        {etiquetasCategoria[categoria]}
                      </option>
                    ))}
                  </select>
                  {errores.category ? (
                    <small className="crearReportePagina__error">{errores.category}</small>
                  ) : (
                    <small>Clasifica el reporte para facilitar su atención.</small>
                  )}
                </label>
              </div>
            </Tarjeta>

            <Tarjeta
              titulo="2. Ubicación"
              descripcion="Agrega coordenadas o una referencia clara para ubicar el problema."
            >
              <div className="crearReportePagina__campos">
                {mensajeUbicacion ? (
                  <Alerta variante="informacion" titulo="Ubicación">
                    <p>{mensajeUbicacion}</p>
                  </Alerta>
                ) : null}

                <div className="crearReportePagina__ubicacionHerramientas">
                  <div>
                    <strong>Ubicación territorial</strong>
                    <p>
                      Puedes registrar una dirección, ingresar coordenadas manualmente o usar la
                      ubicación actual del navegador.
                    </p>
                  </div>

                  <div className="crearReportePagina__ubicacionAcciones">
                    <Boton
                      variante="secundario"
                      disabled={crearReporte.isPending || solicitandoUbicacion}
                      onClick={usarUbicacionActual}
                    >
                      {solicitandoUbicacion ? 'Obteniendo ubicación...' : 'Usar mi ubicación'}
                    </Boton>

                    <Boton
                      variante="fantasma"
                      disabled={crearReporte.isPending || !tieneUbicacion}
                      onClick={limpiarUbicacion}
                    >
                      Limpiar ubicación
                    </Boton>
                  </div>
                </div>

                <label className="crearReportePagina__campo">
                  <span>Dirección o referencia</span>
                  <input
                    type="text"
                    value={formulario.address}
                    maxLength={500}
                    placeholder="Ej. 6a avenida, frente al parque central"
                    disabled={crearReporte.isPending}
                    onChange={(evento) => actualizarCampo('address', evento.target.value)}
                  />
                  {errores.address ? (
                    <small className="crearReportePagina__error">{errores.address}</small>
                  ) : (
                    <small>Agrega una referencia que ayude a ubicar la incidencia.</small>
                  )}
                </label>

                <div className="crearReportePagina__gridCampos">
                  <label className="crearReportePagina__campo">
                    <span>Latitud</span>
                    <input
                      type="number"
                      value={formulario.latitude}
                      min={-90}
                      max={90}
                      step="0.000001"
                      placeholder="Ej. 14.634915"
                      disabled={crearReporte.isPending}
                      onChange={(evento) => actualizarCampo('latitude', evento.target.value)}
                    />
                    {errores.latitude ? (
                      <small className="crearReportePagina__error">{errores.latitude}</small>
                    ) : (
                      <small>Debe estar entre -90 y 90.</small>
                    )}
                  </label>

                  <label className="crearReportePagina__campo">
                    <span>Longitud</span>
                    <input
                      type="number"
                      value={formulario.longitude}
                      min={-180}
                      max={180}
                      step="0.000001"
                      placeholder="Ej. -90.506882"
                      disabled={crearReporte.isPending}
                      onChange={(evento) => actualizarCampo('longitude', evento.target.value)}
                    />
                    {errores.longitude ? (
                      <small className="crearReportePagina__error">{errores.longitude}</small>
                    ) : (
                      <small>Debe estar entre -180 y 180.</small>
                    )}
                  </label>
                </div>

                <div className="crearReportePagina__vistaUbicacion">
                  <SelectorUbicacionMapa
                    latitude={coordenadasValidas?.latitude}
                    longitude={coordenadasValidas?.longitude}
                    bloqueado={crearReporte.isPending}
                    titulo="Seleccionar punto en el mapa"
                    descripcion="Haz clic sobre el mapa para registrar las coordenadas del reporte."
                    etiquetaPunto="Coordenadas del reporte"
                    textoSinPunto="Haz clic sobre el mapa o ingresa latitud y longitud manualmente."
                    altura="compacta"
                    alCambiarCoordenadas={seleccionarCoordenadasMapa}
                  />

                  <div className="crearReportePagina__datosUbicacion">
                    <div>
                      <span>Estado</span>
                      <strong>{tieneUbicacion ? 'Ubicación capturada' : 'Sin ubicación'}</strong>
                    </div>

                    <div>
                      <span>Latitud</span>
                      <strong>{formatearCoordenada(formulario.latitude)}</strong>
                    </div>

                    <div>
                      <span>Longitud</span>
                      <strong>{formatearCoordenada(formulario.longitude)}</strong>
                    </div>

                    <div>
                      <span>Referencia</span>
                      <strong>{limpiarTexto(formulario.address) || 'No registrada'}</strong>
                    </div>

                    {urlMapa ? (
                      <a href={urlMapa} target="_blank" rel="noreferrer">
                        Abrir punto en mapa
                      </a>
                    ) : null}
                  </div>
                </div>
              </div>
            </Tarjeta>

            <Tarjeta
              titulo="3. Evidencia"
              descripcion="Adjunta imágenes claras del problema si las tienes disponibles."
            >
              <div className="crearReportePagina__campos">
                <label className="crearReportePagina__campo crearReportePagina__campoArchivo">
                  <span>Imágenes del reporte</span>
                  <div className="crearReportePagina__zonaCarga">
                    <input
                      key={llaveInputImagenes}
                      type="file"
                      className="crearReportePagina__inputOculto"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      disabled={crearReporte.isPending}
                      onChange={cambiarImagenes}
                    />
                    <div className="crearReportePagina__zonaCargaContenido">
                      <ImagePlus size={28} className="crearReportePagina__zonaCargaIcono" />
                      <div className="crearReportePagina__zonaCargaTextos">
                        <span className="crearReportePagina__zonaCargaBoton">Seleccionar imágenes</span>
                        <span className="crearReportePagina__zonaCargaSeparador">o arrastra tus archivos aquí</span>
                      </div>
                      <span className="crearReportePagina__zonaCargaFormatos">
                        Formatos aceptados: JPEG, PNG, WebP (máx. {maximoTamanoImagenMb} MB por archivo)
                      </span>
                    </div>
                  </div>
                  {errores.images ? (
                    <small className="crearReportePagina__error">{errores.images}</small>
                  ) : (
                    <small>
                      Máximo 3 imágenes en formato JPEG, PNG o WebP. Cada imagen debe pesar máximo{' '}
                      {maximoTamanoImagenMb} MB.
                    </small>
                  )}
                </label>

                {totalImagenes > 0 ? (
                  <div className="crearReportePagina__imagenesSeleccionadas">
                    <div className="crearReportePagina__imagenesEncabezado">
                      <strong>{totalImagenes} imágenes seleccionadas</strong>
                      <Boton
                        variante="fantasma"
                        tamano="sm"
                        disabled={crearReporte.isPending}
                        onClick={limpiarImagenes}
                      >
                        Quitar imágenes
                      </Boton>
                    </div>

                    <ul>
                      {formulario.images.map((imagen) => (
                        <li key={`${imagen.name}-${imagen.size}`}>
                          <span>{imagen.name}</span>
                          <small>{formatearTamanoArchivo(imagen.size)}</small>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            </Tarjeta>

            <AnalisisReportePanel
              imagenes={formulario.images}
              direccion={formulario.address}
              titulo={formulario.title}
              descripcion={formulario.description}
              categoria={formulario.category}
              bloqueado={crearReporte.isPending}
              alAplicarAnalisis={aplicarAnalisisReporte}
            />

            <DuplicadosReportePanel
              titulo={formulario.title}
              descripcion={formulario.description}
              categoria={formulario.category}
              latitude={coordenadasValidas?.latitude ?? null}
              longitude={coordenadasValidas?.longitude ?? null}
              bloqueado={crearReporte.isPending}
              revisionVigente={revisionDuplicados.revisado}
              alCompletarRevision={completarRevisionDuplicados}
            />
          </div>

          <aside className="crearReportePagina__columnaResumen">
            <Tarjeta
              titulo="Revisión del reporte"
              descripcion="Verifica la información antes de enviarla."
              className="crearReportePagina__resumen"
            >
              <div className="crearReportePagina__resumenLista">
                <div>
                  <span>Título</span>
                  <strong>{limpiarTexto(formulario.title) || 'Sin título'}</strong>
                </div>

                <div>
                  <span>Categoría</span>
                  <strong>
                    {formulario.category ? etiquetasCategoria[formulario.category] : 'Sin categoría'}
                  </strong>
                </div>

                <div>
                  <span>Ubicación</span>
                  <strong>{resumenUbicacion}</strong>
                </div>

                <div>
                  <span>Estado territorial</span>
                  <strong>{coordenadasValidas ? 'Con coordenadas' : 'Sin coordenadas'}</strong>
                </div>

                <div>
                  <span>Evidencia</span>
                  <strong>
                    {totalImagenes > 0
                      ? `${totalImagenes} ${totalImagenes === 1 ? 'imagen' : 'imágenes'}`
                      : 'Sin imágenes adjuntas'}
                  </strong>
                </div>

                <div>
                  <span>Duplicados</span>
                  <strong>
                    {revisionDuplicados.revisado
                      ? revisionDuplicados.totalCandidatos > 0
                        ? `${revisionDuplicados.totalCandidatos} posible${
                            revisionDuplicados.totalCandidatos === 1 ? '' : 's'
                          } similar${revisionDuplicados.totalCandidatos === 1 ? '' : 'es'}`
                        : 'Sin coincidencias'
                      : 'Pendiente de revisar'}
                  </strong>
                </div>
              </div>

              {revisionDuplicados.revisado && revisionDuplicados.hayDuplicados ? (
                <Alerta variante="advertencia" titulo="Posibles duplicados">
                  <p>
                    Se encontraron reportes con alta similitud. Puedes enviar este reporte si
                    corresponde a una incidencia diferente.
                  </p>
                </Alerta>
              ) : null}

              <div className="crearReportePagina__accionesFormulario">
                <Boton type="submit" disabled={crearReporte.isPending} anchoCompleto>
                  {crearReporte.isPending ? 'Enviando reporte...' : 'Enviar reporte'}
                </Boton>

                <Boton
                  type="button"
                  variante="secundario"
                  disabled={crearReporte.isPending}
                  anchoCompleto
                  onClick={limpiarFormulario}
                >
                  Limpiar formulario
                </Boton>
              </div>
            </Tarjeta>
          </aside>
        </section>
      </form>
    </main>
  );
}