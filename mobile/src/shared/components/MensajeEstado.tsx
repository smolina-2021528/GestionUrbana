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

function obtenerColor(variante: VarianteMensaje) {
  if (variante === 'exito') return colores.exito;
  if (variante === 'advertencia') return colores.advertencia;
  if (variante === 'error') return colores.error;
  return colores.primario;
}

export function MensajeEstado({
  titulo,
  children,
  variante = 'info'
}: PropiedadesMensajeEstado) {
  const color = obtenerColor(variante);

  return (
    <View style={[styles.contenedor, { borderColor: color }]}>
      {titulo ? <Text style={[styles.titulo, { color }]}>{titulo}</Text> : null}
      <Text style={styles.texto}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    borderLeftWidth: 4,
    backgroundColor: colores.tarjeta,
    borderRadius: 14,
    padding: espaciado.lg,
    gap: espaciado.xs
  },
  titulo: {
    fontSize: 15,
    fontWeight: '800'
  },
  texto: {
    color: colores.textoSuave,
    fontSize: 14,
    lineHeight: 20
  }
});