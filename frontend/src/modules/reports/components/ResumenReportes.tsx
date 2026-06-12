import { Tarjeta } from '../../../shared/components/ui/Tarjeta';
import type { CategoriaReporte, EstadoReporte, PaginacionReportes, Reporte } from '../types/reportesTipos';
import './reportesComponentes.css';

type PropiedadesResumenReportes = {
  reportes: Reporte[];
  paginacion?: PaginacionReportes;
};

type IndicadorResumen = {
  id: string;
  etiqueta: string;
  valor: number;
  descripcion: string;
};

function formatearNumero(valor: number) {
  return new Intl.NumberFormat('es-GT').format(valor);
}

function contarPorEstado(reportes: Reporte[], estado: EstadoReporte) {
  return reportes.filter((reporte) => reporte.status === estado).length;
}

function contarPorCategoria(reportes: Reporte[], categoria: CategoriaReporte) {
  return reportes.filter((reporte) => reporte.category === categoria).length;
}

export function ResumenReportes({ reportes, paginacion }: PropiedadesResumenReportes) {
  const totalListado = paginacion?.total ?? reportes.length;

  const indicadores: IndicadorResumen[] = [
    {
      id: 'total',
      etiqueta: 'Total',
      valor: totalListado,
      descripcion: 'Reportes encontrados con los filtros actuales.'
    },
    {
      id: 'pendientes',
      etiqueta: 'Pendientes',
      valor: contarPorEstado(reportes, 'PENDIENTE'),
      descripcion: 'Casos pendientes dentro de la página actual.'
    },
    {
      id: 'en-proceso',
      etiqueta: 'En proceso',
      valor: contarPorEstado(reportes, 'EN_PROCESO'),
      descripcion: 'Reportes en atención dentro de la página actual.'
    },
    {
      id: 'resueltos',
      etiqueta: 'Resueltos',
      valor: contarPorEstado(reportes, 'RESUELTO'),
      descripcion: 'Casos resueltos dentro de la página actual.'
    },
    {
      id: 'infraestructura',
      etiqueta: 'Infraestructura',
      valor: contarPorCategoria(reportes, 'INFRAESTRUCTURA'),
      descripcion: 'Reportes de infraestructura visibles.'
    },
    {
      id: 'seguridad',
      etiqueta: 'Seguridad',
      valor: contarPorCategoria(reportes, 'SEGURIDAD'),
      descripcion: 'Reportes de seguridad visibles.'
    },
    {
      id: 'limpieza',
      etiqueta: 'Limpieza',
      valor: contarPorCategoria(reportes, 'LIMPIEZA'),
      descripcion: 'Reportes de limpieza visibles.'
    },
    {
      id: 'con-ubicacion',
      etiqueta: 'Con ubicación',
      valor: reportes.filter((reporte) => reporte.hasLocation).length,
      descripcion: 'Casos visibles con información geográfica.'
    }
  ];

  return (
    <Tarjeta
      titulo="Resumen de reportes"
      descripcion="Indicadores rápidos del listado actualmente visible."
    >
      <section className="resumenReportes" aria-label="Resumen del listado de reportes">
        <div className="resumenReportes__grid">
          {indicadores.map((indicador) => (
            <article className="resumenReportes__item" key={indicador.id}>
              <span className="resumenReportes__etiqueta">{indicador.etiqueta}</span>
              <strong className="resumenReportes__valor">
                {formatearNumero(indicador.valor)}
              </strong>
              <p className="resumenReportes__descripcion">{indicador.descripcion}</p>
            </article>
          ))}
        </div>
      </section>
    </Tarjeta>
  );
}