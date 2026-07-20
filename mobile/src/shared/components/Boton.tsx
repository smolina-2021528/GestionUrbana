import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View
} from 'react-native';

import { colores } from '../../theme/colores';
import { espaciado } from '../../theme/espaciado';

type VarianteBoton = 'primario' | 'secundario' | 'fantasma' | 'peligro';
type TamanoBoton = 'md' | 'lg';

type PropiedadesBoton = {
  children: ReactNode;
  variante?: VarianteBoton;
  tamano?: TamanoBoton;
  cargando?: boolean;
  deshabilitado?: boolean;
  onPress?: () => void;
};

function obtenerEstiloVariante(variante: VarianteBoton) {
  if (variante === 'secundario') {
    return {
      contenedor: styles.secundario,
      texto: styles.textoSecundario,
      indicador: colores.primario
    };
  }

  if (variante === 'fantasma') {
    return {
      contenedor: styles.fantasma,
      texto: styles.textoFantasma,
      indicador: colores.primario
    };
  }

  if (variante === 'peligro') {
    return {
      contenedor: styles.peligro,
      texto: styles.textoPrimario,
      indicador: colores.textoInvertido
    };
  }

  return {
    contenedor: styles.primario,
    texto: styles.textoPrimario,
    indicador: colores.textoInvertido
  };
}

function obtenerEstiloTamano(tamano: TamanoBoton) {
  if (tamano === 'lg') {
    return styles.baseGrande;
  }

  return styles.baseMediano;
}

export function Boton({
  children,
  variante = 'primario',
  tamano = 'md',
  cargando = false,
  deshabilitado = false,
  onPress
}: PropiedadesBoton) {
  const estilosVariante = obtenerEstiloVariante(variante);
  const estaDeshabilitado = deshabilitado || cargando;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{
        disabled: estaDeshabilitado,
        busy: cargando
      }}
      disabled={estaDeshabilitado}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        obtenerEstiloTamano(tamano),
        estilosVariante.contenedor,
        estaDeshabilitado ? styles.deshabilitado : null,
        pressed && !estaDeshabilitado ? styles.presionado : null
      ]}
    >
      <View style={styles.contenido}>
        {cargando ? (
          <ActivityIndicator color={estilosVariante.indicador} />
        ) : (
          <Text style={[styles.texto, estilosVariante.texto]} numberOfLines={2}>
            {children}
          </Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4
    },
    elevation: 2
  },
  baseMediano: {
    minHeight: 48,
    paddingHorizontal: espaciado.lg
  },
  baseGrande: {
    minHeight: 56,
    paddingHorizontal: espaciado.xl
  },
  contenido: {
    minHeight: 24,
    alignItems: 'center',
    justifyContent: 'center'
  },
  primario: {
    backgroundColor: colores.primario
  },
  secundario: {
    backgroundColor: '#DBEAFE',
    shadowOpacity: 0.03,
    elevation: 1
  },
  fantasma: {
    backgroundColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0
  },
  peligro: {
    backgroundColor: colores.error
  },
  deshabilitado: {
    opacity: 0.55,
    shadowOpacity: 0,
    elevation: 0
  },
  presionado: {
    opacity: 0.88,
    transform: [
      {
        scale: 0.985
      }
    ]
  },
  texto: {
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center'
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