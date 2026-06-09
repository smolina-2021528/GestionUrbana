const claveTokenAutenticacion = 'ciudadActiva.tokenAutenticacion';

function almacenamientoDisponible() {
  try {
    const clavePrueba = 'ciudadActiva.pruebaAlmacenamiento';
    window.localStorage.setItem(clavePrueba, clavePrueba);
    window.localStorage.removeItem(clavePrueba);
    return true;
  } catch {
    return false;
  }
}

export const almacenamientoToken = {
  obtenerToken() {
    if (!almacenamientoDisponible()) {
      return null;
    }

    const token = window.localStorage.getItem(claveTokenAutenticacion);
    return token && token.trim().length > 0 ? token : null;
  },

  guardarToken(token: string) {
    if (!almacenamientoDisponible()) {
      return;
    }

    window.localStorage.setItem(claveTokenAutenticacion, token);
  },

  eliminarToken() {
    if (!almacenamientoDisponible()) {
      return;
    }

    window.localStorage.removeItem(claveTokenAutenticacion);
  }
};