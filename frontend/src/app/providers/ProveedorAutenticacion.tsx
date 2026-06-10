import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import { autenticacionServicio } from '../../modules/authentication/services/autenticacionServicio';
import type {
  RolUsuario,
  UsuarioAutenticado
} from '../../modules/authentication/types/autenticacionTipos';
import { almacenamientoToken } from '../../shared/services/almacenamientoToken';
import { esErrorApi } from '../../shared/types/errorApi';

type ContextoAutenticacionValor = {
  usuario: UsuarioAutenticado | null;
  token: string | null;
  roles: RolUsuario[];
  estaAutenticado: boolean;
  cargandoSesion: boolean;
  iniciarSesion: (token: string, usuario: UsuarioAutenticado) => void;
  cerrarSesion: () => Promise<void>;
  refrescarPerfil: () => Promise<UsuarioAutenticado | null>;
};

type PropiedadesProveedorAutenticacion = {
  children: ReactNode;
};

export const ContextoAutenticacion = createContext<ContextoAutenticacionValor | null>(null);

export function ProveedorAutenticacion({ children }: PropiedadesProveedorAutenticacion) {
  const [token, setToken] = useState<string | null>(() => almacenamientoToken.obtenerToken());
  const [usuario, setUsuario] = useState<UsuarioAutenticado | null>(null);
  const [cargandoSesion, setCargandoSesion] = useState(Boolean(token));

  const limpiarSesion = useCallback(() => {
    almacenamientoToken.eliminarToken();
    setToken(null);
    setUsuario(null);
  }, []);

  const refrescarPerfil = useCallback(async () => {
    const tokenActual = almacenamientoToken.obtenerToken();

    if (!tokenActual) {
      setUsuario(null);
      setCargandoSesion(false);
      return null;
    }

    setCargandoSesion(true);

    try {
      const respuesta = await autenticacionServicio.obtenerPerfilAutenticado();
      setUsuario(respuesta.data);
      return respuesta.data;
    } catch (error) {
      if (esErrorApi(error) && error.codigo === 'NO_AUTENTICADO') {
        limpiarSesion();
      }

      return null;
    } finally {
      setCargandoSesion(false);
    }
  }, [limpiarSesion]);

  const iniciarSesion = useCallback((nuevoToken: string, nuevoUsuario: UsuarioAutenticado) => {
    almacenamientoToken.guardarToken(nuevoToken);
    setToken(nuevoToken);
    setUsuario(nuevoUsuario);
  }, []);

  const cerrarSesion = useCallback(async () => {
    try {
      await autenticacionServicio.cerrarSesion();
    } catch {
      // La sesión local siempre debe limpiarse aunque el servicio no responda.
    } finally {
      limpiarSesion();
    }
  }, [limpiarSesion]);

  useEffect(() => {
    if (!token) {
      setUsuario(null);
      setCargandoSesion(false);
      return;
    }

    void refrescarPerfil();
  }, [refrescarPerfil, token]);

  const valorContexto = useMemo<ContextoAutenticacionValor>(
    () => ({
      usuario,
      token,
      roles: usuario?.roles ?? [],
      estaAutenticado: Boolean(token && usuario),
      cargandoSesion,
      iniciarSesion,
      cerrarSesion,
      refrescarPerfil
    }),
    [usuario, token, cargandoSesion, iniciarSesion, cerrarSesion, refrescarPerfil]
  );

  return (
    <ContextoAutenticacion.Provider value={valorContexto}>
      {children}
    </ContextoAutenticacion.Provider>
  );
}