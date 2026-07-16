import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text
} from 'react-native';

import { colores } from '../../theme/colores';
import { espaciado } from '../../theme/espaciado';

type VarianteBoton = 'primario' | 'secundario' | 'fantasma' | 'peligro';

type PropiedadesBoton = {
  children: ReactNode;
  variante?: VarianteBoton;
  cargando?: boolean;
  deshabilitado?: boolean;
  onPress?: () => void;
};

function obtenerEstiloVariante(variante: VarianteBoton) {
  if (variante === 'secundario') {
    return {
      contenedor: styles.secundario,
      texto: styles.textoSecundario
    };
  }

  if (variante === 'fantasma') {
    return {
      contenedor: styles.fantasma,
      texto: styles.textoFantasma
    };
  }

  if (variante === 'peligro') {
    return {
      contenedor: styles.peligro,
      texto: styles.textoPrimario
    };
  }

  return {
    contenedor: styles.primario,
    texto: styles.textoPrimario
  };
}

export function Boton({
  children,
  variante = 'primario',
  cargando = false,
  deshabilitado = false,
  onPress
}: PropiedadesBoton) {
  const estilosVariante = obtenerEstiloVariante(variante);
  const estaDeshabilitado = deshabilitado || cargando;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={estaDeshabilitado}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        estilosVariante.contenedor,
        estaDeshabilitado ? styles.deshabilitado : null,
        pressed && !estaDeshabilitado ? styles.presionado : null
      ]}
    >
      {cargando ? (
        <ActivityIndicator color={variante === 'primario' || variante === 'peligro' ? '#FFFFFF' : colores.primario} />
      ) : (
        <Text style={[styles.texto, estilosVariante.texto]}>{children}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    borderRadius: 14,
    paddingHorizontal: espaciado.lg,
    alignItems: 'center',
    justifyContent: 'center'
  },
  primario: {
    backgroundColor: colores.primario
  },
  secundario: {
    backgroundColor: '#DBEAFE'
  },
  fantasma: {
    backgroundColor: 'transparent'
  },
  peligro: {
    backgroundColor: colores.error
  },
  deshabilitado: {
    opacity: 0.55
  },
  presionado: {
    opacity: 0.85
  },
  texto: {
    fontSize: 16,
    fontWeight: '700'
  },
  textoPrimario: {
    color: colores.textoInvertido
  },
  textoSecundario: {
    color: colores.primarioOscuro
  },
  textoFantasma: {
    color: colores.primario
  }
});