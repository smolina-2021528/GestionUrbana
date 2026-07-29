import {
  Bell,
  CirclePlus,
  CircleUserRound,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  MapPinned,
  Search,
  UsersRound,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom';

import {
  obtenerInformacionRuta,
  obtenerRutaInicioPorRoles,
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

  const navegar = useNavigate();
  const ubicacion = useLocation();
  const { usuario, roles, cerrarSesion } = usarAutenticacion();
  const { esAdministrador, obtenerRutasVisibles } = usarPermisos();
  const [cerrandoSesion, setCerrandoSesion] = useState(false);
  const [tema, setTema] = useState(() => {
    return localStorage.getItem('tema') || 'light';
  });

  const toggleTema = () => {
    setTema((prev) => {
      const nuevoTema = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('tema', nuevoTema);
      document.documentElement.setAttribute('data-theme', nuevoTema);
      return nuevoTema;
    });
  };
  const [searchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  const [textoBusqueda, setTextoBusqueda] = useState(queryParam);

  useEffect(() => {
    setTextoBusqueda(queryParam);
  }, [queryParam]);

  const manejarBusquedaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const queryLimpia = textoBusqueda.trim();
    const rutaBusqueda = esAdministrador ? rutasAplicacion.reportes : rutasAplicacion.misReportes;

    if (queryLimpia) {
      navegar(`${rutaBusqueda}?q=${encodeURIComponent(queryLimpia)}`);
    } else {
      navegar(rutaBusqueda);
    }
  };
  const [sidebarColapsado, setSidebarColapsado] = useState(() => {
    const guardado = localStorage.getItem('sidebar-colapsado');
    return guardado === 'true';
  });

  const toggleSidebar = () => {
    setSidebarColapsado((prev) => {
      const nuevoEstado = !prev;
      localStorage.setItem('sidebar-colapsado', String(nuevoEstado));
      return nuevoEstado;
    });
  };

  const informacionRuta = obtenerInformacionRuta(ubicacion.pathname);
  const enlacesVisibles = obtenerRutasVisibles();
  const rutaInicio = obtenerRutaInicioPorRoles(roles);
  const inicialesUsuario = obtenerInicialesUsuario(
    usuario?.name,
    usuario?.surname,
    usuario?.username
  );

  const manejarCerrarSesion = async () => {
    setCerrandoSesion(true);

    try {
      await cerrarSesion();
      navegar(rutasAplicacion.login, { replace: true });
    } finally {
      setCerrandoSesion(false);
    }
  };

  return (
    <div className={`layoutPrincipal ${sidebarColapsado ? 'layoutPrincipal--sidebar-colapsado' : ''}`}>
      <aside className={`layoutPrincipal__sidebar ${sidebarColapsado ? 'layoutPrincipal__sidebar--colapsado' : ''}`} aria-label="Navegación principal">
        <div className="layoutPrincipal__marca">
          <NavLink className="layoutPrincipal__logoEnlace" to={rutaInicio}>
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
                title={enlace.etiqueta}
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

        <div
          className="layoutPrincipal__panelRol"
          title={esAdministrador ? 'Administrador: Acceso activo' : 'Ciudadano: Acceso activo'}
        >
          <span className="layoutPrincipal__estadoRol" aria-hidden="true" />
          <div className="layoutPrincipal__infoRol">
            <strong>{esAdministrador ? 'Administrador' : 'Ciudadano'}</strong>
            <small>Acceso activo</small>
          </div>
        </div>

        <button
          className="layoutPrincipal__toggle"
          type="button"
          onClick={toggleSidebar}
          aria-label={sidebarColapsado ? "Expandir barra lateral" : "Colapsar barra lateral"}
          title={sidebarColapsado ? "Expandir" : "Colapsar"}
        >
          <span className="layoutPrincipal__iconoToggle" aria-hidden="true">
            {sidebarColapsado ? <ChevronRight size={19} strokeWidth={2.2} /> : <ChevronLeft size={19} strokeWidth={2.2} />}
          </span>
          <span className="layoutPrincipal__textoToggle">Contraer menú</span>
        </button>
      </aside>

      <div className="layoutPrincipal__cuerpo">
        <header className="layoutPrincipal__header">
          <div className="layoutPrincipal__titulo">
            <span>Ciudad Activa</span>
            <h1>{informacionRuta.titulo}</h1>
            <p>{informacionRuta.descripcion}</p>
          </div>

          <div className="layoutPrincipal__accionesHeader">
            <form className="layoutPrincipal__buscadorForm" onSubmit={manejarBusquedaSubmit}>
              <label className="layoutPrincipal__buscador">
                <Search
                  aria-hidden="true"
                  className="layoutPrincipal__buscadorIcono"
                  size={18}
                  strokeWidth={2.2}
                />
                <input
                  aria-label="Buscar reportes"
                  placeholder="Buscar reportes..."
                  type="search"
                  value={textoBusqueda}
                  onChange={(e) => setTextoBusqueda(e.target.value)}
                />
              </label>
            </form>

            <NavLink
              aria-label="Notificaciones"
              className="layoutPrincipal__botonIcono"
              title="Notificaciones"
              to={rutasAplicacion.notificaciones}
            >
              <Bell size={18} strokeWidth={2.2} />
            </NavLink>

            <button
              aria-label="Alternar tema"
              className="layoutPrincipal__botonIcono"
              title={tema === 'light' ? 'Activar modo oscuro' : 'Activar modo claro'}
              type="button"
              onClick={toggleTema}
            >
              {tema === 'light' ? <Moon size={18} strokeWidth={2.2} /> : <Sun size={18} strokeWidth={2.2} />}
            </button>

            <button
              aria-label="Cerrar sesión"
              className="layoutPrincipal__botonIcono"
              disabled={cerrandoSesion}
              title="Cerrar sesión"
              type="button"
              onClick={manejarCerrarSesion}
            >
              <LogOut size={18} strokeWidth={2.2} />
            </button>

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