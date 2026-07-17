import { Navigate, Route, Routes } from 'react-router-dom';

import { LayoutPrincipal } from './layouts/LayoutPrincipal';
import {
  RutaProtegida,
  rolesAdministrador,
  rolesUsuarioAutenticado
} from './routes/RutaProtegida';
import { RutaPublica } from './routes/RutaPublica';
import {
  obtenerRutaInicioPorRoles,
  rutasAplicacion
} from '../config/constantesSistema';
import { LoginPagina } from '../modules/authentication/pages/LoginPagina';
import { RecuperarPasswordPagina } from '../modules/authentication/pages/RecuperarPasswordPagina';
import { RegistroPagina } from '../modules/authentication/pages/RegistroPagina';
import { RestablecerPasswordPagina } from '../modules/authentication/pages/RestablecerPasswordPagina';
import { VerificarCorreoPagina } from '../modules/authentication/pages/VerificarCorreoPagina';
import { usarAutenticacion } from '../modules/authentication/hooks/usarAutenticacion';
import { DashboardPagina } from '../modules/dashboard/pages/DashboardPagina';
import { NotificacionesPagina } from '../modules/notifications/pages/NotificacionesPagina';
import { PerfilPagina } from '../modules/profile/pages/PerfilPagina';
import { CrearReportePagina } from '../modules/reports/pages/CrearReportePagina';
import { MisReportesPagina } from '../modules/reports/pages/MisReportesPagina';
import { ReporteDetallePagina } from '../modules/reports/pages/ReporteDetallePagina';
import { ReportesPagina } from '../modules/reports/pages/ReportesPagina';
import { UsuariosPagina } from '../modules/users/pages/UsuariosPagina';
import { Cargando } from '../shared/components/feedback/Cargando';

function RedireccionInicial() {
  const { cargandoSesion, estaAutenticado, roles } = usarAutenticacion();

  if (cargandoSesion) {
    return (
      <main className="paginaTemporal">
        <Cargando texto="Validando sesión..." />
      </main>
    );
  }

  if (!estaAutenticado) {
    return <Navigate replace to={rutasAplicacion.login} />;
  }

  return <Navigate replace to={obtenerRutaInicioPorRoles(roles)} />;
}

export function RutasAplicacion() {
  return (
    <Routes>
      <Route path="/" element={<RedireccionInicial />} />

      <Route element={<RutaPublica />}>
        <Route path={rutasAplicacion.login} element={<LoginPagina />} />
        <Route path={rutasAplicacion.registro} element={<RegistroPagina />} />
        <Route path={rutasAplicacion.verificarCorreo} element={<VerificarCorreoPagina />} />
        <Route path="/verify-email" element={<VerificarCorreoPagina />} />
        <Route path={rutasAplicacion.recuperarPassword} element={<RecuperarPasswordPagina />} />
        <Route
          path={rutasAplicacion.restablecerPassword}
          element={<RestablecerPasswordPagina />}
        />
        <Route path="/reset-password" element={<RestablecerPasswordPagina />} />
      </Route>

      <Route element={<RutaProtegida rolesPermitidos={rolesUsuarioAutenticado} />}>
        <Route element={<LayoutPrincipal />}>
          <Route
            path={rutasAplicacion.dashboard}
            element={
              <RutaProtegida rolesPermitidos={rolesAdministrador}>
                <DashboardPagina />
              </RutaProtegida>
            }
          />

          <Route
            path={rutasAplicacion.reportes}
            element={
              <RutaProtegida rolesPermitidos={rolesAdministrador}>
                <ReportesPagina />
              </RutaProtegida>
            }
          />

          <Route path={`${rutasAplicacion.reportes}/:reporteId`} element={<ReporteDetallePagina />} />
          <Route path={rutasAplicacion.misReportes} element={<MisReportesPagina />} />
          <Route path={rutasAplicacion.crearReporte} element={<CrearReportePagina />} />
          <Route path={rutasAplicacion.notificaciones} element={<NotificacionesPagina />} />

          <Route
            path={rutasAplicacion.usuarios}
            element={
              <RutaProtegida rolesPermitidos={rolesAdministrador}>
                <UsuariosPagina />
              </RutaProtegida>
            }
          />

          <Route path={rutasAplicacion.perfil} element={<PerfilPagina />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate replace to="/" />} />
    </Routes>
  );
}