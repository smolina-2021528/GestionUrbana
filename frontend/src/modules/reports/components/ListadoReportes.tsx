import type { ReactNode } from 'react';

import { EstadoVacio } from '../../../shared/components/data/EstadoVacio';
import { Alerta } from '../../../shared/components/feedback/Alerta';
import { Cargando } from '../../../shared/components/feedback/Cargando';
import { Boton } from '../../../shared/components/ui/Boton';
import { Tarjeta } from '../../../shared/components/ui/Tarjeta';
import type { PaginacionReportes, Reporte } from '../types/reportesTipos';
import { TarjetaReporte } from './TarjetaReporte';
import './reportesComponentes.css';

type PropiedadesListadoReportes = {
  reportes: Reporte[];
  cargando?: boolean;
  mensajeError?: string;
  paginacion?: PaginacionReportes;
  mostrarCiudadano?: boolean;
  mostrarAsignado?: boolean;
  compacto?: boolean;
  tituloVacio?: string;
  descripcionVacia?: string;
  accionVacia?: ReactNode;
  alActualizar?: () => void;
  alVerDetalle?: (reporte: Reporte) => void;
};

const formateadorNumero = new Intl.NumberFormat('es-GT');

function formatearNumero(valor: number) {
  return formateadorNumero.format(valor);
}

export function ListadoReportes({
  reportes,
  cargando = false,
  mensajeError,
  paginacion,
  mostrarCiudadano = false,
  mostrarAsignado = true,
  compacto = false,
  tituloVacio = 'Sin reportes registrados',
  descripcionVacia = 'Cuando existan reportes urbanos, se mostrarán en este listado.',
  accionVacia,
  alActualizar,
  alVerDetalle
}: PropiedadesListadoReportes) {
  const tieneReportes = reportes.length > 0;
  const totalReportes = paginacion?.total ?? reportes.length;

  if (cargando) {
    return (
      <Tarjeta className="listadoReportes__estado">
        <Cargando texto="Cargando reportes urbanos..." />
      </Tarjeta>
    );
  }

  if (mensajeError && !tieneReportes) {
    return (
      <Alerta variante="error" titulo="No se pudieron cargar los reportes">
        <div className="listadoReportes__alertaContenido">
          <p>{mensajeError}</p>

          {alActualizar ? (
            <Boton variante="secundario" onClick={alActualizar}>
              Reintentar
            </Boton>
          ) : null}
        </div>
      </Alerta>
    );
  }

  if (!tieneReportes) {
    return (
      <EstadoVacio
        titulo={tituloVacio}
        descripcion={descripcionVacia}
        accion={
          accionVacia ??
          (alActualizar ? (
            <Boton variante="secundario" onClick={alActualizar}>
              Actualizar reportes
            </Boton>
          ) : undefined)
        }
      />
    );
  }

  return (
    <section className="listadoReportes" aria-label="Listado de reportes urbanos">
      {mensajeError ? (
        <Alerta variante="advertencia" titulo="Los datos mostrados pueden no estar actualizados">
          <p>{mensajeError}</p>
        </Alerta>
      ) : null}

      <div className="listadoReportes__lista">
        {reportes.map((reporte) => (
          <TarjetaReporte
            key={reporte.id}
            reporte={reporte}
            compacto={compacto}
            mostrarCiudadano={mostrarCiudadano}
            mostrarAsignado={mostrarAsignado}
            alVerDetalle={alVerDetalle}
          />
        ))}
      </div>

      <footer className="listadoReportes__pie">
        <span>{formatearNumero(totalReportes)} reportes encontrados</span>

        {paginacion ? (
          <span>
            Página {formatearNumero(paginacion.page)} de {formatearNumero(paginacion.totalPages)}
          </span>
        ) : null}
      </footer>
    </section>
  );
}