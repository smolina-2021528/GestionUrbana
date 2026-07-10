import type { ChangeEvent } from 'react';
import { useEffect, useState } from 'react';

import { Alerta } from '../../../shared/components/feedback/Alerta';
import { Boton } from '../../../shared/components/ui/Boton';
import { esErrorApi } from '../../../shared/types/errorApi';
import type { RolUsuario } from '../../authentication/types/autenticacionTipos';
import { usarCambiarRolUsuario } from '../hooks/usarCambiarRolUsuario';
import {
  rolesAdministrablesUsuario,
  type UsuarioSistema
} from '../types/usuariosTipos';
import './gestionRolUsuario.css';

type PropiedadesGestionRolUsuario = {
  usuario: UsuarioSistema;
  esUsuarioActual?: boolean;
};

const etiquetasRol: Record<RolUsuario, string> = {
  ADMIN_ROLE: 'Administrador',
  USER_ROLE: 'Ciudadano'
};

const descripcionesRol: Record<RolUsuario, string> = {
  ADMIN_ROLE:
    'Podrá gestionar reportes, usuarios, roles, estados y acciones administrativas.',
  USER_ROLE:
    'Podrá crear reportes, consultar su actividad y utilizar las funciones ciudadanas.'
};

function obtenerMensajeError(error: unknown) {
  if (esErrorApi(error)) {
    if (
      error.codigo === 'CONFLICTO' ||
      error.estadoHttp === 409
    ) {
      return 'No se puede retirar el rol al último administrador del sistema.';
    }

    return error.mensaje;
  }

  return 'No fue posible cambiar el rol del usuario. Intenta nuevamente.';
}

export function GestionRolUsuario({
  usuario,
  esUsuarioActual = false
}: PropiedadesGestionRolUsuario) {
  const cambiarRol = usarCambiarRolUsuario();

  const [editando, setEditando] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const [rolSeleccionado, setRolSeleccionado] =
    useState<RolUsuario>(usuario.role);

  const [mensajeError, setMensajeError] =
    useState<string | null>(null);

  const [mensajeExito, setMensajeExito] =
    useState<string | null>(null);

  const cambioPendiente =
    rolSeleccionado !== usuario.role;

  useEffect(() => {
    setRolSeleccionado(usuario.role);
  }, [usuario.role]);

  const limpiarMensajes = () => {
    setMensajeError(null);
    setMensajeExito(null);
  };

  const iniciarEdicion = () => {
    limpiarMensajes();
    setRolSeleccionado(usuario.role);
    setConfirmando(false);
    setEditando(true);
  };

  const cancelarEdicion = () => {
    setRolSeleccionado(usuario.role);
    setConfirmando(false);
    setEditando(false);
    setMensajeError(null);
  };

  const cambiarSeleccion = (
    evento: ChangeEvent<HTMLSelectElement>
  ) => {
    const nuevoRol = evento.target.value as RolUsuario;

    limpiarMensajes();
    setConfirmando(false);
    setRolSeleccionado(nuevoRol);
  };

  const solicitarConfirmacion = () => {
    limpiarMensajes();

    if (!cambioPendiente) {
      setMensajeError(
        'Selecciona un rol diferente antes de continuar.'
      );
      return;
    }

    setConfirmando(true);
  };

  const confirmarCambio = async () => {
    limpiarMensajes();

    try {
      const respuesta = await cambiarRol.mutateAsync({
        usuarioId: usuario.id,
        datos: {
          roleName: rolSeleccionado
        }
      });

      if (respuesta.success === false) {
        setMensajeError(
          respuesta.message ??
            respuesta.error ??
            'No fue posible cambiar el rol del usuario.'
        );
        return;
      }

      setMensajeExito(
        respuesta.message ??
          `El rol se actualizó a ${etiquetasRol[rolSeleccionado]}.`
      );

      setConfirmando(false);
      setEditando(false);
    } catch (error) {
      setMensajeError(obtenerMensajeError(error));
    }
  };

  return (
    <div className="gestionRolUsuario">
      {!editando ? (
        <Boton
          variante="secundario"
          tamano="sm"
          disabled={cambiarRol.isPending}
          onClick={iniciarEdicion}
        >
          Cambiar rol
        </Boton>
      ) : (
        <div className="gestionRolUsuario__editor">
          <label>
            <span>Nuevo rol</span>

            <select
              value={rolSeleccionado}
              disabled={cambiarRol.isPending}
              onChange={cambiarSeleccion}
            >
              {rolesAdministrablesUsuario.map((rol) => (
                <option key={rol} value={rol}>
                  {etiquetasRol[rol]}
                </option>
              ))}
            </select>
          </label>

          <div className="gestionRolUsuario__descripcion">
            <strong>{etiquetasRol[rolSeleccionado]}</strong>
            <p>{descripcionesRol[rolSeleccionado]}</p>
          </div>

          {!confirmando ? (
            <div className="gestionRolUsuario__acciones">
              <Boton
                variante="secundario"
                tamano="sm"
                disabled={
                  cambiarRol.isPending ||
                  !cambioPendiente
                }
                onClick={solicitarConfirmacion}
              >
                Continuar
              </Boton>

              <Boton
                variante="fantasma"
                tamano="sm"
                disabled={cambiarRol.isPending}
                onClick={cancelarEdicion}
              >
                Cancelar
              </Boton>
            </div>
          ) : (
            <div className="gestionRolUsuario__confirmacion">
              <Alerta
                variante="advertencia"
                titulo="Confirma el cambio de permisos"
              >
                <p>
                  El usuario pasará de{' '}
                  <strong>
                    {etiquetasRol[usuario.role]}
                  </strong>{' '}
                  a{' '}
                  <strong>
                    {etiquetasRol[rolSeleccionado]}
                  </strong>
                  .
                </p>

                {rolSeleccionado === 'ADMIN_ROLE' ? (
                  <p>
                    Esta acción otorgará acceso completo a la
                    administración de la plataforma.
                  </p>
                ) : (
                  <p>
                    Esta acción retirará los permisos
                    administrativos de la cuenta.
                  </p>
                )}

                {esUsuarioActual ? (
                  <p>
                    Estás modificando tu propia cuenta. Los
                    permisos y la navegación se actualizarán
                    inmediatamente.
                  </p>
                ) : null}
              </Alerta>

              <div className="gestionRolUsuario__acciones">
                <Boton
                  tamano="sm"
                  disabled={cambiarRol.isPending}
                  onClick={confirmarCambio}
                >
                  {cambiarRol.isPending
                    ? 'Guardando...'
                    : 'Confirmar cambio'}
                </Boton>

                <Boton
                  variante="fantasma"
                  tamano="sm"
                  disabled={cambiarRol.isPending}
                  onClick={() => setConfirmando(false)}
                >
                  Volver
                </Boton>
              </div>
            </div>
          )}
        </div>
      )}

      {mensajeError ? (
        <div
          className="gestionRolUsuario__mensaje gestionRolUsuario__mensaje--error"
          role="alert"
        >
          {mensajeError}
        </div>
      ) : null}

      {mensajeExito ? (
        <div
          className="gestionRolUsuario__mensaje gestionRolUsuario__mensaje--exito"
          role="status"
          aria-live="polite"
        >
          {mensajeExito}
        </div>
      ) : null}
    </div>
  );
}