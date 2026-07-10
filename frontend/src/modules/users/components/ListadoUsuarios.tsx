import type { UsuarioSistema } from '../types/usuariosTipos';
import { obtenerNombreCompletoUsuario } from '../types/usuariosTipos';
import './listadoUsuarios.css';

type PropiedadesListadoUsuarios = {
  usuarios: UsuarioSistema[];
  totalUsuarios: number;
  usuarioActualId?: string;
};

type EstadoVerificacionUsuario = {
  etiqueta: string;
  modificador: 'verificado' | 'pendiente' | 'desconocido';
};

const etiquetasRol: Record<UsuarioSistema['role'], string> = {
  ADMIN_ROLE: 'Administrador',
  USER_ROLE: 'Ciudadano'
};

function formatearNumero(valor: number) {
  return new Intl.NumberFormat('es-GT').format(valor);
}

function formatearFecha(fecha: string | undefined) {
  if (!fecha) {
    return 'No disponible';
  }

  const fechaValida = new Date(fecha);

  if (Number.isNaN(fechaValida.getTime())) {
    return 'No disponible';
  }

  return new Intl.DateTimeFormat('es-GT', {
    dateStyle: 'medium'
  }).format(fechaValida);
}

function obtenerInicialesUsuario(usuario: UsuarioSistema) {
  const inicialNombre = usuario.name?.trim().charAt(0);
  const inicialApellido = usuario.surname?.trim().charAt(0);

  const iniciales = [inicialNombre, inicialApellido]
    .filter(Boolean)
    .join('')
    .toUpperCase();

  if (iniciales) {
    return iniciales;
  }

  return usuario.username
    .trim()
    .slice(0, 2)
    .toUpperCase();
}

function obtenerEstadoVerificacion(
  valor: boolean | undefined
): EstadoVerificacionUsuario {
  if (valor === true) {
    return {
      etiqueta: 'Correo verificado',
      modificador: 'verificado'
    };
  }

  if (valor === false) {
    return {
      etiqueta: 'Correo pendiente',
      modificador: 'pendiente'
    };
  }

  return {
    etiqueta: 'Verificación no disponible',
    modificador: 'desconocido'
  };
}

function AvatarUsuario({
  usuario
}: {
  usuario: UsuarioSistema;
}) {
  return (
    <div
      className="listadoUsuarios__avatar"
      aria-hidden="true"
    >
      <span>{obtenerInicialesUsuario(usuario)}</span>

      {usuario.profilePicture ? (
        <img
          src={usuario.profilePicture}
          alt=""
          loading="lazy"
          onError={(evento) => {
            evento.currentTarget.hidden = true;
          }}
        />
      ) : null}
    </div>
  );
}

export function ListadoUsuarios({
  usuarios,
  totalUsuarios,
  usuarioActualId
}: PropiedadesListadoUsuarios) {
  const totalActivos = usuarios.filter(
    (usuario) => usuario.status
  ).length;

  const totalAdministradores = usuarios.filter(
    (usuario) => usuario.role === 'ADMIN_ROLE'
  ).length;

  return (
    <section
      className="listadoUsuarios"
      aria-label="Directorio de usuarios registrados"
    >
      <div className="listadoUsuarios__resumen">
        <article>
          <span>Total registrados</span>
          <strong>{formatearNumero(totalUsuarios)}</strong>
          <p>Usuarios encontrados en el sistema.</p>
        </article>

        <article>
          <span>Página visible</span>
          <strong>{formatearNumero(usuarios.length)}</strong>
          <p>Cuentas cargadas en esta consulta.</p>
        </article>

        <article>
          <span>Cuentas activas</span>
          <strong>{formatearNumero(totalActivos)}</strong>
          <p>Usuarios activos en la página actual.</p>
        </article>

        <article>
          <span>Administradores</span>
          <strong>
            {formatearNumero(totalAdministradores)}
          </strong>
          <p>Administradores visibles actualmente.</p>
        </article>
      </div>

      <div className="listadoUsuarios__encabezadoTabla">
        <span>Usuario</span>
        <span>Contacto</span>
        <span>Rol</span>
        <span>Cuenta</span>
        <span>Registro</span>
      </div>

      <div className="listadoUsuarios__filas">
        {usuarios.map((usuario) => {
          const esUsuarioActual =
            usuario.id === usuarioActualId;

          const verificacion =
            obtenerEstadoVerificacion(
              usuario.isEmailVerified
            );

          return (
            <article
              className="listadoUsuarios__fila"
              key={usuario.id}
            >
              <div className="listadoUsuarios__identidad">
                <AvatarUsuario usuario={usuario} />

                <div>
                  <div className="listadoUsuarios__nombre">
                    <strong>
                      {obtenerNombreCompletoUsuario(usuario)}
                    </strong>

                    {esUsuarioActual ? (
                      <span>Tu cuenta</span>
                    ) : null}
                  </div>

                  <small>@{usuario.username}</small>
                </div>
              </div>

              <div className="listadoUsuarios__contacto">
                <span className="listadoUsuarios__etiquetaMovil">
                  Contacto
                </span>

                <a href={`mailto:${usuario.email}`}>
                  {usuario.email}
                </a>

                <small>
                  {usuario.phone || 'Sin teléfono registrado'}
                </small>
              </div>

              <div className="listadoUsuarios__celda">
                <span className="listadoUsuarios__etiquetaMovil">
                  Rol
                </span>

                <span
                  className={
                    usuario.role === 'ADMIN_ROLE'
                      ? 'listadoUsuarios__insignia listadoUsuarios__insignia--administrador'
                      : 'listadoUsuarios__insignia listadoUsuarios__insignia--ciudadano'
                  }
                >
                  {etiquetasRol[usuario.role]}
                </span>
              </div>

              <div className="listadoUsuarios__estadoCuenta">
                <span className="listadoUsuarios__etiquetaMovil">
                  Cuenta
                </span>

                <span
                  className={
                    usuario.status
                      ? 'listadoUsuarios__insignia listadoUsuarios__insignia--activo'
                      : 'listadoUsuarios__insignia listadoUsuarios__insignia--inactivo'
                  }
                >
                  {usuario.status ? 'Activa' : 'Inactiva'}
                </span>

                <small
                  className={`listadoUsuarios__verificacion listadoUsuarios__verificacion--${verificacion.modificador}`}
                >
                  {verificacion.etiqueta}
                </small>
              </div>

              <div className="listadoUsuarios__registro">
                <span className="listadoUsuarios__etiquetaMovil">
                  Registro
                </span>

                <strong>
                  {formatearFecha(usuario.createdAt)}
                </strong>

                <small>
                  Actualizado {formatearFecha(usuario.updatedAt)}
                </small>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}