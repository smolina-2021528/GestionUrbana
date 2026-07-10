import type {
  ChangeEvent,
  FormEvent
} from 'react';
import {
  useEffect,
  useState
} from 'react';

import { Boton } from '../../../shared/components/ui/Boton';
import type {
  RolUsuario
} from '../../authentication/types/autenticacionTipos';
import './filtrosUsuarios.css';

export type FiltroRolUsuarios =
  | 'TODOS'
  | RolUsuario;

export type FiltroEstadoUsuarios =
  | 'TODOS'
  | 'ACTIVOS'
  | 'INACTIVOS';

type PropiedadesFiltrosUsuarios = {
  busqueda: string;
  rol: FiltroRolUsuarios;
  estado: FiltroEstadoUsuarios;
  limite: number;
  bloqueado?: boolean;
  alBuscar: (busqueda: string) => void;
  alCambiarRol: (rol: FiltroRolUsuarios) => void;
  alCambiarEstado: (
    estado: FiltroEstadoUsuarios
  ) => void;
  alCambiarLimite: (limite: number) => void;
  alLimpiar: () => void;
};

const limitesUsuarios = [10, 20, 30, 50] as const;

const etiquetasRol: Record<
  FiltroRolUsuarios,
  string
> = {
  TODOS: 'Todos los roles',
  ADMIN_ROLE: 'Administradores',
  USER_ROLE: 'Ciudadanos'
};

const etiquetasEstado: Record<
  FiltroEstadoUsuarios,
  string
> = {
  TODOS: 'Todos los estados',
  ACTIVOS: 'Cuentas activas',
  INACTIVOS: 'Cuentas inactivas'
};

function esFiltroRolUsuarios(
  valor: string
): valor is FiltroRolUsuarios {
  return (
    valor === 'TODOS' ||
    valor === 'ADMIN_ROLE' ||
    valor === 'USER_ROLE'
  );
}

function esFiltroEstadoUsuarios(
  valor: string
): valor is FiltroEstadoUsuarios {
  return (
    valor === 'TODOS' ||
    valor === 'ACTIVOS' ||
    valor === 'INACTIVOS'
  );
}

function esLimiteUsuarios(
  valor: number
): valor is (typeof limitesUsuarios)[number] {
  return limitesUsuarios.includes(
    valor as (typeof limitesUsuarios)[number]
  );
}

export function FiltrosUsuarios({
  busqueda,
  rol,
  estado,
  limite,
  bloqueado = false,
  alBuscar,
  alCambiarRol,
  alCambiarEstado,
  alCambiarLimite,
  alLimpiar
}: PropiedadesFiltrosUsuarios) {
  const [busquedaLocal, setBusquedaLocal] =
    useState(busqueda);

  useEffect(() => {
    setBusquedaLocal(busqueda);
  }, [busqueda]);

  const ejecutarBusqueda = (
    evento: FormEvent<HTMLFormElement>
  ) => {
    evento.preventDefault();
    alBuscar(busquedaLocal.trim());
  };

  const cambiarRol = (
    evento: ChangeEvent<HTMLSelectElement>
  ) => {
    const valor = evento.target.value;

    if (esFiltroRolUsuarios(valor)) {
      alCambiarRol(valor);
    }
  };

  const cambiarEstado = (
    evento: ChangeEvent<HTMLSelectElement>
  ) => {
    const valor = evento.target.value;

    if (esFiltroEstadoUsuarios(valor)) {
      alCambiarEstado(valor);
    }
  };

  const cambiarLimite = (
    evento: ChangeEvent<HTMLSelectElement>
  ) => {
    const valor = Number(evento.target.value);

    if (esLimiteUsuarios(valor)) {
      alCambiarLimite(valor);
    }
  };

  const limpiarBusqueda = () => {
    setBusquedaLocal('');
    alBuscar('');
  };

  const cantidadFiltrosActivos = [
    Boolean(busqueda),
    rol !== 'TODOS',
    estado !== 'TODOS',
    limite !== 20
  ].filter(Boolean).length;

  return (
    <section
      className="filtrosUsuarios"
      aria-label="Filtros del directorio de usuarios"
    >
      <div className="filtrosUsuarios__encabezado">
        <div>
          <span>Herramientas del directorio</span>
          <h3>Buscar y filtrar usuarios</h3>
          <p>
            La búsqueda consulta todos los usuarios. Los filtros
            de rol y estado se aplican sobre la página visible.
          </p>
        </div>

        <div className="filtrosUsuarios__contador">
          <span>Filtros activos</span>
          <strong>{cantidadFiltrosActivos}</strong>
        </div>
      </div>

      <form
        className="filtrosUsuarios__busqueda"
        onSubmit={ejecutarBusqueda}
      >
        <label>
          <span>Buscar usuario</span>

          <div className="filtrosUsuarios__busquedaControl">
            <input
              type="search"
              value={busquedaLocal}
              placeholder="Nombre, apellido, usuario o correo"
              autoComplete="off"
              disabled={bloqueado}
              onChange={(evento) =>
                setBusquedaLocal(evento.target.value)
              }
            />

            <Boton
              type="submit"
              disabled={bloqueado}
            >
              Buscar
            </Boton>
          </div>
        </label>
      </form>

      <div className="filtrosUsuarios__selectores">
        <label>
          <span>Rol visible</span>

          <select
            value={rol}
            disabled={bloqueado}
            onChange={cambiarRol}
          >
            {(
              Object.keys(
                etiquetasRol
              ) as FiltroRolUsuarios[]
            ).map((opcion) => (
              <option
                key={opcion}
                value={opcion}
              >
                {etiquetasRol[opcion]}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Estado visible</span>

          <select
            value={estado}
            disabled={bloqueado}
            onChange={cambiarEstado}
          >
            {(
              Object.keys(
                etiquetasEstado
              ) as FiltroEstadoUsuarios[]
            ).map((opcion) => (
              <option
                key={opcion}
                value={opcion}
              >
                {etiquetasEstado[opcion]}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Usuarios por página</span>

          <select
            value={limite}
            disabled={bloqueado}
            onChange={cambiarLimite}
          >
            {limitesUsuarios.map((opcion) => (
              <option
                key={opcion}
                value={opcion}
              >
                {opcion} usuarios
              </option>
            ))}
          </select>
        </label>
      </div>

      {cantidadFiltrosActivos > 0 ? (
        <div className="filtrosUsuarios__activos">
          <div className="filtrosUsuarios__chips">
            {busqueda ? (
              <button
                type="button"
                disabled={bloqueado}
                onClick={limpiarBusqueda}
              >
                <span>Búsqueda</span>
                <strong>{busqueda}</strong>
                <small>×</small>
              </button>
            ) : null}

            {rol !== 'TODOS' ? (
              <button
                type="button"
                disabled={bloqueado}
                onClick={() =>
                  alCambiarRol('TODOS')
                }
              >
                <span>Rol</span>
                <strong>{etiquetasRol[rol]}</strong>
                <small>×</small>
              </button>
            ) : null}

            {estado !== 'TODOS' ? (
              <button
                type="button"
                disabled={bloqueado}
                onClick={() =>
                  alCambiarEstado('TODOS')
                }
              >
                <span>Estado</span>
                <strong>
                  {etiquetasEstado[estado]}
                </strong>
                <small>×</small>
              </button>
            ) : null}

            {limite !== 20 ? (
              <button
                type="button"
                disabled={bloqueado}
                onClick={() => alCambiarLimite(20)}
              >
                <span>Vista</span>
                <strong>{limite} por página</strong>
                <small>×</small>
              </button>
            ) : null}
          </div>

          <Boton
            variante="fantasma"
            tamano="sm"
            disabled={bloqueado}
            onClick={() => {
              setBusquedaLocal('');
              alLimpiar();
            }}
          >
            Limpiar filtros
          </Boton>
        </div>
      ) : null}
    </section>
  );
}