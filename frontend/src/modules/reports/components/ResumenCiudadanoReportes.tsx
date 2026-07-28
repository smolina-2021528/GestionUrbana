import { Boton } from '../../../shared/components/ui/Boton';
import { InsigniaEstado } from '../../../shared/components/ui/InsigniaEstado';
import { InsigniaPrioridad } from '../../../shared/components/ui/InsigniaPrioridad';
import { Tarjeta } from '../../../shared/components/ui/Tarjeta';
import type { EstadoReporte, PaginacionReportes, Reporte } from '../types/reportesTipos';
import './resumenCiudadanoReportes.css';

type PropiedadesResumenCiudadanoReportes = {
  reportes: Reporte[];
  paginacion?: PaginacionReportes;
  actualizando?: boolean;
  alCrearReporte: () => void;
  alVerNotificaciones: () => void;
  alActualizar: () => void;
  alVerDetalle: (reporte: Reporte) => void;
};

const etiquetasEstado: Record<EstadoReporte, string> = {
  PENDIENTE: 'Pendiente',
  EN_PROCESO: 'En proceso',
  RESUELTO: 'Resuelto',
  RECHAZADO: 'Rechazado'
};

const formateadorNumero = new Intl.NumberFormat('es-GT');

const formateadorFecha = new Intl.DateTimeFormat('es-GT', {
  dateStyle: 'medium',
  timeStyle: 'short'
});

function formatearNumero(valor: number) {
  return formateadorNumero.format(valor);
}

function formatearFecha(fecha: string | null | undefined) {
  if (!fecha) {
    return 'Fecha no disponible';
  }

  const fechaValida = new Date(fecha);

  if (Number.isNaN(fechaValida.getTime())) {
    return 'Fecha no disponible';
  }

  return formateadorFecha.format(fechaValida);
}

function obtenerConteoPorEstado(reportes: Reporte[]) {
  return reportes.reduce<Record<EstadoReporte, number>>(
    (conteo, reporte) => {
      conteo[reporte.status] = (conteo[reporte.status] ?? 0) + 1;
      return conteo;
    },
    {
      PENDIENTE: 0,
      EN_PROCESO: 0,
      RESUELTO: 0,
      RECHAZADO: 0
    }
  );
}

function obtenerUltimoReporteVisible(reportes: Reporte[]) {
  return [...reportes].sort((reporteA, reporteB) => {
    const fechaA = new Date(reporteA.updatedAt ?? reporteA.createdAt).getTime();
    const fechaB = new Date(reporteB.updatedAt ?? reporteB.createdAt).getTime();

    return fechaB - fechaA;
  })[0];
}

function obtenerMensajeEstado(reporte: Reporte) {
  if (reporte.status === 'PENDIENTE') {
    return 'Tu reporte fue recibido y está pendiente de revisión.';
  }

  if (reporte.status === 'EN_PROCESO') {
    return 'Tu reporte ya está siendo atendido.';
  }

  if (reporte.status === 'RESUELTO') {
    return 'Tu reporte fue marcado como resuelto.';
  }

  return 'Tu reporte fue cerrado como rechazado.';
}

export function ResumenCiudadanoReportes({
  reportes,
  paginacion,
  actualizando = false,
  alCrearReporte,
  alVerNotificaciones,
  alActualizar,
  alVerDetalle
}: PropiedadesResumenCiudadanoReportes) {
  const conteoPorEstado = obtenerConteoPorEstado(reportes);
  const ultimoReporte = obtenerUltimoReporteVisible(reportes);
  const totalReportes = paginacion?.total ?? reportes.length;
  const totalAbiertos = conteoPorEstado.PENDIENTE + conteoPorEstado.EN_PROCESO;
  const totalFinalizados = conteoPorEstado.RESUELTO + conteoPorEstado.RECHAZADO;

  return (
    <section className="resumenCiudadano" aria-label="Resumen ciudadano de reportes">
      <Tarjeta className="resumenCiudadano__bienvenida">
        <div className="resumenCiudadano__bienvenidaContenido">
          <div>
            <span className="resumenCiudadano__etiqueta">Inicio ciudadano</span>
            <h2>Gestiona tus reportes de forma sencilla</h2>
            <p>
              Desde aquí puedes crear un nuevo reporte, revisar el avance de tus casos y consultar
              las actualizaciones importantes.
            </p>
          </div>

          <div className="resumenCiudadano__acciones">
            <Boton onClick={alCrearReporte}>Crear reporte</Boton>
            <Boton variante="secundario" onClick={alVerNotificaciones}>
              Ver notificaciones
            </Boton>
            <Boton variante="fantasma" disabled={actualizando} onClick={alActualizar}>
              {actualizando ? 'Actualizando...' : 'Actualizar'}
            </Boton>
          </div>
        </div>
      </Tarjeta>

      <div className="resumenCiudadano__metricas">
        <Tarjeta className="resumenCiudadano__metrica">
          <span>Total enviados</span>
          <strong>{formatearNumero(totalReportes)}</strong>
          <p>Reportes que has registrado en la plataforma.</p>
        </Tarjeta>

        <Tarjeta className="resumenCiudadano__metrica">
          <span>En seguimiento</span>
          <strong>{formatearNumero(totalAbiertos)}</strong>
          <p>Casos pendientes o en proceso de atención.</p>
        </Tarjeta>

        <Tarjeta className="resumenCiudadano__metrica">
          <span>Finalizados</span>
          <strong>{formatearNumero(totalFinalizados)}</strong>
          <p>Reportes resueltos o cerrados por el equipo.</p>
        </Tarjeta>
      </div>

      <Tarjeta
        titulo="Estado de tus reportes visibles"
        descripcion="Resumen simple de los reportes cargados en esta página."
      >
        <div className="resumenCiudadano__estados">
          {Object.entries(conteoPorEstado).map(([estado, total]) => (
            <article className="resumenCiudadano__estado" key={estado}>
              <span>{etiquetasEstado[estado as EstadoReporte]}</span>
              <strong>{formatearNumero(total)}</strong>
            </article>
          ))}
        </div>
      </Tarjeta>

      {ultimoReporte ? (
        <Tarjeta
          titulo="Última actualización visible"
          descripcion="El reporte más reciente dentro del listado actual."
          acciones={
            <Boton variante="secundario" tamano="sm" onClick={() => alVerDetalle(ultimoReporte)}>
              Ver detalle
            </Boton>
          }
        >
          <article className="resumenCiudadano__ultimoReporte">
            <div>
              <span className="resumenCiudadano__categoria">{ultimoReporte.category}</span>
              <h3>{ultimoReporte.title}</h3>
              <p>{obtenerMensajeEstado(ultimoReporte)}</p>
            </div>

            <div className="resumenCiudadano__ultimoEstado">
              <InsigniaEstado estado={ultimoReporte.status} />
              <InsigniaPrioridad prioridad={ultimoReporte.priority} />
              <small>Actualizado el {formatearFecha(ultimoReporte.updatedAt)}</small>
            </div>
          </article>
        </Tarjeta>
      ) : null}
    </section>
  );
}