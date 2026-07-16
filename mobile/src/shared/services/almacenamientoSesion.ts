import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const CLAVE_TOKEN = 'ciudad_activa_token';

function almacenamientoWebDisponible() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

async function guardarTokenWeb(token: string) {
  if (!almacenamientoWebDisponible()) {
    return;
  }

  window.localStorage.setItem(CLAVE_TOKEN, token);
}

async function obtenerTokenWeb() {
  if (!almacenamientoWebDisponible()) {
    return null;
  }

  return window.localStorage.getItem(CLAVE_TOKEN);
}

async function eliminarTokenWeb() {
  if (!almacenamientoWebDisponible()) {
    return;
  }

  window.localStorage.removeItem(CLAVE_TOKEN);
}

export const almacenamientoSesion = {
  async guardarToken(token: string) {
    if (Platform.OS === 'web') {
      await guardarTokenWeb(token);
      return;
    }

    await SecureStore.setItemAsync(CLAVE_TOKEN, token);
  },

  async obtenerToken() {
    if (Platform.OS === 'web') {
      return obtenerTokenWeb();
    }

    return SecureStore.getItemAsync(CLAVE_TOKEN);
  },

  async eliminarToken() {
    if (Platform.OS === 'web') {
      await eliminarTokenWeb();
      return;
    }

    await SecureStore.deleteItemAsync(CLAVE_TOKEN);
  }
};