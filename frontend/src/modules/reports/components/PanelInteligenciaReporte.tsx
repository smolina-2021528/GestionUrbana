import { useState } from 'react';

import { Alerta } from '../../../shared/components/feedback/Alerta';
import { Boton } from '../../../shared/components/ui/Boton';
import { Tarjeta } from '../../../shared/components/ui/Tarjeta';
import { esErrorApi } from '../../../shared/types/errorApi';
import { usarReprocesarIaReporte } from '../hooks/usarReportesIa';
import type {
  AnalisisIAReporte,
  CategoriaReporte,
  PrioridadReporte,
  Reporte
} from '../types/reportesTipos';
import './panelInteligenciaReporte.css';

type PropiedadesPanelInteligenciaReporte = {
  reporte: Reporte;
  puedeReprocesar?: boolean;
  actualizando?: boolean;
  alCambioRealizado?: () => void;
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

function obtenerMensajeError(error: unknown) {
  if (esErrorApi(error)) {
    return error.mensaje;
  }

  return 'No fue posible reprocesar el análisis del reporte. Intenta nuevamente.';
}

function obtenerMensajeRespuestaFallida(respuesta: { message?: string; error?: string }) {
  return (
    respuesta.message ??
    respuesta.error ??
    'No fue posible reprocesar el análisis del reporte. Intenta nuevamente.'
  );
}

function formatearFecha(fecha: string | null | undefined) {
  if (!fecha) {
    return 'No disponible';
  }

  const fechaValida = new Date(fecha);

  if (Number.isNaN(fechaValida.getTime())) {
    return 'No disponible';
  }

  return new Intl.DateTimeFormat('es-GT', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(fechaValida);
}

function formatearPorcentaje(valor: number | null | undefined) {
  if (typeof valor !== 'number' || !Number.isFinite(valor)) {
    return 'No disponible';
  }

  return `${new Intl.NumberFormat('es-GT', {
    maximumFractionDigits: 1
  }).format(valor * 100)}%`;
}

function esCategoriaReporte(valor: string | null | undefined): valor is CategoriaReporte {
  return valor === 'INFRAESTRUCTURA' || valor === 'SEGURIDAD' || valor === 'LIMPIEZA';
}

function esPrioridadReporte(valor: string | null | undefined): valor is PrioridadReporte {
  return valor === 'ALTA' || valor === 'MEDIA' || valor === 'BAJA';
}

function obtenerCategoria(valor: string | null | undefined) {
  if (!valor) {
    return 'No disponible';
  }

  if (esCategoriaReporte(valor)) {
    return etiquetasCategoria[valor];
  }

  return valor;
}

function obtenerPrioridad(valor: string | null | undefined) {
  if (!valor) {
    return 'No disponible';
  }

  if (esPrioridadReporte(valor)) {
    return etiquetasPrioridad[valor];
  }

  return valor;
}

function obtenerEstadoIA(analisis: AnalisisIAReporte | null) {
  if (!analisis) {
    return {
      etiqueta: 'Sin análisis registrado',
      descripcion: 'El reporte todavía no tiene un resultado de inteligencia asociado.',
      modificador: 'sinAnalisis'
    };
  }

  switch (analisis.status) {
    case 'PENDING':
      return {
        etiqueta: 'Pendiente',
        descripcion: 'El análisis está pendiente de procesamiento.',
        modificador: 'pendiente'
      };
    case 'OK':
      return {
        etiqueta: 'Procesado',
        descripcion: 'El análisis se completó correctamente.',
        modificador: 'procesado'
      };
    case 'FAILED':
      return {
        etiqueta: 'Fallido',
        descripcion: 'El análisis anterior no pudo completarse correctamente.',
        modificador: 'fallido'
      };
    default:
      return {
        etiqueta: analisis.status,
        descripcion: 'Estado registrado por el servicio de inteligencia.',
        modificador: 'sinAnalisis'
      };
  }
}

function obtenerTextoSeguro(valor: string | null | undefined, respaldo = 'No disponible') {
  const texto = valor?.trim();

  if (!texto) {
    return respaldo;
  }

  return texto;
}

export function PanelInteligenciaReporte({
  reporte,
  puedeReprocesar = false,
  actualizando = false,
  alCambioRealizado
}: PropiedadesPanelInteligenciaReporte) {
  const reprocesarIa = usarReprocesarIaReporte();

  const [mensajeError, setMensajeError] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  const analisis = reporte.ai;
  const estado = obtenerEstadoIA(analisis);
  const tieneImagenes = reporte.images.length > 0;
  const accionEnProceso = reprocesarIa.isPending || actualizando;
  const puedeEjecutarReproceso = puedeReprocesar && tieneImagenes && !accionEnProceso;

  const reprocesarAnalisis = async () => {
    setMensajeError(null);
    setMensajeExito(null);

    if (!tieneImagenes) {
      setMensajeError('El reporte no tiene imágenes para analizar.');
      return;
    }

    try {
      const respuesta = await reprocesarIa.mutateAsync(reporte.id);

      if (respuesta.success === false) {
        setMensajeError(obtenerMensajeRespuestaFallida(respuesta));
        return;
      }

      setMensajeExito(respuesta.message ?? 'Análisis reprocesado correctamente.');
      alCambioRealizado?.();
    } catch (error) {
      setMensajeError(obtenerMensajeError(error));
    }
  };

  return (
    <Tarjeta
      titulo="Inteligencia del reporte"
      descripcion="Resultado del análisis automático aplicado a la evidencia visual del reporte."
      acciones={
        puedeReprocesar ? (
          <Boton
            variante="secundario"
            tamano="sm"
            disabled={!puedeEjecutarReproceso}
            onClick={reprocesarAnalisis}
          >
            {reprocesarIa.isPending ? 'Reprocesando...' : 'Reprocesar IA'}
          </Boton>
        ) : null
      }
      className="panelInteligenciaReporte"
    >
      <div className="panelInteligenciaReporte__contenido">
        {mensajeError ? (
          <Alerta variante="error" titulo="No se pudo reprocesar">
            <p>{mensajeError}</p>
          </Alerta>
        ) : null}

        {mensajeExito ? (
          <Alerta variante="exito" titulo="Análisis actualizado">
            <p>{mensajeExito}</p>
          </Alerta>
        ) : null}

        {puedeReprocesar && !tieneImagenes ? (
          <Alerta variante="informacion" titulo="Sin evidencia visual">
            <p>Para reprocesar el análisis, el reporte debe tener al menos una imagen.</p>
          </Alerta>
        ) : null}

        <div className="panelInteligenciaReporte__estado">
          <div>
            <span
              className={`panelInteligenciaReporte__insignia panelInteligenciaReporte__insignia--${estado.modificador}`}
            >
              {estado.etiqueta}
            </span>
            <h3>{analisis ? 'Análisis registrado' : 'Sin análisis disponible'}</h3>
            <p>{estado.descripcion}</p>
          </div>

          <div className="panelInteligenciaReporte__fecha">
            <span>Procesado</span>
            <strong>{formatearFecha(analisis?.processedAt)}</strong>
          </div>
        </div>

        <div className="panelInteligenciaReporte__grid">
          <article>
            <span>Categoría sugerida</span>
            <strong>{obtenerCategoria(analisis?.category)}</strong>
          </article>

          <article>
            <span>Prioridad sugerida</span>
            <strong>{obtenerPrioridad(analisis?.priority)}</strong>
          </article>

          <article>
            <span>Confianza</span>
            <strong>{formatearPorcentaje(analisis?.confidence)}</strong>
          </article>

          <article>
            <span>Evidencia disponible</span>
            <strong>
              {reporte.images.length > 0
                ? `${reporte.images.length} ${reporte.images.length === 1 ? 'imagen' : 'imágenes'}`
                : 'Sin imágenes'}
            </strong>
          </article>
        </div>

        <div className="panelInteligenciaReporte__razonamiento">
          <span>Razonamiento registrado</span>
          <p>{obtenerTextoSeguro(analisis?.reasoning)}</p>
        </div>
      </div>
    </Tarjeta>
  );
}