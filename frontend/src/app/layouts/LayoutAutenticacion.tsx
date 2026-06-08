import type { ReactNode } from 'react';

import { marcaCiudadActiva } from '../../design/identity/marca';
import './layoutAutenticacion.css';

type PropiedadesLayoutAutenticacion = {
  titulo: string;
  descripcion: string;
  children: ReactNode;
};

export function LayoutAutenticacion({
  titulo,
  descripcion,
  children
}: PropiedadesLayoutAutenticacion) {
  return (
    <main className="layoutAutenticacion">
      <section className="layoutAutenticacion__panelMarca">
        <div className="layoutAutenticacion__marca">
          <img
            className="layoutAutenticacion__logo"
            src={marcaCiudadActiva.rutaLogo}
            alt={marcaCiudadActiva.textoAlternativoLogo}
          />

          <p className="layoutAutenticacion__conceptoPrincipal">
            {marcaCiudadActiva.conceptoCentral}
          </p>
        </div>

        <div className="layoutAutenticacion__bloqueConcepto">
          <h2>Gestión ciudadana clara, ordenada y accionable</h2>
          <p>
            Ciudad Activa permite centralizar reportes urbanos, dar seguimiento a cada caso y
            facilitar la atención operativa según prioridad, estado y ubicación.
          </p>
        </div>

        <div className="layoutAutenticacion__puntos">
          <article>
            <strong>Reportar</strong>
            <span>Ciudadanos registran problemas urbanos de forma guiada.</span>
          </article>

          <article>
            <strong>Visualizar</strong>
            <span>Equipos autorizados consultan incidencias y zonas críticas.</span>
          </article>

          <article>
            <strong>Actuar</strong>
            <span>Administradores asignan responsables y actualizan estados.</span>
          </article>
        </div>
      </section>

      <section className="layoutAutenticacion__panelFormulario" aria-label={titulo}>
        <div className="layoutAutenticacion__encabezadoMovil">
          <img
            className="layoutAutenticacion__logoMovil"
            src={marcaCiudadActiva.rutaLogo}
            alt={marcaCiudadActiva.textoAlternativoLogo}
          />
        </div>

        <div className="layoutAutenticacion__tarjeta">
          <header className="layoutAutenticacion__encabezado">
            <h2>{titulo}</h2>
            <p>{descripcion}</p>
          </header>

          {children}
        </div>
      </section>
    </main>
  );
}