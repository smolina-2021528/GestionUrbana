import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from 'react';

import { almacenamientoSesion } from '../../../shared/services/almacenamientoSesion';
import { authService } from '../services/auth.service';
import type {
  ActualizarPerfilPayload,
  LoginPayload,
  RegistroPayload,
  UsuarioAutenticado,
  VerificarCorreoPayload
} from '../types/auth.types';

type AuthContextValue = {
  usuario: UsuarioAutenticado | null;
  token: string | null;
  cargando: boolean;
  autenticado: boolean;
  iniciarSesion: (payload: LoginPayload) => Promise<void>;
  registrarUsuario: (payload: RegistroPayload) => Promise<void>;
  verificarCorreo: (payload: VerificarCorreoPayload) => Promise<void>;
  refrescarPerfil: () => Promise<UsuarioAutenticado | null>;
  actualizarPerfil: (payload: ActualizarPerfilPayload) => Promise<UsuarioAutenticado>;
  cerrarSesion: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<UsuarioAutenticado | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);

  const limpiarSesion = useCallback(async () => {
    await almacenamientoSesion.eliminarToken();
    setUsuario(null);
    setToken(null);
  }, []);

  const refrescarPerfil = useCallback(async () => {
    const tokenGuardado = await almacenamientoSesion.obtenerToken();

    if (!tokenGuardado) {
      setUsuario(null);
      setToken(null);
      return null;
    }

    const respuesta = await authService.obtenerPerfil();

    setUsuario(respuesta.data);
    setToken(tokenGuardado);

    return respuesta.data;
  }, []);

  useEffect(() => {
    const cargarSesion = async () => {
      try {
        await refrescarPerfil();
      } catch {
        await limpiarSesion();
      } finally {
        setCargando(false);
      }
    };

    void cargarSesion();
  }, [limpiarSesion, refrescarPerfil]);

  const iniciarSesion = useCallback(async (payload: LoginPayload) => {
    const respuesta = await authService.iniciarSesion(payload);

    await almacenamientoSesion.guardarToken(respuesta.token);

    setToken(respuesta.token);
    setUsuario(respuesta.user);
  }, []);

  const registrarUsuario = useCallback(async (payload: RegistroPayload) => {
    await authService.registrarUsuario(payload);
  }, []);

  const verificarCorreo = useCallback(async (payload: VerificarCorreoPayload) => {
    await authService.verificarCorreo(payload);
  }, []);

  const actualizarPerfil = useCallback(async (payload: ActualizarPerfilPayload) => {
    const respuesta = await authService.actualizarPerfil(payload);

    setUsuario((usuarioActual) => ({
      ...(usuarioActual ?? respuesta.data),
      ...respuesta.data,
      roles: respuesta.data.roles ?? usuarioActual?.roles ?? []
    }));

    return respuesta.data;
  }, []);

  const cerrarSesion = useCallback(async () => {
    try {
      await authService.cerrarSesion();
    } catch {
      // Aunque el backend falle, limpiamos la sesión local.
    } finally {
      await limpiarSesion();
    }
  }, [limpiarSesion]);

  const valor = useMemo<AuthContextValue>(
    () => ({
      usuario,
      token,
      cargando,
      autenticado: Boolean(usuario && token),
      iniciarSesion,
      registrarUsuario,
      verificarCorreo,
      refrescarPerfil,
      actualizarPerfil,
      cerrarSesion
    }),
    [
      usuario,
      token,
      cargando,
      iniciarSesion,
      registrarUsuario,
      verificarCorreo,
      refrescarPerfil,
      actualizarPerfil,
      cerrarSesion
    ]
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}