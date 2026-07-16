import type { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colores } from '../../theme/colores';
import { espaciado } from '../../theme/espaciado';

type PropiedadesPantalla = {
  children: ReactNode;
  scroll?: boolean;
};

export function Pantalla({ children, scroll = true }: PropiedadesPantalla) {
  const contenido = scroll ? (
    <ScrollView
      contentContainerStyle={styles.contenidoScroll}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  ) : (
    <View style={styles.contenidoFijo}>{children}</View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {contenido}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colores.fondo
  },
  keyboard: {
    flex: 1
  },
  contenidoScroll: {
    flexGrow: 1,
    padding: espaciado.xl,
    gap: espaciado.lg
  },
  contenidoFijo: {
    flex: 1,
    padding: espaciado.xl,
    gap: espaciado.lg
  }
});