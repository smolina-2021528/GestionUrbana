import type { ChangeEvent, FormEvent } from 'react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { rutasAplicacion } from '../../../config/constantesSistema';
import { textosSistema } from '../../../design/identity/textosSistema';
import { Alerta } from '../../../shared/components/feedback/Alerta';
import { Boton } from '../../../shared/components/ui/Boton';
import { Tarjeta } from '../../../shared/components/ui/Tarjeta';
import { esErrorApi } from '../../../shared/types/errorApi';
import { usarCrearReporte } from '../hooks/usarCrearReporte';
import {
  categoriasReporte,
  type CategoriaReporte,
  type CrearReportePayload
} from '../types/reportesTipos';
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

type ErroresFormularioCrearReporte = Partial<Record<keyof FormularioCrearReporte, string>>;

const formularioInicial: FormularioCrearReporte = {
  title: '',
  description: '',
  category: '',
  address: '',
  latitude: '',
  longitude: '',
  images: []
};

const etiquetasCategoria: Record<CategoriaReporte, string> = {
  INFRAESTRUCTURA: 'Infraestructura',
  SEGURIDAD: 'Seguridad',
  LIMPIEZA: 'Limpieza'
};

const tiposImagenPermitidos = ['image/jpeg', 'image/png', 'image/webp'];
const maximoImagenes = 3;

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

    if (!Number.isFinite(latitud) || latitud < -90 || latitud > 90) {
      errores.latitude = 'La latitud debe ser un número entre -90 y 90.';
    }
  }

  if (longitudTexto) {
    const longitud = Number(longitudTexto);

    if (!Number.isFinite(longitud) || longitud < -180 || longitud > 180) {
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

export function CrearReportePagina() {
  const navigate = useNavigate();
  const crearReporte = usarCrearReporte();

  const [formulario, setFormulario] = useState<FormularioCrearReporte>(formularioInicial);
  const [errores, setErrores] = useState<ErroresFormularioCrearReporte>({});
  const [mensajeError, setMensajeError] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  const totalImagenes = formulario.images.length;

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

  const actualizarCampo = (campo: keyof FormularioCrearReporte, valor: string) => {
    setFormulario((formularioActual) => ({
      ...formularioActual,
      [campo]: valor
    }));

    setErrores((erroresActuales) => {
      const erroresActualizados = { ...erroresActuales };
      delete erroresActualizados[campo];
      return erroresActualizados;
    });

    setMensajeError(null);
    setMensajeExito(null);
  };

  const cambiarCategoria = (evento: ChangeEvent<HTMLSelectElement>) => {
    const valor = evento.target.value;

    if (!valor || esCategoriaReporte(valor)) {
      actualizarCampo('category', valor);
    }
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

    setErrores((erroresActuales) => {
      const erroresActualizados = { ...erroresActuales };
      delete erroresActualizados.images;
      return erroresActualizados;
    });
  };

  const limpiarFormulario = () => {
    setFormulario(formularioInicial);
    setErrores({});
    setMensajeError(null);
    setMensajeExito(null);
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
              descripcion="Agrega una referencia clara para ubicar el problema."
            >
              <div className="crearReportePagina__campos">
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
                    <small>También puedes dejar este campo vacío si usarás coordenadas.</small>
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
                      step="any"
                      placeholder="Ej. 14.6349"
                      disabled={crearReporte.isPending}
                      onChange={(evento) => actualizarCampo('latitude', evento.target.value)}
                    />
                    {errores.latitude ? (
                      <small className="crearReportePagina__error">{errores.latitude}</small>
                    ) : (
                      <small>Opcional.</small>
                    )}
                  </label>

                  <label className="crearReportePagina__campo">
                    <span>Longitud</span>
                    <input
                      type="number"
                      value={formulario.longitude}
                      min={-180}
                      max={180}
                      step="any"
                      placeholder="Ej. -90.5069"
                      disabled={crearReporte.isPending}
                      onChange={(evento) => actualizarCampo('longitude', evento.target.value)}
                    />
                    {errores.longitude ? (
                      <small className="crearReportePagina__error">{errores.longitude}</small>
                    ) : (
                      <small>Opcional.</small>
                    )}
                  </label>
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
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    disabled={crearReporte.isPending}
                    onChange={cambiarImagenes}
                  />
                  {errores.images ? (
                    <small className="crearReportePagina__error">{errores.images}</small>
                  ) : (
                    <small>Máximo 3 imágenes en formato JPEG, PNG o WebP.</small>
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
                  <span>Evidencia</span>
                  <strong>
                    {totalImagenes > 0
                      ? `${totalImagenes} ${totalImagenes === 1 ? 'imagen' : 'imágenes'}`
                      : 'Sin imágenes adjuntas'}
                  </strong>
                </div>
              </div>

              <div className="crearReportePagina__accionesFormulario">
                <Boton
                  type="submit"
                  disabled={crearReporte.isPending}
                  anchoCompleto
                >
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