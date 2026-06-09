import { Navigate, Route, Routes } from 'react-router-dom';

import { LayoutPrincipal } from './layouts/LayoutPrincipal';
import { rutasAplicacion } from '../config/constantesSistema';
import { LoginPagina } from '../modules/authentication/pages/LoginPagina';
import { RegistroPagina } from '../modules/authentication/pages/RegistroPagina';
import { DashboardPagina } from '../modules/dashboard/pages/DashboardPagina';
import { NotificacionesPagina } from '../modules/notifications/pages/NotificacionesPagina';
import { PerfilPagina } from '../modules/profile/pages/PerfilPagina';
import { CrearReportePagina } from '../modules/reports/pages/CrearReportePagina';
import { MisReportesPagina } from '../modules/reports/pages/MisReportesPagina';
import { ReportesMapaPagina } from '../modules/reports/pages/ReportesMapaPagina';
import { UsuariosPagina } from '../modules/users/pages/UsuariosPagina';

export function RutasAplicacion() {
  return (
    <Routes>
      <Route path="/" element={<Navigate replace to={rutasAplicacion.dashboard} />} />

      <Route path={rutasAplicacion.login} element={<LoginPagina />} />
      <Route path={rutasAplicacion.registro} element={<RegistroPagina />} />

      <Route element={<LayoutPrincipal />}>
        <Route path={rutasAplicacion.dashboard} element={<DashboardPagina />} />
        <Route path={rutasAplicacion.reportes} element={<ReportesMapaPagina />} />
        <Route path={rutasAplicacion.misReportes} element={<MisReportesPagina />} />
        <Route path={rutasAplicacion.crearReporte} element={<CrearReportePagina />} />
        <Route path={rutasAplicacion.notificaciones} element={<NotificacionesPagina />} />
        <Route path={rutasAplicacion.usuarios} element={<UsuariosPagina />} />
        <Route path={rutasAplicacion.perfil} element={<PerfilPagina />} />
      </Route>

      <Route path="*" element={<Navigate replace to={rutasAplicacion.dashboard} />} />
    </Routes>
  );
}