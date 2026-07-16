import { router } from 'expo-router';
import {
  StyleSheet,
  Text,
  View
} from 'react-native';

import { Boton } from '../src/shared/components/Boton';
import { MensajeEstado } from '../src/shared/components/MensajeEstado';
import { Pantalla } from '../src/shared/components/Pantalla';
import { useAuth } from '../src/modules/auth/hooks/useAuth';
import { colores } from '../src/theme/colores';
import { espaciado } from '../src/theme/espaciado';

export default function InicioScreen() {
  const { usuario, cerrarSesion } = useAuth();

  const nombre = usuario?.name ?? 'Ciudadano';

  return (
    <Pantalla>
      <View style={styles.encabezado}>
        <Text style={styles.marca}>Ciudad Activa</Text>
        <Text style={styles.titulo}>Hola, {nombre}</Text>
        <Text style={styles.descripcion}>
          Desde esta app podrás crear reportes urbanos y consultar el avance de tus casos.
        </Text>
      </View>

      <MensajeEstado variante="info" titulo="App ciudadana">
        Esta aplicación móvil está diseñada únicamente para usuarios ciudadanos. La gestión
        administrativa continuará en la versión web.
      </MensajeEstado>

      <View style={styles.tarjeta}>
        <Text style={styles.tarjetaTitulo}>Acciones principales</Text>

        <Boton onPress={() => router.push('/crear-reporte')}>
          Crear reporte
        </Boton>

        <Boton variante="secundario" onPress={() => router.push('/mis-reportes')}>
          Ver mis reportes
        </Boton>
      </View>

      <View style={styles.tarjeta}>
        <Text style={styles.tarjetaTitulo}>Tu cuenta</Text>
        <Text style={styles.textoDato}>{usuario?.email}</Text>

        <Boton variante="fantasma" onPress={() => void cerrarSesion()}>
          Cerrar sesión
        </Boton>
      </View>
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  encabezado: {
    gap: espaciado.sm,
    marginTop: espaciado.xl
  },
  marca: {
    color: colores.primario,
    fontSize: 16,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1
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
  },
  tarjeta: {
    backgroundColor: colores.tarjeta,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colores.borde,
    padding: espaciado.lg,
    gap: espaciado.md
  },
  tarjetaTitulo: {
    color: colores.texto,
    fontSize: 18,
    fontWeight: '900'
  },
  textoDato: {
    color: colores.textoSuave,
    fontSize: 15
  }
});