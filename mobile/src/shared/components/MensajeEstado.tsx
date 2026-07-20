import type { ReactNode } from 'react';
import {
  StyleSheet,
  Text,
  View
} from 'react-native';

import { colores } from '../../theme/colores';
import { espaciado } from '../../theme/espaciado';

type VarianteMensaje = 'info' | 'exito' | 'advertencia' | 'error';

type PropiedadesMensajeEstado = {
  titulo?: string;
  children: ReactNode;
  variante?: VarianteMensaje;
};

function obtenerTema(variante: VarianteMensaje) {
  if (variante === 'exito') {
    return {
      color: colores.exito,
      fondo: '#ECFDF5',
      borde: '#BBF7D0'
    };
  }

  if (variante === 'advertencia') {
    return {
      color: colores.advertencia,
      fondo: '#FFFBEB',
      borde: '#FDE68A'
    };
  }

  if (variante === 'error') {
    return {
      color: colores.error,
      fondo: '#FEF2F2',
      borde: '#FECACA'
    };
  }

  return {
    color: colores.primario,
    fondo: '#EFF6FF',
    borde: '#BFDBFE'
  };
}

export function MensajeEstado({
  titulo,
  children,
  variante = 'info'
}: PropiedadesMensajeEstado) {
  const tema = obtenerTema(variante);

  return (
    <View
      accessibilityRole="summary"
      style={[
        styles.contenedor,
        {
          backgroundColor: tema.fondo,
          borderColor: tema.borde
        }
      ]}
    >
      <View style={[styles.indicador, { backgroundColor: tema.color }]} />

      <View style={styles.contenido}>
        {titulo ? <Text style={[styles.titulo, { color: tema.color }]}>{titulo}</Text> : null}
        <Text style={styles.texto}>{children}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderRadius: 18,
    padding: espaciado.lg,
    paddingLeft: espaciado.xl,
    shadowColor: '#0F172A',
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 6
    },
    elevation: 1
  },
  indicador: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: 5
  },
  contenido: {
    gap: espaciado.xs
  },
  titulo: {
    fontSize: 15,
    fontWeight: '900'
  },
  texto: {
    color: colores.texto,
    fontSize: 14,
    lineHeight: 21
  }
});