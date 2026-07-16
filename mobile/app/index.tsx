import { Redirect } from 'expo-router';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View
} from 'react-native';

import { colores } from '../src/theme/colores';
import { useAuth } from '../src/modules/auth/hooks/useAuth';

export default function IndexScreen() {
  const { cargandoSesion, estaAutenticado } = useAuth();

  if (cargandoSesion) {
    return (
      <View style={styles.contenedor}>
        <ActivityIndicator color={colores.textoInvertido} size="large" />
        <Text style={styles.texto}>Preparando Ciudad Activa...</Text>
      </View>
    );
  }

  if (estaAutenticado) {
    return <Redirect href="/inicio" />;
  }

  return <Redirect href="/login" />;
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colores.fondoOscuro,
    gap: 16
  },
  texto: {
    color: colores.textoInvertido,
    fontSize: 16,
    fontWeight: '700'
  }
});