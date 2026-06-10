import {
  Bell,
  CirclePlus,
  CircleUserRound,
  ClipboardList,
  LayoutDashboard,
  MapPinned,
  Search,
  UsersRound
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';

import {
  obtenerInformacionRuta,
  rutasAplicacion
} from '../../config/constantesSistema';
import type { IconoNavegacion } from '../../config/constantesSistema';
import { marcaCiudadActiva } from '../../design/identity/marca';
import { usarAutenticacion } from '../../modules/authentication/hooks/usarAutenticacion';
import { usarPermisos } from '../../shared/hooks/usarPermisos';
import { usarTituloPagina } from '../../shared/hooks/usarTituloPagina';
import './layoutPrincipal.css';

const iconosNavegacion: Record<IconoNavegacion, LucideIcon> = {
  dashboard: LayoutDashboard,
  reportes: MapPinned,
  misReportes: ClipboardList,
  crearReporte: CirclePlus,
  notificaciones: Bell,
  usuarios: UsersRound,
  perfil: CircleUserRound
};

function obtenerInicialesUsuario(nombre?: string, apellido?: string, username?: string) {
  const inicialNombre = nombre?.trim().charAt(0);
  const inicialApellido = apellido?.trim().charAt(0);

  if (inicialNombre || inicialApellido) {
    return `${inicialNombre ?? ''}${inicialApellido ?? ''}`.toUpperCase();
  }

  return username?.trim().slice(0, 2).toUpperCase() || 'CA';
}

export function LayoutPrincipal() {
  usarTituloPagina();

  const ubicacion = useLocation();
  const { usuario } = usarAutenticacion();
  const { esAdministrador, obtenerRutasVisibles } = usarPermisos();
  const informacionRuta = obtenerInformacionRuta(ubicacion.pathname);
  const enlacesVisibles = obtenerRutasVisibles();
  const inicialesUsuario = obtenerInicialesUsuario(
    usuario?.name,
    usuario?.surname,
    usuario?.username
  );

  return (
    <div className="layoutPrincipal">
      <aside className="layoutPrincipal__sidebar" aria-label="Navegación principal">
        <div className="layoutPrincipal__marca">
          <NavLink className="layoutPrincipal__logoEnlace" to={rutasAplicacion.dashboard}>
            <img
              className="layoutPrincipal__logo"
              src={marcaCiudadActiva.rutaLogo}
              alt={marcaCiudadActiva.textoAlternativoLogo}
            />
          </NavLink>
        </div>

        <nav className="layoutPrincipal__navegacion">
          {enlacesVisibles.map((enlace) => {
            const IconoEnlace = iconosNavegacion[enlace.iconoId];

            return (
              <NavLink
                key={enlace.ruta}
                className={({ isActive }) =>
                  isActive
                    ? 'layoutPrincipal__enlace layoutPrincipal__enlace--activo'
                    : 'layoutPrincipal__enlace'
                }
                end={enlace.ruta === rutasAplicacion.reportes}
                to={enlace.ruta}
              >
                <span className="layoutPrincipal__icono" aria-hidden="true">
                  <IconoEnlace size={19} strokeWidth={2.2} />
                </span>

                <span className="layoutPrincipal__textoEnlace">
                  <strong>{enlace.etiqueta}</strong>
                  <small>{enlace.descripcion}</small>
                </span>
              </NavLink>
            );
          })}
        </nav>

        <div className="layoutPrincipal__panelRol">
          <span className="layoutPrincipal__estadoRol" aria-hidden="true" />
          <div>
            <strong>{esAdministrador ? 'Administrador' : 'Ciudadano'}</strong>
            <small>Acceso activo</small>
          </div>
        </div>
      </aside>

      <div className="layoutPrincipal__cuerpo">
        <header className="layoutPrincipal__header">
          <div className="layoutPrincipal__titulo">
            <span>Ciudad Activa</span>
            <h1>{informacionRuta.titulo}</h1>
            <p>{informacionRuta.descripcion}</p>
          </div>

          <div className="layoutPrincipal__accionesHeader">
            <label className="layoutPrincipal__buscador">
              <Search
                aria-hidden="true"
                className="layoutPrincipal__buscadorIcono"
                size={18}
                strokeWidth={2.2}
              />
              <input aria-label="Buscar en Ciudad Activa" placeholder="Buscar" type="search" />
            </label>

            <NavLink
              aria-label="Notificaciones"
              className="layoutPrincipal__botonIcono"
              title="Notificaciones"
              to={rutasAplicacion.notificaciones}
            >
              <Bell size={18} strokeWidth={2.2} />
            </NavLink>

            <NavLink className="layoutPrincipal__perfil" to={rutasAplicacion.perfil}>
              <span className="layoutPrincipal__avatar" aria-hidden="true">
                {inicialesUsuario}
              </span>
              <span>{usuario?.username ?? 'Perfil'}</span>
            </NavLink>
          </div>
        </header>

        <main className="layoutPrincipal__contenido">
          <Outlet />
        </main>
      </div>
    </div>
  );
}