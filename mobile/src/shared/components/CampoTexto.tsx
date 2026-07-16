import type { TextInputProps } from 'react-native';
import {
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';

import { colores } from '../../theme/colores';
import { espaciado } from '../../theme/espaciado';

type PropiedadesCampoTexto = TextInputProps & {
  etiqueta: string;
  error?: string;
};

export function CampoTexto({
  etiqueta,
  error,
  style,
  ...props
}: PropiedadesCampoTexto) {
  return (
    <View style={styles.contenedor}>
      <Text style={styles.etiqueta}>{etiqueta}</Text>

      <TextInput
        placeholderTextColor="#94A3B8"
        style={[
          styles.input,
          error ? styles.inputError : null,
          style
        ]}
        {...props}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    gap: espaciado.sm
  },
  etiqueta: {
    color: colores.texto,
    fontSize: 14,
    fontWeight: '700'
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colores.borde,
    borderRadius: 14,
    paddingHorizontal: espaciado.lg,
    backgroundColor: colores.tarjeta,
    color: colores.texto,
    fontSize: 16
  },
  inputError: {
    borderColor: colores.error
  },
  error: {
    color: colores.error,
    fontSize: 13
  }
});