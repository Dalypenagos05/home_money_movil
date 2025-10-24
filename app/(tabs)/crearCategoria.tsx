import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import IconGridDropdown, { IconName } from '../../components/IconGridDropdown';
import { addCategory } from '../lib/categories';



export default function CrearCategoria({ navigation }: { navigation: any }) {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [icono, setIcono] = useState<IconName | undefined>(undefined);

  const handleCrear = () => {
    console.log("Nuevo registro:", { nombre, icono });
    // add to in-memory categories so other screens can consume it during this session
    addCategory({ id: String(Date.now()), name: nombre || 'Sin nombre', subtitle: '', color: '#D7EDF7', icon: icono || 'pricetag-outline' });
    alert("Categoría creada con éxito 🎉");
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 90 }}>
        <Text style={styles.title}>Crear categoría</Text>

        <Text style={styles.label}>Nombre de la categoría</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: Hogar"
          value={nombre}
          onChangeText={setNombre}
        />

        <Text style={styles.label}>Icono</Text>
        <IconGridDropdown selectedIcon={icono} onSelect={setIcono} />

        <TouchableOpacity style={styles.button} onPress={handleCrear}>
          <Text style={styles.buttonText}>Crear categoría</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.bottomNavWrap} pointerEvents="box-none">
        <View style={styles.bottomNav}>
            <TouchableOpacity style={[styles.navItem]} onPress={() => router.push('./homeScreen')}>
              <Ionicons name="home-outline" size={22} color="#2A3B4A" />
              <Text style={styles.navLabel}>Inicio</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.navItem, styles.navActive]} onPress={() => router.push('./crearCategoria')}>
              <Ionicons name="folder-open-outline" size={22} color="#2A3B4A" />
              <Text style={styles.navLabel}>Categoria</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navItem} onPress={() => router.push('./crearMonto')}>
              <Ionicons name="cash-outline" size={22} color="#2A3B4A" />
              <Text style={styles.navLabel}>Monto</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navItem} onPress={() => router.push('./blog')}>
              <Ionicons name="newspaper-outline" size={22} color="#2A3B4A" />
              <Text style={styles.navLabel}>Blog</Text>
            </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ffffffff" },
  title: { fontSize: 22, fontWeight: "bold", textAlign: "center", marginVertical: 20 },
  label: { marginLeft: 25, marginBottom: 8, fontSize: 14, fontWeight: "500" },
  input: {
    backgroundColor: "#D5DEE8",
    marginHorizontal: 20,
    padding: 14,
    borderRadius: 8,
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#79A9E1",
    marginHorizontal: 90,
    padding: 15,
    borderRadius: 12,
    marginTop: 10,
    shadowColor: "#000",
    elevation: 4,
  },
  buttonText: { color: "white", fontWeight: "600", textAlign: "center" },
  bottomNavWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 18,
    alignItems: 'center',
  },
  bottomNav: {
    width: '92%',
    backgroundColor: '#E6F0F5',
    borderRadius: 18,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 6,
    height: 56,
  },
  navItem: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  navActive: {
    backgroundColor: '#D7EDF7',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  navIcon: { fontSize: 18 },
  navLabel: { fontSize: 11, marginTop: 2, color: '#2A3B4A' },
  iconBg: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  iconBgActive: { backgroundColor: '#D7EDF7' },
});
