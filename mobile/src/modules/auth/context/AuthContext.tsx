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
  ActualizarFotoPerfilPayload,
  ActualizarPerfilPayload,
  CambiarPasswordPayload,
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
  actualizarFotoPerfil: (payload: ActualizarFotoPerfilPayload) => Promise<UsuarioAutenticado>;
  cambiarPassword: (payload: CambiarPasswordPayload) => Promise<void>;
  cerrarSesion: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function mezclarUsuarioActualizado(
  usuarioActual: UsuarioAutenticado | null,
  usuarioActualizado: UsuarioAutenticado
) {
  return {
    ...(usuarioActual ?? usuarioActualizado),
    ...usuarioActualizado,
    roles: usuarioActualizado.roles ?? usuarioActual?.roles ?? []
  };
}

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

    setUsuario((usuarioActual) => mezclarUsuarioActualizado(usuarioActual, respuesta.data));

    return respuesta.data;
  }, []);

  const actualizarFotoPerfil = useCallback(async (payload: ActualizarFotoPerfilPayload) => {
    const respuesta = await authService.actualizarFotoPerfil(payload);

    setUsuario((usuarioActual) => mezclarUsuarioActualizado(usuarioActual, respuesta.data));

    return respuesta.data;
  }, []);

  const cambiarPassword = useCallback(async (payload: CambiarPasswordPayload) => {
    await authService.cambiarPassword(payload);
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
      actualizarFotoPerfil,
      cambiarPassword,
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
      actualizarFotoPerfil,
      cambiarPassword,
      cerrarSesion
    ]
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}