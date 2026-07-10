import { Boton } from '../../../shared/components/ui/Boton';
import { Tarjeta } from '../../../shared/components/ui/Tarjeta';
import type { Reporte, UsuarioResumenReporte } from '../types/reportesTipos';
import type {
  EvaluacionOperativaReporte,
  NivelAtencionOperativa
} from '../types/reportesOperativosTipos';
import {
  evaluarAtencionOperativaReporte,
  obtenerEstadosPermitidosReporte,
  obtenerEtiquetaEstadoOperativo,
  obtenerEtiquetaPrioridadOperativa,
  reporteTieneResponsable,
  reporteTieneUbicacion
} from '../utils/reportesOperativosUtils';
import './panelOperacionReporte.css';

type PropiedadesPanelOperacionReporte = {
  reporte: Reporte;
  actualizando?: boolean;
  alActualizar?: () => void;
};

type AccionOperativaSugerida = {
  titulo: string;
  descripcion: string;
  etiquetaBoton: string;
  seccionDestino: string;
};

type AlertaOperativa = {
  id: string;
  titulo: string;
  descripcion: string;
  nivel: 'critico' | 'advertencia' | 'informacion';
  seccionDestino: string;
  etiquetaAccion: string;
};

export const idsSeccionesDetalleReporte = {
  general: 'detalle-general',
  operacion: 'detalle-operacion',
  ubicacion: 'detalle-ubicacion',
  inteligencia: 'detalle-inteligencia',
  seguimiento: 'detalle-seguimiento',
  similares: 'detalle-similares',
  acciones: 'detalle-acciones',
  comentarios: 'detalle-comentarios',
  historial: 'detalle-historial'
} as const;

const modificadoresNivel: Record<NivelAtencionOperativa, string> = {
  CRITICO: 'critico',
  ALTO: 'alto',
  MEDIO: 'medio',
  BAJO: 'bajo'
};

function obtenerNombreUsuario(usuario: UsuarioResumenReporte | null) {
  if (!usuario) {
    return 'Sin responsable';
  }

  const nombreCompleto = [usuario.name, usuario.surname]
    .filter(Boolean)
    .join(' ')
    .trim();

  return nombreCompleto || usuario.username || 'Usuario asignado';
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

function obtenerAntiguedadReporte(fechaCreacion: string) {
  const fecha = new Date(fechaCreacion);

  if (Number.isNaN(fecha.getTime())) {
    return 'Antigüedad no disponible';
  }

  const diferencia = Date.now() - fecha.getTime();
  const dias = Math.max(Math.floor(diferencia / 86_400_000), 0);

  if (dias === 0) {
    return 'Creado hoy';
  }

  if (dias === 1) {
    return 'Creado hace 1 día';
  }

  return `Creado hace ${dias} días`;
}

function obtenerEstadosSiguientes(reporte: Reporte) {
  const estados = obtenerEstadosPermitidosReporte(reporte.status);

  if (estados.length === 0) {
    return 'Sin transición directa';
  }

  return estados
    .map((estado) => obtenerEtiquetaEstadoOperativo(estado))
    .join(', ');
}

function obtenerAccionSugerida(
  reporte: Reporte
): AccionOperativaSugerida {
  if (reporte.status === 'RESUELTO') {
    return {
      titulo: 'Verificar cierre del caso',
      descripcion:
        'El reporte está resuelto. Revisa el historial para validar las acciones realizadas.',
      etiquetaBoton: 'Revisar historial',
      seccionDestino: idsSeccionesDetalleReporte.historial
    };
  }

  if (reporte.status === 'RECHAZADO') {
    return {
      titulo: 'Revisar motivo del rechazo',
      descripcion:
        'Consulta el historial para confirmar por qué el reporte fue rechazado y si debe reabrirse.',
      etiquetaBoton: 'Revisar historial',
      seccionDestino: idsSeccionesDetalleReporte.historial
    };
  }

  if (!reporteTieneResponsable(reporte)) {
    return {
      titulo: 'Asignar responsable',
      descripcion:
        'El reporte todavía no tiene una persona responsable de su seguimiento operativo.',
      etiquetaBoton: 'Gestionar asignación',
      seccionDestino: idsSeccionesDetalleReporte.acciones
    };
  }

  if (reporte.status === 'PENDIENTE') {
    return {
      titulo: 'Iniciar atención',
      descripcion:
        'El caso ya tiene responsable, pero continúa pendiente de iniciar su gestión.',
      etiquetaBoton: 'Actualizar estado',
      seccionDestino: idsSeccionesDetalleReporte.acciones
    };
  }

  return {
    titulo: 'Dar seguimiento al caso',
    descripcion:
      'El reporte se encuentra en proceso. Revisa su avance y registra la siguiente transición.',
    etiquetaBoton: 'Gestionar reporte',
    seccionDestino: idsSeccionesDetalleReporte.acciones
  };
}

function obtenerAlertasOperativas(reporte: Reporte) {
  const alertas: AlertaOperativa[] = [];

  if (
    reporte.priority === 'ALTA' &&
    reporte.status !== 'RESUELTO' &&
    reporte.status !== 'RECHAZADO'
  ) {
    alertas.push({
      id: 'alta-prioridad',
      titulo: 'Reporte de alta prioridad',
      descripcion:
        'Este caso requiere seguimiento cercano mientras permanezca activo.',
      nivel: 'critico',
      seccionDestino: idsSeccionesDetalleReporte.acciones,
      etiquetaAccion: 'Revisar gestión'
    });
  }

  if (
    !reporteTieneResponsable(reporte) &&
    reporte.status !== 'RESUELTO' &&
    reporte.status !== 'RECHAZADO'
  ) {
    alertas.push({
      id: 'sin-responsable',
      titulo: 'Sin responsable asignado',
      descripcion:
        'Asigna una persona responsable para iniciar el seguimiento del reporte.',
      nivel: 'advertencia',
      seccionDestino: idsSeccionesDetalleReporte.acciones,
      etiquetaAccion: 'Asignar responsable'
    });
  }

  if (!reporteTieneUbicacion(reporte)) {
    alertas.push({
      id: 'sin-ubicacion',
      titulo: 'Ubicación incompleta',
      descripcion:
        'El reporte no tiene coordenadas suficientes para el seguimiento territorial.',
      nivel: 'advertencia',
      seccionDestino: idsSeccionesDetalleReporte.ubicacion,
      etiquetaAccion: 'Revisar ubicación'
    });
  }

  if (reporte.images.length === 0) {
    alertas.push({
      id: 'sin-evidencia',
      titulo: 'Sin evidencia visual',
      descripcion:
        'El reporte no cuenta con imágenes para respaldar el análisis visual.',
      nivel: 'informacion',
      seccionDestino: idsSeccionesDetalleReporte.general,
      etiquetaAccion: 'Ver información'
    });
  }

  return alertas;
}

function desplazarASeccion(seccionId: string) {
  const elemento = document.getElementById(seccionId);

  if (!elemento) {
    return;
  }

  elemento.scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  });
}

function EstadoAtencion({
  evaluacion
}: {
  evaluacion: EvaluacionOperativaReporte;
}) {
  const modificador = modificadoresNivel[evaluacion.nivel];

  return (
    <div className="panelOperacionReporte__estado">
      <span
        className={`panelOperacionReporte__nivel panelOperacionReporte__nivel--${modificador}`}
      >
        {evaluacion.etiqueta}
      </span>

      <strong>
        {evaluacion.requiereAtencion
          ? 'Requiere atención operativa'
          : 'Sin alerta operativa inmediata'}
      </strong>

      <p>{evaluacion.descripcion}</p>
    </div>
  );
}

export function PanelOperacionReporte({
  reporte,
  actualizando = false,
  alActualizar
}: PropiedadesPanelOperacionReporte) {
  const evaluacion = evaluarAtencionOperativaReporte(reporte);
  const accionSugerida = obtenerAccionSugerida(reporte);
  const alertas = obtenerAlertasOperativas(reporte);

  const accesosRapidos = [
    {
      id: idsSeccionesDetalleReporte.ubicacion,
      etiqueta: 'Ubicación'
    },
    {
      id: idsSeccionesDetalleReporte.inteligencia,
      etiqueta: 'Inteligencia'
    },
    {
      id: idsSeccionesDetalleReporte.similares,
      etiqueta: 'Similares'
    },
    {
      id: idsSeccionesDetalleReporte.acciones,
      etiqueta: 'Gestión'
    },
    {
      id: idsSeccionesDetalleReporte.comentarios,
      etiqueta: 'Comentarios'
    },
    {
      id: idsSeccionesDetalleReporte.historial,
      etiqueta: 'Historial'
    }
  ];

  return (
    <Tarjeta
      titulo="Centro operativo del reporte"
      descripcion="Resumen administrativo y accesos rápidos para gestionar el caso."
      acciones={
        alActualizar ? (
          <Boton
            variante="secundario"
            tamano="sm"
            disabled={actualizando}
            onClick={alActualizar}
          >
            {actualizando ? 'Actualizando...' : 'Actualizar datos'}
          </Boton>
        ) : null
      }
      className="panelOperacionReporte"
    >
      <div className="panelOperacionReporte__contenido">
        <div className="panelOperacionReporte__principal">
          <EstadoAtencion evaluacion={evaluacion} />

          <article className="panelOperacionReporte__siguienteAccion">
            <span>Siguiente acción recomendada</span>
            <h3>{accionSugerida.titulo}</h3>
            <p>{accionSugerida.descripcion}</p>

            <Boton
              onClick={() =>
                desplazarASeccion(accionSugerida.seccionDestino)
              }
            >
              {accionSugerida.etiquetaBoton}
            </Boton>
          </article>
        </div>

        <dl className="panelOperacionReporte__metricas">
          <div>
            <dt>Estado actual</dt>
            <dd>{obtenerEtiquetaEstadoOperativo(reporte.status)}</dd>
          </div>

          <div>
            <dt>Prioridad</dt>
            <dd>
              {obtenerEtiquetaPrioridadOperativa(reporte.priority)}
            </dd>
          </div>

          <div>
            <dt>Responsable</dt>
            <dd>{obtenerNombreUsuario(reporte.assignedTo)}</dd>
          </div>

          <div>
            <dt>Ubicación</dt>
            <dd>
              {reporteTieneUbicacion(reporte)
                ? 'Coordenadas registradas'
                : 'Pendiente de confirmar'}
            </dd>
          </div>

          <div>
            <dt>Siguientes estados</dt>
            <dd>{obtenerEstadosSiguientes(reporte)}</dd>
          </div>

          <div>
            <dt>Antigüedad</dt>
            <dd>{obtenerAntiguedadReporte(reporte.createdAt)}</dd>
          </div>

          <div>
            <dt>Última actualización</dt>
            <dd>{formatearFecha(reporte.updatedAt)}</dd>
          </div>

          <div>
            <dt>Evidencia</dt>
            <dd>
              {reporte.images.length}{' '}
              {reporte.images.length === 1 ? 'imagen' : 'imágenes'}
            </dd>
          </div>
        </dl>

        {alertas.length > 0 ? (
          <section className="panelOperacionReporte__alertas">
            <div className="panelOperacionReporte__seccionTitulo">
              <span>Alertas operativas</span>
              <strong>{alertas.length}</strong>
            </div>

            <div className="panelOperacionReporte__alertasLista">
              {alertas.map((alerta) => (
                <article
                  key={alerta.id}
                  className={`panelOperacionReporte__alerta panelOperacionReporte__alerta--${alerta.nivel}`}
                >
                  <div>
                    <strong>{alerta.titulo}</strong>
                    <p>{alerta.descripcion}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      desplazarASeccion(alerta.seccionDestino)
                    }
                  >
                    {alerta.etiquetaAccion}
                  </button>
                </article>
              ))}
            </div>
          </section>
        ) : (
          <div className="panelOperacionReporte__sinAlertas">
            <strong>Sin alertas operativas adicionales</strong>
            <p>
              El reporte cuenta con la información necesaria para continuar
              su seguimiento.
            </p>
          </div>
        )}

        <nav
          className="panelOperacionReporte__navegacion"
          aria-label="Secciones del detalle del reporte"
        >
          <span>Ir a sección</span>

          <div>
            {accesosRapidos.map((acceso) => (
              <button
                type="button"
                key={acceso.id}
                onClick={() => desplazarASeccion(acceso.id)}
              >
                {acceso.etiqueta}
              </button>
            ))}
          </div>
        </nav>
      </div>
    </Tarjeta>
  );
}