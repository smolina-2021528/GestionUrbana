import { Boton } from '../../../shared/components/ui/Boton';
import { InsigniaEstado } from '../../../shared/components/ui/InsigniaEstado';
import { InsigniaPrioridad } from '../../../shared/components/ui/InsigniaPrioridad';
import { Tarjeta } from '../../../shared/components/ui/Tarjeta';
import type {
  AnalisisIAReporte,
  CategoriaReporte,
  ImagenReporte,
  Reporte,
  UsuarioResumenReporte
} from '../types/reportesTipos';
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

function formatearCoordenada(valor: number) {
  return new Intl.NumberFormat('es-GT', {
    maximumFractionDigits: 6
  }).format(valor);
}

function formatearPorcentaje(valor: number | null | undefined) {
  if (typeof valor !== 'number' || !Number.isFinite(valor)) {
    return 'No disponible';
  }

  return `${new Intl.NumberFormat('es-GT', {
    maximumFractionDigits: 1
  }).format(valor * 100)}%`;
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

function obtenerUbicacion(reporte: Reporte) {
  if (reporte.address) {
    return reporte.address;
  }

  if (typeof reporte.latitude === 'number' && typeof reporte.longitude === 'number') {
    return `${formatearCoordenada(reporte.latitude)}, ${formatearCoordenada(reporte.longitude)}`;
  }

  return 'Sin ubicación registrada';
}

function obtenerCoordenadas(reporte: Reporte) {
  if (typeof reporte.latitude === 'number' && typeof reporte.longitude === 'number') {
    return `${formatearCoordenada(reporte.latitude)}, ${formatearCoordenada(reporte.longitude)}`;
  }

  return 'No disponibles';
}

function obtenerEstadoIA(analisis: AnalisisIAReporte | null) {
  if (!analisis) {
    return 'Sin análisis registrado';
  }

  switch (analisis.status) {
    case 'PENDING':
      return 'Pendiente';
    case 'OK':
      return 'Procesado';
    case 'FAILED':
      return 'Fallido';
    default:
      return analisis.status;
  }
}

function obtenerTextoSeguro(valor: string | null | undefined, respaldo = 'No disponible') {
  if (!valor) {
    return respaldo;
  }

  return valor;
}

function GaleriaEvidencia({ imagenes, titulo }: { imagenes: ImagenReporte[]; titulo: string }) {
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
  const ubicacion = obtenerUbicacion(reporte);
  const coordenadas = obtenerCoordenadas(reporte);
  const categoria = obtenerCategoria(reporte.category);
  const analisisIA = reporte.ai;

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

        <Tarjeta titulo="Ubicación" descripcion="Referencia territorial registrada para el caso.">
          <div className="detalleReporte__listaDatos">
            <div className="detalleReporte__dato detalleReporte__dato--ancho">
              <span>Dirección o referencia</span>
              <strong>{ubicacion}</strong>
            </div>

            <div className="detalleReporte__dato">
              <span>Coordenadas</span>
              <strong>{coordenadas}</strong>
            </div>

            <div className="detalleReporte__dato">
              <span>Información geográfica</span>
              <strong>{reporte.hasLocation ? 'Registrada' : 'No registrada'}</strong>
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

        <Tarjeta titulo="Análisis asistido" descripcion="Resultado del análisis registrado para el reporte.">
          <div className="detalleReporte__listaDatos">
            <div className="detalleReporte__dato">
              <span>Estado del análisis</span>
              <strong>{obtenerEstadoIA(analisisIA)}</strong>
            </div>

            <div className="detalleReporte__dato">
              <span>Categoría sugerida</span>
              <strong>{obtenerTextoSeguro(analisisIA?.category)}</strong>
            </div>

            <div className="detalleReporte__dato">
              <span>Prioridad sugerida</span>
              <strong>{obtenerTextoSeguro(analisisIA?.priority)}</strong>
            </div>

            <div className="detalleReporte__dato">
              <span>Confianza</span>
              <strong>{formatearPorcentaje(analisisIA?.confidence)}</strong>
            </div>

            <div className="detalleReporte__dato detalleReporte__dato--ancho">
              <span>Razonamiento</span>
              <strong>{obtenerTextoSeguro(analisisIA?.reasoning)}</strong>
            </div>

            <div className="detalleReporte__dato">
              <span>Procesado</span>
              <strong>{formatearFecha(analisisIA?.processedAt)}</strong>
            </div>
          </div>
        </Tarjeta>
      </section>

      <Tarjeta
        titulo="Evidencia visual"
        descripcion="Imágenes registradas por el ciudadano para documentar la incidencia."
      >
        <GaleriaEvidencia imagenes={reporte.images} titulo={reporte.title} />
      </Tarjeta>
    </article>
  );
}