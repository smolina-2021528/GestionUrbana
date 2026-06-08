import { Navigate, NavLink, Route, Routes, useLocation } from 'react-router-dom';

import { marcaCiudadActiva } from '../design/identity/marca';
import { textosSistema } from '../design/identity/textosSistema';
import { LoginPagina } from '../modules/authentication/pages/LoginPagina';
import { RegistroPagina } from '../modules/authentication/pages/RegistroPagina';
import { DashboardPagina } from '../modules/dashboard/pages/DashboardPagina';
import { NotificacionesPagina } from '../modules/notifications/pages/NotificacionesPagina';
import { PerfilPagina } from '../modules/profile/pages/PerfilPagina';
import { CrearReportePagina } from '../modules/reports/pages/CrearReportePagina';
import { MisReportesPagina } from '../modules/reports/pages/MisReportesPagina';
import { ReportesMapaPagina } from '../modules/reports/pages/ReportesMapaPagina';
import { UsuariosPagina } from '../modules/users/pages/UsuariosPagina';

const rutasAutenticacion = ['/login', '/registro'] as const;

const enlacesTemporales = [
  {
    ruta: '/login',
    etiqueta: 'Ingresar'
  },
  {
    ruta: '/registro',
    etiqueta: 'Registro'
  },
  {
    ruta: '/dashboard',
    etiqueta: textosSistema.navegacion.dashboard
  },
  {
    ruta: '/reportes',
    etiqueta: textosSistema.navegacion.reportes
  },
  {
    ruta: '/mis-reportes',
    etiqueta: textosSistema.navegacion.misReportes
  },
  {
    ruta: '/reportes/crear',
    etiqueta: textosSistema.navegacion.crearReporte
  },
  {
    ruta: '/notificaciones',
    etiqueta: textosSistema.navegacion.notificaciones
  },
  {
    ruta: '/usuarios',
    etiqueta: textosSistema.navegacion.usuarios
  },
  {
    ruta: '/perfil',
    etiqueta: textosSistema.navegacion.perfil
  }
] as const;

function NavegacionTemporal() {
  return (
    <header className="navegacionTemporal">
      <div className="navegacionTemporal__marca">
        <img
          className="navegacionTemporal__logo"
          src={marcaCiudadActiva.rutaLogo}
          alt={marcaCiudadActiva.textoAlternativoLogo}
        />
        <div>
          <strong>{marcaCiudadActiva.nombre}</strong>
          <span>Rutas base del Sprint 1</span>
        </div>
      </div>

      <nav className="navegacionTemporal__enlaces" aria-label="Navegación temporal del sprint">
        {enlacesTemporales.map((enlace) => (
          <NavLink
            key={enlace.ruta}
            className={({ isActive }) =>
              isActive ? 'navegacionTemporal__enlace activo' : 'navegacionTemporal__enlace'
            }
            to={enlace.ruta}
          >
            {enlace.etiqueta}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}

export function RutasAplicacion() {
  const ubicacion = useLocation();
  const esRutaAutenticacion = rutasAutenticacion.some((ruta) => ruta === ubicacion.pathname);

  return (
    <>
      {!esRutaAutenticacion ? <NavegacionTemporal /> : null}

      <Routes>
        <Route path="/" element={<Navigate replace to="/dashboard" />} />
        <Route path="/login" element={<LoginPagina />} />
        <Route path="/registro" element={<RegistroPagina />} />
        <Route path="/dashboard" element={<DashboardPagina />} />
        <Route path="/reportes" element={<ReportesMapaPagina />} />
        <Route path="/mis-reportes" element={<MisReportesPagina />} />
        <Route path="/reportes/crear" element={<CrearReportePagina />} />
        <Route path="/notificaciones" element={<NotificacionesPagina />} />
        <Route path="/usuarios" element={<UsuariosPagina />} />
        <Route path="/perfil" element={<PerfilPagina />} />
        <Route path="*" element={<Navigate replace to="/dashboard" />} />
      </Routes>
    </>
  );
}