import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from "react";
import { Alert, Animated, Easing, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import IconGridDropdown, { IconName } from '../../components/IconGridDropdown';
import { createCategoria, deleteCategoria, getCategoriasByUser, updateCategoria } from '../../database/db';
import { useAuth } from '../lib/authContext';

const COLOR_OPTIONS = ['#D7EDF7', '#7ED9FF', '#0B6B6B', '#79A9E1', '#9D8F86', '#F7C6C6', '#F2D8C2'];

type Category = {
  id_categoria: number;
  nombre: string;
  icono?: string;
  color?: string;
  id_usu: number;
};

export default function CrearCategoria() {
  const router = useRouter();
  const { user } = useAuth(); // Get current user
  
  const [nombre, setNombre] = useState("");
  const [icono, setIcono] = useState<IconName | undefined>(undefined);
  const [color, setColor] = useState<string>('#D7EDF7');
  const [errors, setErrors] = useState<{ nombre?: boolean; icono?: boolean }>({});
  const scaleRefs = useRef<Record<string, Animated.Value>>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Load categories when component mounts or user changes
  useEffect(() => {
    if (user) {
      loadCategories();
    }
  }, [user]);

  const loadCategories = async () => {
    if (!user) return;
    try {
      const cats = getCategoriasByUser(user.id_usu) as Category[];
      setCategories(cats);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  useEffect(() => {
    // initialize Animated.Values for each color option
    COLOR_OPTIONS.forEach((c) => {
      if (!scaleRefs.current[c]) scaleRefs.current[c] = new Animated.Value(1);
    });
  }, []);

  const animateSwatch = (c: string) => {
    const v = scaleRefs.current[c];
    if (!v) return;
    Animated.sequence([
      Animated.timing(v, { toValue: 1.18, duration: 160, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(v, { toValue: 1, duration: 160, easing: Easing.in(Easing.quad), useNativeDriver: true }),
    ]).start();
  };

  const getContrastColor = (hex: string) => {
    const h = hex.replace('#', '');
    const r = parseInt(h.substring(0, 2), 16);
    const g = parseInt(h.substring(2, 4), 16);
    const b = parseInt(h.substring(4, 6), 16);
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
    return luminance < 140 ? '#ffffff' : '#13233A';
  };

  const handleCrear = async () => {
    // Check if user is logged in
    if (!user) {
      Alert.alert('Error', 'Debes iniciar sesión para crear categorías');
      router.push('./login');
      return;
    }

    // Validate required fields
    const missing: string[] = [];
    if (!nombre || !nombre.trim()) missing.push('Nombre');
    if (!icono) missing.push('Icono');

    if (missing.length > 0) {
      setErrors({ nombre: missing.includes('Nombre'), icono: missing.includes('Icono') });
      Alert.alert('Campos incompletos', `Por favor completa: ${missing.join(', ')}`);
      return;
    }

    try {
      if (editingId) {
        // Update existing category
        updateCategoria(editingId, {
          nombre: nombre.trim(),
          icono: icono,
          color: color,
        });
        Alert.alert('Éxito', 'Categoría actualizada 🎉');
        setEditingId(null);
      } else {
        // Create new category
        createCategoria({
          nombre: nombre.trim(),
          id_usu: user.id_usu,
          icono: icono,
          color: color,
        });
        Alert.alert('Éxito', 'Categoría creada con éxito 🎉');
      }

      // Reload categories from database
      await loadCategories();

      // Clear form
      setNombre('');
      setIcono(undefined);
      setColor(COLOR_OPTIONS[0]);
      setErrors({});
    } catch (error) {
      console.error("Error saving category:", error);
      Alert.alert('Error', 'No se pudo guardar la categoría. Inténtalo de nuevo.');
    }
  };

  const handleDelete = (id: number, name: string) => {
    Alert.alert('Eliminar categoría', `¿Eliminar "${name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            deleteCategoria(id);
            await loadCategories();
            if (editingId === id) {
              setEditingId(null);
              setNombre('');
              setIcono(undefined);
              setColor(COLOR_OPTIONS[0]);
            }
          } catch (error) {
            console.error('Error deleting category:', error);
            Alert.alert('Error', 'No se pudo eliminar la categoría');
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Text style={styles.header}>Crear categoría</Text>
          {editingId ? <View style={styles.editBadge}><Text style={styles.editBadgeText}>Editando</Text></View> : null}
        </View>

        <View style={styles.formCard}>
          <Text style={styles.label}>Nombre</Text>
          <TextInput
            style={[styles.input, errors.nombre ? styles.inputError : null]}
            placeholder="Ej: Hogar"
            value={nombre}
            onChangeText={(t) => { setNombre(t); setErrors(prev => ({ ...prev, nombre: false })); }}
          />
          {errors.nombre ? <Text style={styles.errorText}>El nombre es requerido.</Text> : null}

          <Text style={styles.label}>Icono</Text>
          <TouchableOpacity style={[styles.selectBox, errors.icono ? styles.inputError : null]}>
            <IconGridDropdown selectedIcon={icono} onSelect={(i) => { setIcono(i); setErrors(prev => ({ ...prev, icono: false })); }} />
          </TouchableOpacity>
          {errors.icono ? <Text style={styles.errorText}>Selecciona un icono.</Text> : null}

          <Text style={styles.label}>Color</Text>
          <View style={styles.colorsRow}>
            {COLOR_OPTIONS.map((c) => {
              const scale = scaleRefs.current[c] ?? new Animated.Value(1);
              const isSelected = color === c;
              return (
                <TouchableOpacity key={c} onPress={() => { setColor(c); animateSwatch(c); }} activeOpacity={0.8}>
                  <Animated.View
                    style={[
                      styles.colorSwatch,
                      { backgroundColor: c, transform: [{ scale }] },
                      isSelected ? styles.colorSwatchSelected : null,
                    ]}
                  >
                    {isSelected && (
                      <Ionicons name="checkmark" size={16} color={getContrastColor(c)} />
                    )}
                  </Animated.View>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.actionsRow}>
            <TouchableOpacity style={[styles.primaryBtn, editingId ? styles.primaryBtnEdit : null]} onPress={handleCrear}>
              <Ionicons name={editingId ? 'save-outline' : 'add-circle-outline'} size={18} color="#ffffffff" />
              <Text style={styles.primaryBtnText}>{editingId ? ' Guardar cambios' : ' Crear categoría'}</Text>
            </TouchableOpacity>
            {editingId ? (
              <TouchableOpacity style={styles.cancelBtn} onPress={() => { setEditingId(null); setNombre(''); setIcono(undefined); setColor(COLOR_OPTIONS[0]); setErrors({}); }}>
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        <Text style={styles.sectionTitle}>Tus categorías</Text>
        <FlatList
          data={categories}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.catList}
          keyExtractor={(item) => item.id_categoria.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => {
                setNombre(item.nombre);
                setIcono(item.icono as IconName);
                setColor(item.color ?? COLOR_OPTIONS[0]);
                setEditingId(item.id_categoria);
              }}
              onLongPress={() => handleDelete(item.id_categoria, item.nombre)}
            >
              <View style={[styles.catCard, { backgroundColor: item.color ?? '#fff' }]}>
                <View style={styles.catIconWrap}>
                  <Ionicons name={(item.icono || 'folder-outline') as any} size={20} color={getContrastColor(item.color ?? '#fff')} />
                </View>
                <Text style={styles.catName}>{item.nombre}</Text>
              </View>
            </TouchableOpacity>
          )}
        />

        <View style={{ flex: 1 }} />

        <View style={styles.bottomNavWrap} pointerEvents="box-none">
          <View style={styles.bottomNav}>
            <TouchableOpacity style={styles.navItem} onPress={() => router.push('./homeScreen')}>
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
            <TouchableOpacity style={styles.navItem} onPress={() => router.push('./perfil')}>
              <Ionicons name="settings-outline" size={22} color="#2A3B4A" />
              <Text style={styles.navLabel}>Ajustes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#ffffffff' },
  container: { flex: 1, backgroundColor: "#F3EFEA" },
  header: { fontSize: 20, fontFamily: 'SpaceGrotesk-Bold', color: '#13233A', marginTop: 18, textAlign: 'center' },
  formCard: {
    margin: 16,
    backgroundColor: '#F7FBFB',
    borderRadius: 14,
    padding: 14,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 4,
    overflow: 'hidden',
  },
  title: { fontSize: 22, fontWeight: "bold", textAlign: "center", marginVertical: 20, fontFamily: 'SpaceGrotesk-Bold' },
  label: { marginLeft: 6, marginBottom: 8, fontSize: 14, fontWeight: "600", color: '#13233A', fontFamily: 'Montserrat-Bold' },
  input: {
    backgroundColor: "#DDE8EE",
    marginHorizontal: 0,
    padding: 12,
    borderRadius: 10,
    marginBottom: 14,
    fontFamily: 'Montserrat',
  },
  selectBox: {
    backgroundColor: '#EAF4F6',
    padding: 8,
    borderRadius: 10,
    marginBottom: 14,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A1B41',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginTop: 8,
  },
  primaryBtnText: { fontSize: 15, color: '#ffffffff', fontFamily: 'Montserrat-Bold' },
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
  navLabel: { fontSize: 11, marginTop: 2, color: '#2A3B4A', fontFamily: 'Montserrat-Bold' },
  iconBg: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  iconBgActive: { backgroundColor: '#D7EDF7' },
  colorsRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12, paddingHorizontal: 2 },
  colorSwatch: { width: 36, height: 36, borderRadius: 18, borderWidth: 2, borderColor: 'transparent', marginRight: 10, marginBottom: 8 },
  colorSwatchSelected: { borderColor: '#13233A' },
  inputError: { borderColor: '#E53935', borderWidth: 1.6 },
  errorText: { color: '#E53935', marginTop: 6, marginLeft: 6, fontSize: 12, fontFamily: 'Montserrat' },
  sectionTitle: { fontSize: 16, fontFamily: 'SpaceGrotesk-Bold', marginLeft: 16, marginTop: 6, marginBottom: 8, color: '#13233A' },
  catList: { paddingHorizontal: 12 },
  catCard: { width: 120, height: 72, borderRadius: 10, marginRight: 12, padding: 10, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' },
  catIconWrap: { width: 36, height: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  catName: { fontSize: 13, fontFamily: 'Montserrat-Bold', color: '#13233A' },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  editBadge: { backgroundColor: '#0B6B6B', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, marginLeft: 8 },
  editBadgeText: { color: '#fff', fontSize: 12, fontFamily: 'Montserrat-Bold' },
  primaryBtnEdit: { backgroundColor: '#0B6B6B' },
  actionsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', gap: 10, marginTop: 8 },
  cancelBtn: { marginLeft: 8, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#D0D7DA' },
  cancelBtnText: { color: '#2A3B4A', fontFamily: 'Montserrat-Bold' },
});
