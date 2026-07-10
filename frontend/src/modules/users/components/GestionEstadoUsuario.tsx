import { useEffect, useState } from 'react';

import { Alerta } from '../../../shared/components/feedback/Alerta';
import { Boton } from '../../../shared/components/ui/Boton';
import { esErrorApi } from '../../../shared/types/errorApi';
import { usarCambiarEstadoUsuario } from '../hooks/usarCambiarEstadoUsuario';
import type { UsuarioSistema } from '../types/usuariosTipos';
import { obtenerNombreCompletoUsuario } from '../types/usuariosTipos';
import './gestionEstadoUsuario.css';

type PropiedadesGestionEstadoUsuario = {
  usuario: UsuarioSistema;
  esUsuarioActual?: boolean;
};

function obtenerMensajeError(error: unknown) {
  if (esErrorApi(error)) {
    if (error.estadoHttp === 403) {
      return 'El servidor no permitió cambiar el estado de esta cuenta. No puedes desactivar tu propia cuenta ni realizar esta acción sin permisos suficientes.';
    }

    if (error.estadoHttp === 409) {
      return 'No se puede cambiar el estado de esta cuenta debido a una restricción administrativa.';
    }

    return error.mensaje;
  }

  return 'No fue posible cambiar el estado de la cuenta. Intenta nuevamente.';
}

export function GestionEstadoUsuario({
  usuario,
  esUsuarioActual = false
}: PropiedadesGestionEstadoUsuario) {
  const cambiarEstado = usarCambiarEstadoUsuario();

  const [confirmando, setConfirmando] = useState(false);
  const [mensajeError, setMensajeError] =
    useState<string | null>(null);
  const [mensajeExito, setMensajeExito] =
    useState<string | null>(null);

  const accionActivar = !usuario.status;
  const cuentaAdministrativa =
    usuario.role === 'ADMIN_ROLE';

  useEffect(() => {
    setConfirmando(false);
  }, [usuario.status]);

  const limpiarMensajes = () => {
    setMensajeError(null);
    setMensajeExito(null);
  };

  const solicitarConfirmacion = () => {
    limpiarMensajes();

    if (esUsuarioActual) {
      setMensajeError(
        'No puedes activar o desactivar tu propia cuenta desde esta pantalla.'
      );
      return;
    }

    setConfirmando(true);
  };

  const cancelarConfirmacion = () => {
    setConfirmando(false);
    setMensajeError(null);
  };

  const confirmarCambio = async () => {
    limpiarMensajes();

    if (esUsuarioActual) {
      setMensajeError(
        'No puedes cambiar el estado de tu propia cuenta.'
      );
      return;
    }

    try {
      const respuesta =
        await cambiarEstado.mutateAsync(usuario.id);

      if (respuesta.success === false) {
        setMensajeError(
          respuesta.message ??
            respuesta.error ??
            'No fue posible cambiar el estado de la cuenta.'
        );
        return;
      }

      setMensajeExito(
        respuesta.message ??
          (accionActivar
            ? 'Cuenta activada correctamente.'
            : 'Cuenta desactivada correctamente.')
      );

      setConfirmando(false);
    } catch (error) {
      setMensajeError(obtenerMensajeError(error));
    }
  };

  return (
    <div className="gestionEstadoUsuario">
      {esUsuarioActual ? (
        <div className="gestionEstadoUsuario__bloqueado">
          <span>Estado protegido</span>
          <p>
            No puedes cambiar el estado de tu propia cuenta.
          </p>
        </div>
      ) : !confirmando ? (
        <Boton
          variante={
            accionActivar
              ? 'secundario'
              : 'peligro'
          }
          tamano="sm"
          disabled={cambiarEstado.isPending}
          onClick={solicitarConfirmacion}
        >
          {accionActivar
            ? 'Activar cuenta'
            : 'Desactivar cuenta'}
        </Boton>
      ) : (
        <div className="gestionEstadoUsuario__confirmacion">
          <Alerta
            variante={
              accionActivar
                ? 'informacion'
                : 'advertencia'
            }
            titulo={
              accionActivar
                ? 'Confirma la activación'
                : 'Confirma la desactivación'
            }
          >
            <p>
              La cuenta de{' '}
              <strong>
                {obtenerNombreCompletoUsuario(usuario)}
              </strong>{' '}
              será{' '}
              <strong>
                {accionActivar
                  ? 'activada'
                  : 'desactivada'}
              </strong>
              .
            </p>

            {accionActivar ? (
              <p>
                El usuario recuperará el acceso al sistema
                según los permisos de su rol actual.
              </p>
            ) : (
              <p>
                El usuario dejará de poder iniciar sesión y
                utilizar las funciones de la plataforma.
              </p>
            )}

            {!accionActivar && cuentaAdministrativa ? (
              <p>
                Esta cuenta tiene permisos administrativos.
                También dejará de aparecer como responsable
                disponible para nuevos reportes.
              </p>
            ) : null}
          </Alerta>

          <div className="gestionEstadoUsuario__acciones">
            <Boton
              variante={
                accionActivar
                  ? 'secundario'
                  : 'peligro'
              }
              tamano="sm"
              disabled={cambiarEstado.isPending}
              onClick={confirmarCambio}
            >
              {cambiarEstado.isPending
                ? 'Guardando...'
                : accionActivar
                  ? 'Confirmar activación'
                  : 'Confirmar desactivación'}
            </Boton>

            <Boton
              variante="fantasma"
              tamano="sm"
              disabled={cambiarEstado.isPending}
              onClick={cancelarConfirmacion}
            >
              Cancelar
            </Boton>
          </div>
        </div>
      )}

      {mensajeError ? (
        <div
          className="gestionEstadoUsuario__mensaje gestionEstadoUsuario__mensaje--error"
          role="alert"
        >
          {mensajeError}
        </div>
      ) : null}

      {mensajeExito ? (
        <div
          className="gestionEstadoUsuario__mensaje gestionEstadoUsuario__mensaje--exito"
          role="status"
          aria-live="polite"
        >
          {mensajeExito}
        </div>
      ) : null}
    </div>
  );
}