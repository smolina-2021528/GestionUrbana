import type { ReactNode } from 'react';
import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState
} from 'react';

import { almacenamientoSesion } from '../../../shared/services/almacenamientoSesion';
import { authService } from '../services/auth.service';
import type {
  LoginPayload,
  UsuarioAutenticado
} from '../types/auth.types';

type EstadoAuth = {
  usuario: UsuarioAutenticado | null;
  token: string | null;
  cargandoSesion: boolean;
  estaAutenticado: boolean;
  iniciarSesion: (payload: LoginPayload) => Promise<void>;
  cerrarSesion: () => Promise<void>;
  refrescarPerfil: () => Promise<void>;
};

export const AuthContext = createContext<EstadoAuth | null>(null);

type PropiedadesAuthProvider = {
  children: ReactNode;
};

export function AuthProvider({ children }: PropiedadesAuthProvider) {
  const [usuario, setUsuario] = useState<UsuarioAutenticado | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [cargandoSesion, setCargandoSesion] = useState(true);

  const limpiarSesion = useCallback(async () => {
    await almacenamientoSesion.eliminarToken();
    setToken(null);
    setUsuario(null);
  }, []);

  const refrescarPerfil = useCallback(async () => {
    const tokenGuardado = await almacenamientoSesion.obtenerToken();

    if (!tokenGuardado) {
      setToken(null);
      setUsuario(null);
      setCargandoSesion(false);
      return;
    }

    try {
      setCargandoSesion(true);
      const perfil = await authService.obtenerPerfil();
      setToken(tokenGuardado);
      setUsuario(perfil.data);
    } catch {
      await limpiarSesion();
    } finally {
      setCargandoSesion(false);
    }
  }, [limpiarSesion]);

  const iniciarSesion = useCallback(async (payload: LoginPayload) => {
    const respuesta = await authService.iniciarSesion(payload);

    await almacenamientoSesion.guardarToken(respuesta.token);

    setToken(respuesta.token);
    setUsuario(respuesta.user);
  }, []);

  const cerrarSesion = useCallback(async () => {
    try {
      await authService.cerrarSesion();
    } catch {
      // Aunque el backend no responda, la app debe limpiar la sesión local.
    } finally {
      await limpiarSesion();
    }
  }, [limpiarSesion]);

  useEffect(() => {
    void refrescarPerfil();
  }, [refrescarPerfil]);

  const valor = useMemo<EstadoAuth>(
    () => ({
      usuario,
      token,
      cargandoSesion,
      estaAutenticado: Boolean(token && usuario),
      iniciarSesion,
      cerrarSesion,
      refrescarPerfil
    }),
    [
      usuario,
      token,
      cargandoSesion,
      iniciarSesion,
      cerrarSesion,
      refrescarPerfil
    ]
  );

  return (
    <AuthContext.Provider value={valor}>
      {children}
    </AuthContext.Provider>
  );
}