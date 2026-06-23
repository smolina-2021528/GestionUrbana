import type {
  CategoriaReporte,
  EstadoReporte,
  PrioridadReporte,
  Reporte,
  UsuarioResumenReporte
} from '../types/reportesTipos';
import type {
  CargaTrabajoResponsable,
  ConteoPorCategoriaReporte,
  ConteoPorEstadoReporte,
  ConteoPorPrioridadReporte,
  EvaluacionOperativaReporte,
  FiltrosLocalesOperacionReportes,
  ReporteOperativoAgrupado,
  ResumenOperativoReportes,
  TransicionEstadoReporte
} from '../types/reportesOperativosTipos';
import { transicionesOperativasReporte } from '../types/reportesOperativosTipos';

export const etiquetasEstadoOperativo: Record<EstadoReporte, string> = {
  PENDIENTE: 'Pendiente',
  EN_PROCESO: 'En proceso',
  RESUELTO: 'Resuelto',
  RECHAZADO: 'Rechazado'
};

export const etiquetasPrioridadOperativa: Record<PrioridadReporte, string> = {
  ALTA: 'Alta',
  MEDIA: 'Media',
  BAJA: 'Baja'
};

export const etiquetasCategoriaOperativa: Record<CategoriaReporte, string> = {
  INFRAESTRUCTURA: 'Infraestructura',
  SEGURIDAD: 'Seguridad',
  LIMPIEZA: 'Limpieza'
};

const ordenPrioridad: Record<PrioridadReporte, number> = {
  ALTA: 1,
  MEDIA: 2,
  BAJA: 3
};

const ordenEstadoOperativo: Record<EstadoReporte, number> = {
  PENDIENTE: 1,
  EN_PROCESO: 2,
  RECHAZADO: 3,
  RESUELTO: 4
};

function crearConteoEstado(): ConteoPorEstadoReporte {
  return {
    PENDIENTE: 0,
    EN_PROCESO: 0,
    RESUELTO: 0,
    RECHAZADO: 0
  };
}

function crearConteoPrioridad(): ConteoPorPrioridadReporte {
  return {
    ALTA: 0,
    MEDIA: 0,
    BAJA: 0
  };
}

function crearConteoCategoria(): ConteoPorCategoriaReporte {
  return {
    INFRAESTRUCTURA: 0,
    SEGURIDAD: 0,
    LIMPIEZA: 0
  };
}

function obtenerFechaTiempo(fecha: string | null | undefined) {
  if (!fecha) {
    return 0;
  }

  const fechaValida = new Date(fecha).getTime();

  return Number.isNaN(fechaValida) ? 0 : fechaValida;
}

function obtenerNombreUsuario(usuario: UsuarioResumenReporte | null) {
  if (!usuario) {
    return 'Sin responsable';
  }

  const nombreCompleto = [usuario.name, usuario.surname].filter(Boolean).join(' ').trim();

  return nombreCompleto || usuario.username || 'Usuario asignado';
}

export function obtenerEtiquetaEstadoOperativo(estado: EstadoReporte | string) {
  return etiquetasEstadoOperativo[estado as EstadoReporte] ?? estado;
}

export function obtenerEtiquetaPrioridadOperativa(prioridad: PrioridadReporte | string) {
  return etiquetasPrioridadOperativa[prioridad as PrioridadReporte] ?? prioridad;
}

export function obtenerEtiquetaCategoriaOperativa(categoria: CategoriaReporte | string) {
  return etiquetasCategoriaOperativa[categoria as CategoriaReporte] ?? categoria;
}

export function reporteTieneResponsable(reporte: Reporte) {
  return Boolean(reporte.assignedTo?.id);
}

export function reporteTieneUbicacion(reporte: Reporte) {
  return reporte.hasLocation && reporte.latitude !== null && reporte.longitude !== null;
}

export function obtenerNombreResponsableReporte(reporte: Reporte) {
  return obtenerNombreUsuario(reporte.assignedTo);
}

export function obtenerEstadosPermitidosReporte(estadoActual: EstadoReporte) {
  return transicionesOperativasReporte[estadoActual] ?? [];
}

export function puedeCambiarEstadoReporte(estadoActual: EstadoReporte, nuevoEstado: EstadoReporte) {
  return obtenerEstadosPermitidosReporte(estadoActual).includes(nuevoEstado);
}

export function obtenerTransicionesEstadoReporte(estadoActual: EstadoReporte): TransicionEstadoReporte[] {
  return (Object.keys(etiquetasEstadoOperativo) as EstadoReporte[]).map((estado) => {
    const disponible = puedeCambiarEstadoReporte(estadoActual, estado);

    return {
      estado,
      etiqueta: etiquetasEstadoOperativo[estado],
      disponible,
      descripcion: disponible
        ? `Cambio permitido desde ${etiquetasEstadoOperativo[estadoActual]}.`
        : `No se puede cambiar directamente desde ${etiquetasEstadoOperativo[estadoActual]}.`
    };
  });
}

export function evaluarAtencionOperativaReporte(reporte: Reporte): EvaluacionOperativaReporte {
  if (reporte.status === 'RESUELTO') {
    return {
      nivel: 'BAJO',
      etiqueta: 'Caso cerrado',
      descripcion: 'El reporte ya fue resuelto.',
      requiereAtencion: false
    };
  }

  if (reporte.status === 'RECHAZADO') {
    return {
      nivel: 'BAJO',
      etiqueta: 'Caso rechazado',
      descripcion: 'El reporte fue rechazado y no requiere atención activa.',
      requiereAtencion: false
    };
  }

  if (reporte.priority === 'ALTA' && !reporteTieneResponsable(reporte)) {
    return {
      nivel: 'CRITICO',
      etiqueta: 'Alta prioridad sin responsable',
      descripcion: 'Debe asignarse un responsable para iniciar seguimiento.',
      requiereAtencion: true
    };
  }

  if (reporte.priority === 'ALTA') {
    return {
      nivel: 'ALTO',
      etiqueta: 'Alta prioridad',
      descripcion: 'Requiere seguimiento cercano por su nivel de prioridad.',
      requiereAtencion: true
    };
  }

  if (!reporteTieneResponsable(reporte)) {
    return {
      nivel: 'MEDIO',
      etiqueta: 'Sin responsable',
      descripcion: 'Debe asignarse un responsable operativo.',
      requiereAtencion: true
    };
  }

  if (reporte.status === 'PENDIENTE') {
    return {
      nivel: 'MEDIO',
      etiqueta: 'Pendiente de atención',
      descripcion: 'El reporte aún no inicia gestión.',
      requiereAtencion: true
    };
  }

  return {
    nivel: 'BAJO',
    etiqueta: 'En seguimiento',
    descripcion: 'El reporte tiene responsable y se encuentra en atención.',
    requiereAtencion: false
  };
}

export function obtenerResumenOperativoReportes(reportes: Reporte[]): ResumenOperativoReportes {
  const porEstado = crearConteoEstado();
  const porPrioridad = crearConteoPrioridad();
  const porCategoria = crearConteoCategoria();

  let sinResponsable = 0;
  let conResponsable = 0;
  let conUbicacion = 0;
  let sinUbicacion = 0;

  reportes.forEach((reporte) => {
    porEstado[reporte.status] += 1;
    porPrioridad[reporte.priority] += 1;
    porCategoria[reporte.category] += 1;

    if (reporteTieneResponsable(reporte)) {
      conResponsable += 1;
    } else {
      sinResponsable += 1;
    }

    if (reporteTieneUbicacion(reporte)) {
      conUbicacion += 1;
    } else {
      sinUbicacion += 1;
    }
  });

  return {
    total: reportes.length,
    pendientes: porEstado.PENDIENTE,
    enProceso: porEstado.EN_PROCESO,
    resueltos: porEstado.RESUELTO,
    rechazados: porEstado.RECHAZADO,
    altaPrioridad: porPrioridad.ALTA,
    sinResponsable,
    conResponsable,
    conUbicacion,
    sinUbicacion,
    porEstado,
    porPrioridad,
    porCategoria
  };
}

export function ordenarReportesPorUrgenciaOperativa(reportes: Reporte[]) {
  return [...reportes].sort((reporteA, reporteB) => {
    const prioridadA = ordenPrioridad[reporteA.priority] ?? 99;
    const prioridadB = ordenPrioridad[reporteB.priority] ?? 99;

    if (prioridadA !== prioridadB) {
      return prioridadA - prioridadB;
    }

    const estadoA = ordenEstadoOperativo[reporteA.status] ?? 99;
    const estadoB = ordenEstadoOperativo[reporteB.status] ?? 99;

    if (estadoA !== estadoB) {
      return estadoA - estadoB;
    }

    return obtenerFechaTiempo(reporteB.createdAt) - obtenerFechaTiempo(reporteA.createdAt);
  });
}

export function filtrarReportesOperacionLocalmente(
  reportes: Reporte[],
  filtros: FiltrosLocalesOperacionReportes
) {
  return reportes.filter((reporte) => {
    if (filtros.soloSinResponsable && reporteTieneResponsable(reporte)) {
      return false;
    }

    if (filtros.soloConResponsable && !reporteTieneResponsable(reporte)) {
      return false;
    }

    if (filtros.soloAltaPrioridad && reporte.priority !== 'ALTA') {
      return false;
    }

    if (filtros.soloConUbicacion && !reporteTieneUbicacion(reporte)) {
      return false;
    }

    if (filtros.soloSinUbicacion && reporteTieneUbicacion(reporte)) {
      return false;
    }

    return true;
  });
}

export function agruparReportesPorEstado(reportes: Reporte[]): ReporteOperativoAgrupado[] {
  return (Object.keys(etiquetasEstadoOperativo) as EstadoReporte[]).map((estado) => {
    const reportesGrupo = reportes.filter((reporte) => reporte.status === estado);

    return {
      clave: estado,
      titulo: etiquetasEstadoOperativo[estado],
      descripcion: `Reportes en estado ${etiquetasEstadoOperativo[estado].toLowerCase()}.`,
      total: reportesGrupo.length,
      reportes: reportesGrupo
    };
  });
}

export function agruparReportesPorPrioridad(reportes: Reporte[]): ReporteOperativoAgrupado[] {
  return (Object.keys(etiquetasPrioridadOperativa) as PrioridadReporte[]).map((prioridad) => {
    const reportesGrupo = reportes.filter((reporte) => reporte.priority === prioridad);

    return {
      clave: prioridad,
      titulo: etiquetasPrioridadOperativa[prioridad],
      descripcion: `Reportes con prioridad ${etiquetasPrioridadOperativa[prioridad].toLowerCase()}.`,
      total: reportesGrupo.length,
      reportes: reportesGrupo
    };
  });
}

export function agruparReportesPorCategoria(reportes: Reporte[]): ReporteOperativoAgrupado[] {
  return (Object.keys(etiquetasCategoriaOperativa) as CategoriaReporte[]).map((categoria) => {
    const reportesGrupo = reportes.filter((reporte) => reporte.category === categoria);

    return {
      clave: categoria,
      titulo: etiquetasCategoriaOperativa[categoria],
      descripcion: `Reportes clasificados como ${etiquetasCategoriaOperativa[categoria].toLowerCase()}.`,
      total: reportesGrupo.length,
      reportes: reportesGrupo
    };
  });
}

export function obtenerCargaTrabajoResponsables(reportes: Reporte[]): CargaTrabajoResponsable[] {
  const cargas = new Map<string, CargaTrabajoResponsable>();

  reportes.forEach((reporte) => {
    const responsableId = reporte.assignedTo?.id ?? 'SIN_RESPONSABLE';
    const cargaExistente = cargas.get(responsableId);

    const carga: CargaTrabajoResponsable =
      cargaExistente ??
      {
        responsable: reporte.assignedTo,
        responsableId: reporte.assignedTo?.id ?? null,
        nombreResponsable: obtenerNombreResponsableReporte(reporte),
        total: 0,
        pendientes: 0,
        enProceso: 0,
        resueltos: 0,
        rechazados: 0,
        altaPrioridad: 0
      };

    carga.total += 1;

    if (reporte.status === 'PENDIENTE') {
      carga.pendientes += 1;
    }

    if (reporte.status === 'EN_PROCESO') {
      carga.enProceso += 1;
    }

    if (reporte.status === 'RESUELTO') {
      carga.resueltos += 1;
    }

    if (reporte.status === 'RECHAZADO') {
      carga.rechazados += 1;
    }

    if (reporte.priority === 'ALTA') {
      carga.altaPrioridad += 1;
    }

    cargas.set(responsableId, carga);
  });

  return Array.from(cargas.values()).sort((cargaA, cargaB) => {
    if (cargaA.responsableId === null && cargaB.responsableId !== null) {
      return -1;
    }

    if (cargaA.responsableId !== null && cargaB.responsableId === null) {
      return 1;
    }

    return cargaB.total - cargaA.total;
  });
}