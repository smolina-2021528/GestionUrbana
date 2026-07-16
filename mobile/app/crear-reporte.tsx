import { router } from 'expo-router';
import {
  StyleSheet,
  Text,
  View
} from 'react-native';

import { Boton } from '../src/shared/components/Boton';
import { MensajeEstado } from '../src/shared/components/MensajeEstado';
import { Pantalla } from '../src/shared/components/Pantalla';
import { colores } from '../src/theme/colores';
import { espaciado } from '../src/theme/espaciado';

export default function CrearReporteScreen() {
  return (
    <Pantalla>
      <View style={styles.encabezado}>
        <Text style={styles.titulo}>Crear reporte</Text>
        <Text style={styles.descripcion}>
          En el siguiente commit se conectará esta pantalla con cámara, galería, ubicación GPS y
          envío al backend.
        </Text>
      </View>

      <MensajeEstado variante="info" titulo="Siguiente paso">
        Para mantener el proyecto ordenado, este primer commit deja lista la base ciudadana y la
        autenticación. El formulario completo de reporte se trabajará en el próximo commit.
      </MensajeEstado>

      <Boton variante="secundario" onPress={() => router.back()}>
        Volver
      </Boton>
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  encabezado: {
    gap: espaciado.sm,
    marginTop: espaciado.xl
  },
  titulo: {
    color: colores.texto,
    fontSize: 30,
    fontWeight: '900'
  },
  descripcion: {
    color: colores.textoSuave,
    fontSize: 16,
    lineHeight: 23
  }
});