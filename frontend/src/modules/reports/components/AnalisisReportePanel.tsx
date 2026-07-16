import { useEffect, useMemo, useState } from 'react';

import { Alerta } from '../../../shared/components/feedback/Alerta';
import { Boton } from '../../../shared/components/ui/Boton';
import { Tarjeta } from '../../../shared/components/ui/Tarjeta';
import { esErrorApi } from '../../../shared/types/errorApi';
import { usarAnalizarReporteConIa } from '../hooks/usarReportesIa';
import type {
  AnalisisSugeridoReporte,
  RespuestaAnalisisReporteExitosa,
  UbicacionAnalisisReporte
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

export function AnalisisReportePanel({
  imagenes,
  direccion,
  bloqueado = false,
  alAplicarAnalisis
}: PropiedadesAnalisisReportePanel) {
  const analizarReporte = usarAnalizarReporteConIa();

  const [resultado, setResultado] = useState<RespuestaAnalisisReporteExitosa | null>(null);
  const [mensajeError, setMensajeError] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  const imagenPrincipal = useMemo(() => imagenes[0] ?? null, [imagenes]);
  const direccionLimpia = limpiarTexto(direccion);
  const tieneImagen = Boolean(imagenPrincipal);
  const tieneDireccion = direccionLimpia.length > 0;
  const tieneVariasImagenes = imagenes.length > 1;
  const puedeAnalizar = tieneImagen && tieneDireccion && !bloqueado && !analizarReporte.isPending;

  useEffect(() => {
    setResultado(null);
    setMensajeError(null);
    setMensajeExito(null);
  }, [imagenPrincipal, direccionLimpia]);

  const analizarEvidencia = async () => {
    setMensajeError(null);
    setMensajeExito(null);

    if (!imagenPrincipal) {
      setMensajeError('Selecciona una imagen para realizar el análisis asistido.');
      return;
    }

    if (!direccionLimpia) {
      setMensajeError('Ingresa una dirección o referencia antes de analizar la evidencia.');
      return;
    }

    try {
      const respuesta = await analizarReporte.mutateAsync({
        image: imagenPrincipal,
        address: direccionLimpia
      });

      if (respuesta.success === false) {
        setResultado(null);
        setMensajeError(obtenerMensajeRespuestaFallida(respuesta));
        return;
      }

      setResultado(respuesta);
      setMensajeExito('Análisis completado. Revisa las sugerencias antes de aplicarlas.');
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
      titulo="4. Análisis asistido"
      descripcion="Usa la evidencia y la dirección para obtener una propuesta automática antes de enviar."
      className="analisisReportePanel"
    >
      <div className="analisisReportePanel__contenido">
        <div className="analisisReportePanel__intro">
          <div>
            <strong>Revisión automática del reporte</strong>
            <p>
              El análisis puede sugerir título, descripción, categoría, prioridad y ubicación. La
              creación manual se mantiene disponible aunque el análisis no se ejecute.
            </p>
          </div>

          <Boton disabled={!puedeAnalizar} onClick={analizarEvidencia}>
            {analizarReporte.isPending ? 'Analizando evidencia...' : 'Analizar evidencia'}
          </Boton>
        </div>

        {!tieneImagen || !tieneDireccion ? (
          <Alerta variante="informacion" titulo="Datos necesarios para analizar">
            <p>
              Para usar esta ayuda debes seleccionar al menos una imagen e ingresar una dirección o
              referencia en la sección de ubicación.
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
            <div className="analisisReportePanel__estado">
              <span>{resultado.ready ? 'Listo para revisar' : 'Revisión parcial'}</span>
              <strong>
                {resultado.location.found ? 'Ubicación encontrada' : 'Ubicación sin confirmar'}
              </strong>
            </div>

            <div className="analisisReportePanel__grid">
              <article>
                <span>Título sugerido</span>
                <strong>{resultado.analysis.title}</strong>
              </article>

              <article>
                <span>Categoría</span>
                <strong>{etiquetasCategoria[resultado.analysis.category]}</strong>
              </article>

              <article>
                <span>Prioridad</span>
                <strong>{etiquetasPrioridad[resultado.analysis.priority]}</strong>
              </article>

              <article>
                <span>Dirección interpretada</span>
                <strong>{resultado.location.address ?? direccionLimpia}</strong>
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
                Volver a analizar
              </Boton>
            </div>
          </div>
        ) : null}
      </div>
    </Tarjeta>
  );
}