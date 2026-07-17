import type { ReactNode } from 'react';

import { Boton } from '../../../shared/components/ui/Boton';
import { InsigniaEstado } from '../../../shared/components/ui/InsigniaEstado';
import { InsigniaPrioridad } from '../../../shared/components/ui/InsigniaPrioridad';
import { Tarjeta } from '../../../shared/components/ui/Tarjeta';
import type { CategoriaReporte, Reporte, UsuarioResumenReporte } from '../types/reportesTipos';
import {
  obtenerImagenPrincipalReporte,
  obtenerImagenesVisiblesReporte
} from '../utils/imagenesReporte';
import './reportesComponentes.css';

type PropiedadesTarjetaReporte = {
  reporte: Reporte;
  acciones?: ReactNode;
  compacto?: boolean;
  mostrarCiudadano?: boolean;
  mostrarAsignado?: boolean;
  alVerDetalle?: (reporte: Reporte) => void;
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

function formatearCoordenada(valor: number) {
  return new Intl.NumberFormat('es-GT', {
    maximumFractionDigits: 5
  }).format(valor);
}

function obtenerNombreUsuario(usuario: UsuarioResumenReporte | null) {
  if (!usuario) {
    return 'Sin asignar';
  }

  const nombreCompleto = [usuario.name, usuario.surname].filter(Boolean).join(' ').trim();

  return nombreCompleto || usuario.username || 'Usuario';
}

function obtenerUbicacion(reporte: Reporte) {
  if (reporte.address) {
    return reporte.address;
  }

  if (typeof reporte.latitude === 'number' && typeof reporte.longitude === 'number') {
    return `${formatearCoordenada(reporte.latitude)}, ${formatearCoordenada(reporte.longitude)}`;
  }

  return 'Sin ubicación registrada';
}

function obtenerClaseTarjeta(compacto: boolean) {
  return compacto ? 'tarjetaReporte tarjetaReporte--compacta' : 'tarjetaReporte';
}

export function TarjetaReporte({
  reporte,
  acciones,
  compacto = false,
  mostrarCiudadano = false,
  mostrarAsignado = true,
  alVerDetalle
}: PropiedadesTarjetaReporte) {
  const imagenPrincipal = obtenerImagenPrincipalReporte(reporte);
  const totalImagenes = obtenerImagenesVisiblesReporte(reporte).length;
  const categoria = etiquetasCategoria[reporte.category] ?? reporte.category;
  const fechaCreacion = formatearFecha(reporte.createdAt);
  const ubicacion = obtenerUbicacion(reporte);

  const accionesTarjeta =
    acciones ??
    (alVerDetalle ? (
      <Boton variante="secundario" tamano="sm" onClick={() => alVerDetalle(reporte)}>
        Ver detalle
      </Boton>
    ) : null);

  return (
    <Tarjeta className={obtenerClaseTarjeta(compacto)} aria-label={`Reporte: ${reporte.title}`}>
      <article className="tarjetaReporte__contenido">
        <div className="tarjetaReporte__principal">
          <header className="tarjetaReporte__encabezado">
            <div className="tarjetaReporte__tituloGrupo">
              <span className="tarjetaReporte__categoria">{categoria}</span>
              <h2 className="tarjetaReporte__titulo">{reporte.title}</h2>
              <p className="tarjetaReporte__descripcion">{reporte.description}</p>
            </div>

            <div className="tarjetaReporte__insignias">
              <InsigniaEstado estado={reporte.status} />
              <InsigniaPrioridad prioridad={reporte.priority} />
            </div>
          </header>

          <div className="tarjetaReporte__meta">
            <div className="tarjetaReporte__dato">
              <span>Ubicación</span>
              <strong title={ubicacion}>{ubicacion}</strong>
            </div>

            {mostrarCiudadano ? (
              <div className="tarjetaReporte__dato">
                <span>Ciudadano</span>
                <strong title={obtenerNombreUsuario(reporte.citizen)}>
                  {obtenerNombreUsuario(reporte.citizen)}
                </strong>
              </div>
            ) : null}

            {mostrarAsignado ? (
              <div className="tarjetaReporte__dato">
                <span>Responsable</span>
                <strong title={obtenerNombreUsuario(reporte.assignedTo)}>
                  {obtenerNombreUsuario(reporte.assignedTo)}
                </strong>
              </div>
            ) : null}

            <div className="tarjetaReporte__dato">
              <span>Actualización</span>
              <strong title={formatearFecha(reporte.updatedAt)}>
                {formatearFecha(reporte.updatedAt)}
              </strong>
            </div>
          </div>

          <footer className="tarjetaReporte__acciones">
            <span className="tarjetaReporte__fecha">Creado el {fechaCreacion}</span>
            {accionesTarjeta ? <div>{accionesTarjeta}</div> : null}
          </footer>
        </div>

        {!compacto ? (
          <aside className="tarjetaReporte__evidencia" aria-label="Evidencia del reporte">
            {imagenPrincipal ? (
              <>
                <img src={imagenPrincipal.url} alt={`Evidencia de ${reporte.title}`} loading="lazy" />

                {totalImagenes > 1 ? (
                  <span className="tarjetaReporte__contadorImagenes">
                    {totalImagenes} imágenes
                  </span>
                ) : null}
              </>
            ) : (
              <div className="tarjetaReporte__sinImagen">Sin evidencia visual registrada</div>
            )}
          </aside>
        ) : null}
      </article>
    </Tarjeta>
  );
}