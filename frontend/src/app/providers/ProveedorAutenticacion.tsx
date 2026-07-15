import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import { autenticacionServicio } from '../../modules/authentication/services/autenticacionServicio';
import type {
  RolUsuario,
  UsuarioAutenticado
} from '../../modules/authentication/types/autenticacionTipos';
import { almacenamientoToken } from '../../shared/services/almacenamientoToken';
import {
  eventoSesionInvalida,
  type DetalleSesionInvalida
} from '../../shared/services/clienteHttp';
import { esErrorApi } from '../../shared/types/errorApi';

type ContextoAutenticacionValor = {
  usuario: UsuarioAutenticado | null;
  token: string | null;
  roles: RolUsuario[];
  estaAutenticado: boolean;
  cargandoSesion: boolean;
  mensajeSesion: string | null;
  iniciarSesion: (token: string, usuario: UsuarioAutenticado) => void;
  cerrarSesion: () => Promise<void>;
  limpiarMensajeSesion: () => void;
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
  const [mensajeSesion, setMensajeSesion] = useState<string | null>(null);

  const limpiarSesion = useCallback((mensaje?: string) => {
    almacenamientoToken.eliminarToken();
    setToken(null);
    setUsuario(null);
    setCargandoSesion(false);

    if (mensaje) {
      setMensajeSesion(mensaje);
    }
  }, []);

  const limpiarMensajeSesion = useCallback(() => {
    setMensajeSesion(null);
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
      setToken(tokenActual);
      setUsuario(respuesta.data);
      return respuesta.data;
    } catch (error) {
      if (
        esErrorApi(error) &&
        (error.codigo === 'NO_AUTENTICADO' || error.codigo === 'CUENTA_DESACTIVADA')
      ) {
        limpiarSesion(error.mensaje);
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
    setMensajeSesion(null);
  }, []);

  const cerrarSesion = useCallback(async () => {
    try {
      await autenticacionServicio.cerrarSesion();
    } catch {
      // La sesión local siempre debe limpiarse aunque el servicio no responda.
      // El token también puede seguir siendo válido en otros microservicios hasta expirar,
      // porque la revocación actual se guarda en memoria por servicio.
    } finally {
      limpiarSesion();
    }
  }, [limpiarSesion]);

  useEffect(() => {
    const manejarSesionInvalida = (evento: Event) => {
      const detalle = (evento as CustomEvent<DetalleSesionInvalida>).detail;
      limpiarSesion(detalle?.mensaje ?? 'Tu sesión ya no es válida. Inicia sesión nuevamente.');
    };

    window.addEventListener(eventoSesionInvalida, manejarSesionInvalida);

    return () => {
      window.removeEventListener(eventoSesionInvalida, manejarSesionInvalida);
    };
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
      mensajeSesion,
      iniciarSesion,
      cerrarSesion,
      limpiarMensajeSesion,
      refrescarPerfil
    }),
    [
      usuario,
      token,
      cargandoSesion,
      mensajeSesion,
      iniciarSesion,
      cerrarSesion,
      limpiarMensajeSesion,
      refrescarPerfil
    ]
  );

  return (
    <ContextoAutenticacion.Provider value={valorContexto}>
      {children}
    </ContextoAutenticacion.Provider>
  );
}