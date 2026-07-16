import * as SecureStore from 'expo-secure-store';

const CLAVE_TOKEN = 'ciudad_activa_token';

export const almacenamientoSesion = {
  async guardarToken(token: string) {
    await SecureStore.setItemAsync(CLAVE_TOKEN, token);
  },

  async obtenerToken() {
    return SecureStore.getItemAsync(CLAVE_TOKEN);
  },

  async eliminarToken() {
    await SecureStore.deleteItemAsync(CLAVE_TOKEN);
  }
};