import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Alert, Animated, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Nota: este archivo usa expo-image-picker. Si no lo tienes instalado, ejecuta:
// npm install expo-image-picker
// y luego reinicia el bundler (expo start -c)

import { useProfile } from '../lib/profileContext';

export default function PerfilScreen() {
  const router = useRouter();
  // datos de ejemplo — en una app real vendrían del backend o de contexto/auth
  const [name] = React.useState('Juan Pérez');
  const [email, setEmail] = React.useState('juan.perez@example.com');
  const [phone, setPhone] = React.useState('+57 300 000 0000');
  const [editing, setEditing] = React.useState(false);
  const { imageUri, setImageUri } = useProfile();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const handleSave = () => {
    // Aquí solo actualizamos el estado local. En una app real deberías
    // subir la imagen/actualizar el perfil en el backend y persistir los cambios.
    Alert.alert('Perfil actualizado', 'Tus cambios se han guardado localmente.');
    console.log({ email, phone });
    setEditing(false);
  };

  const handleCancel = () => {
    setEditing(false);
  };

  useEffect(() => {
    // request permission for media library on mount (best-effort)
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          console.log('Permission to access media library was denied');
        }
      }
    })();
  }, []);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      // expo-image-picker returns different shapes depending on version; handle both
      // modern versions: { canceled: boolean, assets: [{ uri }] }
      // older versions: { cancelled: boolean, uri }
      // @ts-ignore - tolerate both shapes at runtime
      const canceled = result.canceled ?? result.cancelled;
      if (!canceled) {
        // @ts-ignore
        const uri = result.assets ? result.assets[0].uri : result.uri;
        setImageUri(uri);
        // trigger fade-in
        fadeAnim.setValue(0);
        Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
      }
    } catch (err) {
      console.warn('Image pick error', err);
    }
  };

  const confirmRemovePhoto = () => {
    Alert.alert('Eliminar foto', '¿Estás seguro de que quieres quitar tu foto de perfil?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: removePhoto },
    ]);
  };

  const removePhoto = () => {
    setImageUri(null);
    // small fade out effect
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }).start();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <View />
          <TouchableOpacity onPress={() => setEditing(true)} style={styles.editButton}>
            <Ionicons name="pencil" size={18} color="#2A3B4A" />
          </TouchableOpacity>
        </View>
        <View style={styles.avatarTopWrap}>
          <View style={styles.avatarRowTop}>
            <TouchableOpacity activeOpacity={0.8} onPress={pickImage} style={styles.avatarTouchable}>
              {imageUri ? (
                <Animated.Image source={{ uri: imageUri }} style={[styles.avatarPlaceholderTop, { opacity: fadeAnim }]} />
              ) : (
                <View style={styles.avatarPlaceholderTop}>
                  <Ionicons name="person-circle-outline" size={120} color="#62727A" />
                </View>
              )}
              <View style={styles.avatarEditBadge}>
                <Ionicons name="camera" size={14} color="#fff" />
              </View>
            </TouchableOpacity>

            {imageUri && (
              <TouchableOpacity style={styles.removePhotoBtn} onPress={confirmRemovePhoto}>
                <Ionicons name="trash" size={18} color="#fff" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.nameText}>{name}</Text>
          <View style={styles.rowField}>
            <Text style={styles.fieldLabel}>Correo</Text>
            {editing ? (
              <TextInput value={email} onChangeText={setEmail} style={styles.fieldInput} keyboardType="email-address" />
            ) : (
              <Text style={styles.fieldValue}>{email}</Text>
            )}
          </View>
          <View style={styles.rowField}>
            <Text style={styles.fieldLabel}>Teléfono</Text>
            {editing ? (
              <TextInput value={phone} onChangeText={setPhone} style={styles.fieldInput} keyboardType="phone-pad" />
            ) : (
              <Text style={styles.fieldValue}>{phone}</Text>
            )}
          </View>
          {editing && (
            <View style={styles.editActions}>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#ccc' }]} onPress={handleCancel}>
                <Text style={styles.actionText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#2A9D8F' }]} onPress={handleSave}>
                <Text style={[styles.actionText, styles.actionTextPrimary]}>Guardar</Text>
              </TouchableOpacity>
            </View>
          )}
  </View>

        {/* removed duplicate lower avatar/edit area (profile is view-only by default) */}
      </View>

      {/* Bottom navigation bar (same as Home/CrearMonto) */}
      <View style={styles.bottomNavWrap} pointerEvents="box-none">
        <View style={styles.bottomNav}>
          <TouchableOpacity style={[styles.navItem]} onPress={() => router.push('./homeScreen')}>
            <Ionicons name="home-outline" size={22} color="#2A3B4A" />
            <Text style={styles.navLabel}>Inicio</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.navItem]} onPress={() => router.push('./crearCategoria')}>
            <Ionicons name="folder-open-outline" size={22} color="#2A3B4A" />
            <Text style={styles.navLabel}>Categoria</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => router.push('./crearMonto')}>
            <Ionicons name="cash-outline" size={22} color="#2A3B4A" />
            <Text style={styles.navLabel}>Monto</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.navItem, styles.navActive]} onPress={() => router.push('./perfil')}>
            <Ionicons name="settings-outline" size={22} color="#2A3B4A" />
            <Text style={styles.navLabel}>Ajustes</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#E6F4FF' },
  container: { padding: 20 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 20, textAlign: 'center' },
  // existing avatar styles (kept for potential reuse)
  avatarRow: { flexDirection: 'row', alignItems: 'center' },
  avatarWrap: { width: 120, height: 120, marginRight: 18, position: 'relative' },
  avatar: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#eee' },
  avatarPlaceholder: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#F1F3F4', alignItems: 'center', justifyContent: 'center' },
  cameraButton: { position: 'absolute', right: -6, bottom: -6, backgroundColor: '#2A9D8F', width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', elevation: 3 },
  infoColumn: { flex: 1 },
  label: { fontSize: 12, color: '#6B7A82', marginBottom: 6 },
  input: { backgroundColor: '#F2F6F8', padding: 10, borderRadius: 8, fontSize: 16 },
  staticText: { fontSize: 16, color: '#22333B', paddingVertical: 6 },
  saveButton: { marginTop: 28, backgroundColor: '#2A9D8F', padding: 14, borderRadius: 12, alignItems: 'center' },
  saveButtonText: { color: 'white', fontWeight: '700' },

  // new styles for the view-only profile layout
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  editButton: { padding: 6 },
  avatarTopWrap: { alignItems: 'center', marginVertical: 26 },
  avatarRowTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  avatarTouchable: { alignItems: 'center', justifyContent: 'center' },
  avatarPlaceholderTop: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  avatarEditBadge: { position: 'absolute', right: 6, bottom: 6, backgroundColor: '#2A9D8F', width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', elevation: 4 },
  infoBox: { marginTop: 12, paddingHorizontal: 8 },
  removePhotoBtn: { marginLeft: 12, backgroundColor: '#E76F51', padding: 10, borderRadius: 8, alignItems: 'center', justifyContent: 'center', elevation: 3 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginTop: 8, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 10, shadowOffset: { width: 0, height: 6 }, elevation: 4 },
  nameText: { fontSize: 20, fontWeight: '700', textAlign: 'center', marginBottom: 12, fontFamily: 'SpaceGrotesk-Bold' },
  rowField: { marginBottom: 12 },
  fieldLabel: { fontSize: 12, color: '#666', marginBottom: 4, fontFamily: 'Montserrat' },
  fieldInput: { borderWidth: 1, borderColor: '#e6e6e6', padding: 8, borderRadius: 8, fontFamily: 'Montserrat' },
  fieldValue: { fontSize: 16, color: '#111', fontFamily: 'Montserrat-Bold' },
  editActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  actionBtn: { flex: 1, padding: 10, borderRadius: 8, alignItems: 'center', marginHorizontal: 6 },
  actionText: { fontFamily: 'Montserrat', color: '#22333B' },
  actionTextPrimary: { color: '#fff', fontFamily: 'Montserrat-Bold' },
  // bottom nav (shared)
  bottomNavWrap: { position: 'absolute', left: 0, right: 0, bottom: 18, alignItems: 'center' },
  bottomNav: { width: '92%', backgroundColor: '#E6F0F5', borderRadius: 18, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 6, height: 56 },
  navItem: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  navActive: { backgroundColor: '#D7EDF7', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  navLabel: { fontSize: 11, marginTop: 2, color: '#2A3B4A' },
  iconBg: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
});
