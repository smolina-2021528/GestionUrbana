import { Redirect } from 'expo-router';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View
} from 'react-native';

import { useAuth } from '../src/modules/auth/hooks/useAuth';
import { colores } from '../src/theme/colores';

export default function IndexScreen() {
  const { cargando, autenticado } = useAuth();

  if (cargando) {
    return (
      <View style={styles.contenedor}>
        <ActivityIndicator color={colores.textoInvertido} size="large" />
        <Text style={styles.texto}>Preparando Ciudad Activa...</Text>
      </View>
    );
  }

  if (autenticado) {
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