import { useEffect, useMemo, useState } from 'react';

import { Alerta } from '../../../shared/components/feedback/Alerta';
import { Boton } from '../../../shared/components/ui/Boton';
import { Tarjeta } from '../../../shared/components/ui/Tarjeta';
import { esErrorApi } from '../../../shared/types/errorApi';
import { usarAnalizarReporteConIa } from '../hooks/usarReportesIa';
import type {
  AnalisisSugeridoReporte,
  RespuestaAnalisisReporteExitosa,
  UbicacionAnalisisReporte,
  ValidacionEvidenciaReporte
} from '../types/reportesIaTipos';
import type { CategoriaReporte, PrioridadReporte } from '../types/reportesTipos';
import './analisisReportePanel.css';

export type AnalisisReporteAplicado = {
  analysis: AnalisisSugeridoReporte;
  location: UbicacionAnalisisReporte;
};

type PropiedadesAnalisisReportePanel = {
  imagenes: File[];
  direccion: string;
  titulo: string;
  descripcion: string;
  categoria: CategoriaReporte | '';
  bloqueado?: boolean;
  alAplicarAnalisis: (resultado: AnalisisReporteAplicado) => void;
};

const etiquetasCategoria: Record<CategoriaReporte, string> = {
  INFRAESTRUCTURA: 'Infraestructura',
  SEGURIDAD: 'Seguridad',
  LIMPIEZA: 'Limpieza'
};

const etiquetasPrioridad: Record<PrioridadReporte, string> = {
  ALTA: 'Alta',
  MEDIA: 'Media',
  BAJA: 'Baja'
};

function limpiarTexto(valor: string) {
  return valor.trim();
}

function obtenerMensajeError(error: unknown) {
  if (esErrorApi(error)) {
    return error.mensaje;
  }

  return 'No fue posible analizar la evidencia. Puedes continuar completando el reporte manualmente.';
}

function obtenerMensajeRespuestaFallida(respuesta: { message?: string; error?: string }) {
  return (
    respuesta.message ??
    respuesta.error ??
    'No fue posible analizar la evidencia. Puedes continuar completando el reporte manualmente.'
  );
}

function formatearCoordenada(valor: number | null) {
  if (valor === null) {
    return 'No registrada';
  }

  return new Intl.NumberFormat('es-GT', {
    maximumFractionDigits: 6
  }).format(valor);
}

function formatearScore(valor: number | null) {
  if (valor === null) {
    return 'Sin comparación';
  }

  return `${new Intl.NumberFormat('es-GT', {
    maximumFractionDigits: 0
  }).format(valor * 100)}%`;
}

function obtenerTituloValidacion(validacion: ValidacionEvidenciaReporte) {
  if (validacion.status === 'RELATED') {
    return 'Imagen relacionada';
  }

  if (validacion.status === 'REVIEW') {
    return 'Revisar coincidencia';
  }

  if (validacion.status === 'UNRELATED') {
    return 'Imagen posiblemente no relacionada';
  }

  return 'Sin comparación completa';
}

function obtenerVarianteValidacion(validacion: ValidacionEvidenciaReporte) {
  if (validacion.status === 'RELATED') {
    return 'exito' as const;
  }

  if (validacion.status === 'UNRELATED' || validacion.status === 'REVIEW') {
    return 'advertencia' as const;
  }

  return 'informacion' as const;
}

export function AnalisisReportePanel({
  imagenes,
  direccion,
  titulo,
  descripcion,
  categoria,
  bloqueado = false,
  alAplicarAnalisis
}: PropiedadesAnalisisReportePanel) {
  const analizarReporte = usarAnalizarReporteConIa();

  const [resultado, setResultado] = useState<RespuestaAnalisisReporteExitosa | null>(null);
  const [mensajeError, setMensajeError] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  const imagenPrincipal = useMemo(() => imagenes[0] ?? null, [imagenes]);
  const direccionLimpia = limpiarTexto(direccion);
  const tituloLimpio = limpiarTexto(titulo);
  const descripcionLimpia = limpiarTexto(descripcion);
  const tieneImagen = Boolean(imagenPrincipal);
  const tieneContextoReporte = Boolean(tituloLimpio || descripcionLimpia || categoria);
  const tieneVariasImagenes = imagenes.length > 1;
  const puedeAnalizar = tieneImagen && !bloqueado && !analizarReporte.isPending;

  useEffect(() => {
    setResultado(null);
    setMensajeError(null);
    setMensajeExito(null);
  }, [imagenPrincipal, direccionLimpia, tituloLimpio, descripcionLimpia, categoria]);

  const analizarEvidencia = async () => {
    setMensajeError(null);
    setMensajeExito(null);

    if (!imagenPrincipal) {
      setMensajeError('Selecciona una imagen para realizar el análisis asistido.');
      return;
    }

    try {
      const respuesta = await analizarReporte.mutateAsync({
        image: imagenPrincipal,
        address: direccionLimpia || undefined,
        title: tituloLimpio || undefined,
        description: descripcionLimpia || undefined,
        category: categoria || undefined
      });

      if (respuesta.success === false) {
        setResultado(null);
        setMensajeError(obtenerMensajeRespuestaFallida(respuesta));
        return;
      }

      setResultado(respuesta);
      setMensajeExito(
        respuesta.evidenceValidation.shouldWarn
          ? 'Análisis completado. Revisa la advertencia antes de enviar.'
          : 'Análisis completado. La imagen parece coherente con el reporte.'
      );
    } catch (error) {
      setResultado(null);
      setMensajeError(obtenerMensajeError(error));
    }
  };

  const aplicarAnalisis = () => {
    if (!resultado) {
      return;
    }

    alAplicarAnalisis({
      analysis: resultado.analysis,
      location: resultado.location
    });

    setMensajeExito(
      'Sugerencias aplicadas al formulario. Puedes ajustar cualquier dato antes de enviar.'
    );
  };

  return (
    <Tarjeta
      titulo="4. Validación inteligente"
      descripcion="La IA compara la imagen con el reporte para ayudarte a evitar evidencia no relacionada."
      className="analisisReportePanel"
    >
      <div className="analisisReportePanel__contenido">
        <div className="analisisReportePanel__intro">
          <div>
            <strong>Revisión guiada de evidencia</strong>
            <p>
              La IA revisa la imagen principal, sugiere datos y valida si la foto parece coincidir
              con el título, descripción y categoría del reporte.
            </p>
          </div>

          <Boton disabled={!puedeAnalizar} onClick={analizarEvidencia}>
            {analizarReporte.isPending ? 'Analizando evidencia...' : 'Validar imagen'}
          </Boton>
        </div>

        {!tieneImagen ? (
          <Alerta variante="informacion" titulo="Imagen necesaria">
            <p>Selecciona al menos una imagen para usar la validación inteligente.</p>
          </Alerta>
        ) : null}

        {tieneImagen && !tieneContextoReporte ? (
          <Alerta variante="informacion" titulo="Agrega contexto para comparar">
            <p>
              Puedes analizar solo la imagen, pero para validar coincidencia completa conviene
              completar título, descripción o categoría antes de presionar “Validar imagen”.
            </p>
          </Alerta>
        ) : null}

        {tieneVariasImagenes ? (
          <Alerta variante="informacion" titulo="Imagen principal">
            <p>
              El análisis utilizará la primera imagen seleccionada. Las demás imágenes se enviarán
              normalmente al crear el reporte.
            </p>
          </Alerta>
        ) : null}

        {mensajeError ? (
          <Alerta variante="advertencia" titulo="Análisis no disponible">
            <p>{mensajeError}</p>
          </Alerta>
        ) : null}

        {mensajeExito ? (
          <Alerta variante="exito" titulo="Análisis asistido">
            <p>{mensajeExito}</p>
          </Alerta>
        ) : null}

        {resultado ? (
          <div className="analisisReportePanel__resultado">
            <Alerta
              variante={obtenerVarianteValidacion(resultado.evidenceValidation)}
              titulo={obtenerTituloValidacion(resultado.evidenceValidation)}
            >
              <p>{resultado.evidenceValidation.message}</p>
            </Alerta>

            <div className="analisisReportePanel__estado">
              <span>{resultado.ready ? 'Listo para revisar' : 'Revisión parcial'}</span>
              <strong>Coincidencia estimada: {formatearScore(resultado.evidenceValidation.score)}</strong>
            </div>

            {resultado.evidenceValidation.reasons.length > 0 ? (
              <ul className="analisisReportePanel__razones">
                {resultado.evidenceValidation.reasons.map((razon) => (
                  <li key={razon}>{razon}</li>
                ))}
              </ul>
            ) : null}

            <div className="analisisReportePanel__grid">
              <article>
                <span>Título sugerido</span>
                <strong>{resultado.analysis.title}</strong>
              </article>

              <article>
                <span>Categoría sugerida</span>
                <strong>{etiquetasCategoria[resultado.analysis.category]}</strong>
              </article>

              <article>
                <span>Prioridad sugerida</span>
                <strong>{etiquetasPrioridad[resultado.analysis.priority]}</strong>
              </article>

              <article>
                <span>Dirección interpretada</span>
                <strong>{(resultado.location.address ?? direccionLimpia) || 'No registrada'}</strong>
              </article>

              <article>
                <span>Latitud</span>
                <strong>{formatearCoordenada(resultado.location.latitude)}</strong>
              </article>

              <article>
                <span>Longitud</span>
                <strong>{formatearCoordenada(resultado.location.longitude)}</strong>
              </article>
            </div>

            <div className="analisisReportePanel__descripcion">
              <span>Descripción sugerida</span>
              <p>{resultado.analysis.description}</p>
            </div>

            <div className="analisisReportePanel__acciones">
              <Boton disabled={bloqueado} onClick={aplicarAnalisis}>
                Aplicar sugerencias
              </Boton>

              <Boton
                variante="fantasma"
                disabled={bloqueado || analizarReporte.isPending}
                onClick={analizarEvidencia}
              >
                Volver a validar
              </Boton>
            </div>
          </div>
        ) : null}
      </div>
    </Tarjeta>
  );
}
