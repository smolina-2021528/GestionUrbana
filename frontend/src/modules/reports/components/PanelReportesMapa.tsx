import { Alerta } from '../../../shared/components/feedback/Alerta';
import { Cargando } from '../../../shared/components/feedback/Cargando';
import { EstadoVacio } from '../../../shared/components/data/EstadoVacio';
import { Boton } from '../../../shared/components/ui/Boton';
import { InsigniaEstado } from '../../../shared/components/ui/InsigniaEstado';
import { InsigniaPrioridad } from '../../../shared/components/ui/InsigniaPrioridad';
import type { CategoriaReporte } from '../types/reportesTipos';
import type { ReporteMapaVisual } from './MarcadorReporte';
import './mapaReportes.css';

type PropiedadesPanelReportesMapa = {
  reportes: ReporteMapaVisual[];
  total?: number;
  reporteSeleccionadoId?: string;
  estaCargando?: boolean;
  tieneError?: boolean;
  mensajeError?: string;
  limiteVisible?: number;
  alSeleccionarReporte?: (reporte: ReporteMapaVisual) => void;
  alVerDetalle?: (reporte: ReporteMapaVisual) => void;
  alReintentar?: () => void;
};

const etiquetasCategoria: Record<CategoriaReporte, string> = {
  INFRAESTRUCTURA: 'Infraestructura',
  SEGURIDAD: 'Seguridad',
  LIMPIEZA: 'Limpieza'
};

function formatearFecha(fecha: string | null | undefined) {
  if (!fecha) {
    return 'Fecha no disponible';
  }

  const fechaValida = new Date(fecha);

  if (Number.isNaN(fechaValida.getTime())) {
    return 'Fecha no disponible';
  }

  return new Intl.DateTimeFormat('es-GT', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(fechaValida);
}

function formatearCoordenada(valor: number | null) {
  if (typeof valor !== 'number') {
    return null;
  }

  return new Intl.NumberFormat('es-GT', {
    maximumFractionDigits: 5
  }).format(valor);
}

function obtenerUbicacion(reporte: ReporteMapaVisual) {
  if (reporte.address) {
    return reporte.address;
  }

  const latitud = formatearCoordenada(reporte.latitude);
  const longitud = formatearCoordenada(reporte.longitude);

  if (latitud && longitud) {
    return `${latitud}, ${longitud}`;
  }

  return 'Sin ubicación registrada';
}

function obtenerCategoria(categoria: CategoriaReporte) {
  return etiquetasCategoria[categoria] ?? categoria;
}

export function PanelReportesMapa({
  reportes,
  total,
  reporteSeleccionadoId,
  estaCargando = false,
  tieneError = false,
  mensajeError = 'No fue posible cargar los reportes territoriales.',
  limiteVisible = 8,
  alSeleccionarReporte,
  alVerDetalle,
  alReintentar
}: PropiedadesPanelReportesMapa) {
  const totalReportes = total ?? reportes.length;
  const reportesVisibles = reportes.slice(0, limiteVisible);
  const reportesRestantes = Math.max(totalReportes - reportesVisibles.length, 0);

  if (estaCargando) {
    return (
      <aside className="panelReportesMapa" aria-label="Panel de reportes territoriales">
        <Cargando texto="Cargando reportes territoriales..." />
      </aside>
    );
  }

  if (tieneError) {
    return (
      <aside className="panelReportesMapa" aria-label="Panel de reportes territoriales">
        <Alerta variante="error" titulo="No se pudo cargar la información">
          <div className="panelReportesMapa__alerta">
            <p>{mensajeError}</p>
            {alReintentar ? (
              <Boton variante="secundario" tamano="sm" onClick={alReintentar}>
                Reintentar
              </Boton>
            ) : null}
          </div>
        </Alerta>
      </aside>
    );
  }

  return (
    <aside className="panelReportesMapa" aria-label="Panel de reportes territoriales">
      <header className="panelReportesMapa__encabezado">
        <div>
          <p className="panelReportesMapa__eyebrow">Incidencias visibles</p>
          <h2 className="panelReportesMapa__titulo">Reportes del área</h2>
        </div>

        <span className="panelReportesMapa__contador">
          {new Intl.NumberFormat('es-GT').format(totalReportes)}
        </span>
      </header>

      {reportesVisibles.length > 0 ? (
        <>
          <div className="panelReportesMapa__lista">
            {reportesVisibles.map((reporte) => {
              const seleccionado = reporte.id === reporteSeleccionadoId;

              return (
                <article
                  key={reporte.id}
                  className={[
                    'panelReportesMapa__item',
                    seleccionado ? 'panelReportesMapa__item--seleccionado' : ''
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <button
                    type="button"
                    className="panelReportesMapa__selector"
                    onClick={() => alSeleccionarReporte?.(reporte)}
                  >
                    <span className="panelReportesMapa__categoria">
                      {obtenerCategoria(reporte.category)}
                    </span>

                    <span className="panelReportesMapa__nombre">{reporte.title}</span>

                    <span className="panelReportesMapa__ubicacion">{obtenerUbicacion(reporte)}</span>

                    <span className="panelReportesMapa__meta">
                      <span>Creado el {formatearFecha(reporte.createdAt)}</span>
                    </span>

                    <span className="panelReportesMapa__insignias">
                      <InsigniaEstado estado={reporte.status} />
                      <InsigniaPrioridad prioridad={reporte.priority} />
                    </span>
                  </button>

                  {alVerDetalle ? (
                    <div className="panelReportesMapa__acciones">
                      <Boton variante="fantasma" tamano="sm" onClick={() => alVerDetalle(reporte)}>
                        Ver detalle
                      </Boton>
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>

          {reportesRestantes > 0 ? (
            <p className="panelReportesMapa__resumen">
              Hay {new Intl.NumberFormat('es-GT').format(reportesRestantes)} reportes adicionales en
              esta consulta.
            </p>
          ) : null}
        </>
      ) : (
        <EstadoVacio
          titulo="Sin reportes para mostrar"
          descripcion="Ajusta los filtros o selecciona otra área para consultar incidencias urbanas."
        />
      )}
    </aside>
  );
}