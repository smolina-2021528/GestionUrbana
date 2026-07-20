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
  ayuda?: string;
};

export function CampoTexto({
  etiqueta,
  error,
  ayuda,
  style,
  ...props
}: PropiedadesCampoTexto) {
  const tieneError = Boolean(error);

  return (
    <View style={styles.contenedor}>
      <View style={styles.encabezado}>
        <Text style={styles.etiqueta}>{etiqueta}</Text>

        {props.editable === false ? (
          <Text style={styles.etiquetaBloqueado}>Protegido</Text>
        ) : null}
      </View>

      <TextInput
        placeholderTextColor="#94A3B8"
        accessibilityLabel={props.accessibilityLabel ?? etiqueta}
        accessibilityHint={error ?? ayuda}
        accessibilityState={{
          disabled: props.editable === false
        }}
        style={[
          styles.input,
          tieneError ? styles.inputError : null,
          props.editable === false ? styles.inputDeshabilitado : null,
          style
        ]}
        {...props}
      />

      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : ayuda ? (
        <Text style={styles.ayuda}>{ayuda}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    gap: espaciado.sm
  },
  encabezado: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: espaciado.sm
  },
  etiqueta: {
    color: colores.texto,
    fontSize: 14,
    fontWeight: '800'
  },
  etiquetaBloqueado: {
    color: colores.textoSuave,
    fontSize: 12,
    fontWeight: '800'
  },
  input: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: colores.borde,
    borderRadius: 16,
    paddingHorizontal: espaciado.lg,
    paddingVertical: espaciado.md,
    backgroundColor: colores.tarjeta,
    color: colores.texto,
    fontSize: 16,
    shadowColor: '#0F172A',
    shadowOpacity: 0.03,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4
    },
    elevation: 1
  },
  inputError: {
    borderColor: colores.error,
    backgroundColor: '#FEF2F2'
  },
  inputDeshabilitado: {
    backgroundColor: '#F1F5F9',
    color: colores.textoSuave
  },
  error: {
    color: colores.error,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18
  },
  ayuda: {
    color: colores.textoSuave,
    fontSize: 13,
    lineHeight: 18
  }
});