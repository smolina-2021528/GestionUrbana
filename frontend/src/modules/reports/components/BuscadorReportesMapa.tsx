import type { FormEvent } from 'react';

import { EstadoVacio } from '../../../shared/components/data/EstadoVacio';
import { Alerta } from '../../../shared/components/feedback/Alerta';
import { Cargando } from '../../../shared/components/feedback/Cargando';
import { Boton } from '../../../shared/components/ui/Boton';
import {
  limitesGeograficosReportes,
  type CategoriaReporte
} from '../types/reportesTipos';
import type { ReporteMapaVisual } from './MarcadorReporte';
import './buscadorReportesMapa.css';

type PropiedadesBuscadorReportesMapa = {
  texto: string;
  busquedaAplicada?: string;
  reportes: ReporteMapaVisual[];
  total?: number;
  bloqueado?: boolean;
  estaCargando?: boolean;
  tieneError?: boolean;
  mensajeError?: string;
  alCambiarTexto: (texto: string) => void;
  alBuscar: () => void;
  alLimpiar: () => void;
  alSeleccionarReporte?: (reporte: ReporteMapaVisual) => void;
  alVerDetalle?: (reporte: ReporteMapaVisual) => void;
  alReintentar?: () => void;
};

const etiquetasCategoria: Record<CategoriaReporte, string> = {
  INFRAESTRUCTURA: 'Infraestructura',
  SEGURIDAD: 'Seguridad',
  LIMPIEZA: 'Limpieza'
};

function obtenerCategoria(categoria: CategoriaReporte) {
  return etiquetasCategoria[categoria] ?? categoria;
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

function formatearFecha(fecha: string) {
  const fechaValida = new Date(fecha);

  if (Number.isNaN(fechaValida.getTime())) {
    return 'Fecha no disponible';
  }

  return new Intl.DateTimeFormat('es-GT', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(fechaValida);
}

export function BuscadorReportesMapa({
  texto,
  busquedaAplicada,
  reportes,
  total,
  bloqueado = false,
  estaCargando = false,
  tieneError = false,
  mensajeError = 'No fue posible realizar la búsqueda territorial.',
  alCambiarTexto,
  alBuscar,
  alLimpiar,
  alSeleccionarReporte,
  alVerDetalle,
  alReintentar
}: PropiedadesBuscadorReportesMapa) {
  const textoLimpio = texto.trim();
  const busquedaActiva = Boolean(busquedaAplicada && busquedaAplicada.trim().length > 0);
  const busquedaValida =
    textoLimpio.length >= limitesGeograficosReportes.minimoCaracteresBusqueda;
  const totalResultados = total ?? reportes.length;
  const reportesVisibles = reportes.slice(0, 6);
  const resultadosRestantes = Math.max(totalResultados - reportesVisibles.length, 0);

  const buscar = (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();

    if (!busquedaValida || bloqueado) {
      return;
    }

    alBuscar();
  };

  return (
    <section className="buscadorReportesMapa" aria-label="Búsqueda territorial de reportes">
      <header className="buscadorReportesMapa__encabezado">
        <div>
          <p className="buscadorReportesMapa__eyebrow">Búsqueda territorial</p>
          <h2>Buscar incidencias</h2>
          <p>
            Busca reportes por título, descripción o información disponible y visualiza los
            resultados dentro del mapa territorial.
          </p>
        </div>

        {busquedaActiva ? (
          <span className="buscadorReportesMapa__contador">
            {new Intl.NumberFormat('es-GT').format(totalResultados)} resultados
          </span>
        ) : null}
      </header>

      <form className="buscadorReportesMapa__formulario" onSubmit={buscar}>
        <label className="buscadorReportesMapa__campo">
          <span>Texto de búsqueda</span>
          <input
            type="search"
            value={texto}
            disabled={bloqueado}
            placeholder="Ejemplo: bache, basura, iluminación..."
            onChange={(evento) => alCambiarTexto(evento.target.value)}
          />
        </label>

        <div className="buscadorReportesMapa__acciones">
          <Boton
            type="button"
            variante="secundario"
            disabled={bloqueado || (!busquedaActiva && texto.length === 0)}
            onClick={alLimpiar}
          >
            Limpiar
          </Boton>

          <Boton type="submit" disabled={bloqueado || !busquedaValida}>
            Buscar
          </Boton>
        </div>
      </form>

      {!busquedaValida && texto.length > 0 ? (
        <p className="buscadorReportesMapa__ayuda">
          Ingresa al menos {limitesGeograficosReportes.minimoCaracteresBusqueda} caracteres para
          buscar reportes.
        </p>
      ) : null}

      {busquedaActiva ? (
        <p className="buscadorReportesMapa__busquedaAplicada">
          Búsqueda aplicada: <strong>{busquedaAplicada}</strong>
        </p>
      ) : null}

      {estaCargando ? <Cargando texto="Buscando reportes..." /> : null}

      {tieneError ? (
        <Alerta variante="error" titulo="No se pudo completar la búsqueda">
          <div className="buscadorReportesMapa__alerta">
            <p>{mensajeError}</p>
            {alReintentar ? (
              <Boton variante="secundario" tamano="sm" onClick={alReintentar}>
                Reintentar
              </Boton>
            ) : null}
          </div>
        </Alerta>
      ) : null}

      {!estaCargando && !tieneError && busquedaActiva ? (
        reportesVisibles.length > 0 ? (
          <div className="buscadorReportesMapa__resultados">
            {reportesVisibles.map((reporte) => (
              <article key={reporte.id} className="buscadorReportesMapa__resultado">
                <button
                  type="button"
                  className="buscadorReportesMapa__selector"
                  onClick={() => alSeleccionarReporte?.(reporte)}
                >
                  <span className="buscadorReportesMapa__categoria">
                    {obtenerCategoria(reporte.category)}
                  </span>

                  <strong>{reporte.title}</strong>

                  <span>{obtenerUbicacion(reporte)}</span>

                  <small>Creado el {formatearFecha(reporte.createdAt)}</small>
                </button>

                {alVerDetalle ? (
                  <div className="buscadorReportesMapa__detalle">
                    <Boton variante="fantasma" tamano="sm" onClick={() => alVerDetalle(reporte)}>
                      Ver detalle
                    </Boton>
                  </div>
                ) : null}
              </article>
            ))}

            {resultadosRestantes > 0 ? (
              <p className="buscadorReportesMapa__resumen">
                Hay {new Intl.NumberFormat('es-GT').format(resultadosRestantes)} resultados
                adicionales para esta búsqueda.
              </p>
            ) : null}
          </div>
        ) : (
          <EstadoVacio
            titulo="Sin resultados para esta búsqueda"
            descripcion="Prueba con otro término o revisa la consulta territorial por coordenadas."
          />
        )
      ) : null}
    </section>
  );
}