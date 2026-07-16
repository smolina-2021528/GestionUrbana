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

export default function MisReportesScreen() {
  return (
    <Pantalla>
      <View style={styles.encabezado}>
        <Text style={styles.titulo}>Mis reportes</Text>
        <Text style={styles.descripcion}>
          En el siguiente bloque de trabajo se conectará esta pantalla con el endpoint ciudadano
          de reportes.
        </Text>
      </View>

      <MensajeEstado variante="info" titulo="Pendiente de conexión">
        Esta pantalla queda creada para que la navegación ciudadana ya sea funcional. La carga real
        de reportes se agregará en un commit separado.
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