import { Boton } from '../../../shared/components/ui/Boton';
import { InsigniaEstado } from '../../../shared/components/ui/InsigniaEstado';
import { InsigniaPrioridad } from '../../../shared/components/ui/InsigniaPrioridad';
import { Tarjeta } from '../../../shared/components/ui/Tarjeta';
import type {
  CategoriaReporte,
  Reporte,
  UsuarioResumenReporte
} from '../types/reportesTipos';
import {
  type ImagenReporteVisible,
  obtenerImagenesVisiblesReporte
} from '../utils/imagenesReporte';
import './reportesComponentes.css';

type PropiedadesDetalleReporte = {
  reporte: Reporte;
  alVolver?: () => void;
  alActualizar?: () => void;
  actualizando?: boolean;
};

const etiquetasCategoria: Record<CategoriaReporte, string> = {
  INFRAESTRUCTURA: 'Infraestructura',
  SEGURIDAD: 'Seguridad',
  LIMPIEZA: 'Limpieza'
};

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

function obtenerNombreUsuario(usuario: UsuarioResumenReporte | null) {
  if (!usuario) {
    return 'Sin asignar';
  }

  const nombreCompleto = [usuario.name, usuario.surname].filter(Boolean).join(' ').trim();

  return nombreCompleto || usuario.username || 'Usuario';
}

function obtenerCategoria(categoria: CategoriaReporte) {
  return etiquetasCategoria[categoria] ?? categoria;
}

function GaleriaEvidencia({
  imagenes,
  titulo
}: {
  imagenes: ImagenReporteVisible[];
  titulo: string;
}) {
  if (imagenes.length === 0) {
    return (
      <div className="detalleReporte__sinEvidencia">
        <span>Sin evidencia visual registrada</span>
      </div>
    );
  }

  return (
    <div className="detalleReporte__galeria">
      {imagenes.map((imagen, indice) => (
        <a
          className="detalleReporte__imagen"
          href={imagen.url}
          target="_blank"
          rel="noreferrer"
          key={imagen.id}
        >
          <img src={imagen.url} alt={`Evidencia ${indice + 1} de ${titulo}`} loading="lazy" />
        </a>
      ))}
    </div>
  );
}

export function DetalleReporte({
  reporte,
  alVolver,
  alActualizar,
  actualizando = false
}: PropiedadesDetalleReporte) {
  const categoria = obtenerCategoria(reporte.category);
  const imagenesVisibles = obtenerImagenesVisiblesReporte(reporte);

  return (
    <article className="detalleReporte">
      <Tarjeta className="detalleReporte__hero">
        <div className="detalleReporte__heroContenido">
          <div>
            <span className="detalleReporte__categoria">{categoria}</span>
            <h1>{reporte.title}</h1>
            <p>{reporte.description}</p>

            <div className="detalleReporte__insignias">
              <InsigniaEstado estado={reporte.status} />
              <InsigniaPrioridad prioridad={reporte.priority} />
            </div>
          </div>

          <div className="detalleReporte__acciones">
            {alVolver ? (
              <Boton variante="secundario" onClick={alVolver}>
                Volver
              </Boton>
            ) : null}

            {alActualizar ? (
              <Boton variante="secundario" disabled={actualizando} onClick={alActualizar}>
                Actualizar
              </Boton>
            ) : null}
          </div>
        </div>
      </Tarjeta>

      <section className="detalleReporte__gridPrincipal">
        <Tarjeta titulo="Información general" descripcion="Datos principales del reporte urbano.">
          <div className="detalleReporte__listaDatos">
            <div className="detalleReporte__dato">
              <span>Estado</span>
              <strong>{reporte.status.replaceAll('_', ' ')}</strong>
            </div>

            <div className="detalleReporte__dato">
              <span>Prioridad</span>
              <strong>{reporte.priority}</strong>
            </div>

            <div className="detalleReporte__dato">
              <span>Categoría</span>
              <strong>{categoria}</strong>
            </div>

            <div className="detalleReporte__dato">
              <span>Creado</span>
              <strong>{formatearFecha(reporte.createdAt)}</strong>
            </div>

            <div className="detalleReporte__dato">
              <span>Última actualización</span>
              <strong>{formatearFecha(reporte.updatedAt)}</strong>
            </div>

            <div className="detalleReporte__dato">
              <span>Resuelto</span>
              <strong>{formatearFecha(reporte.resolvedAt)}</strong>
            </div>
          </div>
        </Tarjeta>

        <Tarjeta titulo="Personas relacionadas" descripcion="Ciudadano y responsable asignado.">
          <div className="detalleReporte__listaDatos">
            <div className="detalleReporte__dato">
              <span>Ciudadano</span>
              <strong>{obtenerNombreUsuario(reporte.citizen)}</strong>
            </div>

            <div className="detalleReporte__dato">
              <span>Responsable</span>
              <strong>{obtenerNombreUsuario(reporte.assignedTo)}</strong>
            </div>
          </div>
        </Tarjeta>
      </section>

      <Tarjeta
        titulo="Evidencia visual"
        descripcion="Imágenes registradas por el ciudadano para documentar la incidencia."
      >
        <GaleriaEvidencia imagenes={imagenesVisibles} titulo={reporte.title} />
      </Tarjeta>
    </article>
  );
}