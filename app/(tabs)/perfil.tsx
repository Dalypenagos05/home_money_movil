import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Alert, Animated, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

// Nota: este archivo usa expo-image-picker. Si no lo tienes instalado, ejecuta:
// npm install expo-image-picker
// y luego reinicia el bundler (expo start -c)

import { updateUser } from '../../database/db'; // add
import { useAuth } from '../lib/authContext';
import { useProfile } from '../lib/profileContext';

export default function PerfilScreen() {
  const { user, setUser } = useAuth(); // include setUser
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [name, setName] = React.useState(user ? `${user.nombre} ${user.apellido}` : '');
  const [email, setEmail] = React.useState(user?.correo ?? '');
  const [phone, setPhone] = React.useState(user?.telefono ?? '');
  const [editing, setEditing] = React.useState(false);
  const [saving, setSaving] = React.useState(false); // add
  const { imageUri, setImageUri } = useProfile();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const handleSave = async () => {
    if (!user) {
      Alert.alert('Error', 'No hay un usuario activo.');
      return;
    }
    const emailTrim = email.trim().toLowerCase();
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrim);
    if (!emailOk) {
      Alert.alert('Correo inválido', 'Ingrese un correo válido.');
      return;
    }
    if (!phone.trim()) {
      Alert.alert('Teléfono inválido', 'Ingrese un teléfono.');
      return;
    }

    try {
      setSaving(true);
      // persist to DB
      updateUser(user.id_usu, { correo: emailTrim, telefono: phone.trim() });

      // update context (persists to AsyncStorage via AuthProvider)
      setUser({ ...user, correo: emailTrim, telefono: phone.trim() });

      Alert.alert('Perfil actualizado', 'Tus cambios se han guardado.');
      setEditing(false);
    } catch (err: any) {
      const msg = String(err?.message ?? '');
      if (msg.includes('UNIQUE constraint failed') && msg.includes('usuario.correo')) {
        Alert.alert('Correo en uso', 'Ya existe una cuenta con ese correo.');
      } else {
        Alert.alert('Error', 'No se pudo guardar los cambios.');
      }
      console.warn('updateUser error', err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
  };

  useEffect(() => {
    if (user) {
      setName(`${user.nombre} ${user.apellido}`);
      setEmail(user.correo ?? '');
      setPhone(user.telefono ?? '');
    }
  }, [user]);

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

  useEffect(() => {
    if (user?.foto_uri) setImageUri(user.foto_uri);
  }, [user?.foto_uri]);

  // Helper to support both old (MediaTypeOptions) and new (MediaType) APIs
  const pickerImagesMediaType = () => {
    const anyPicker = ImagePicker as any;
    if (anyPicker?.MediaType?.Images) return anyPicker.MediaType.Images;            // new API
    if (anyPicker?.MediaTypeOptions?.Images) return anyPicker.MediaTypeOptions.Images; // old API
    return undefined; // let ImagePicker default if neither exists
  };

  const pickImage = async () => {
    try {
      // request & pick
      const result: any = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: (ImagePicker as any)?.MediaType?.Images ?? (ImagePicker as any)?.MediaTypeOptions?.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.9,
      });
      const canceled = result.canceled ?? result.cancelled;
      if (canceled || !user) return;

      const asset = result.assets?.[0];
      const src = asset?.uri ?? result.uri;
      if (!src) return;

      // Create a real file in app storage (avoids content:// issues)
      const manipulated = await ImageManipulator.manipulateAsync(
        src,
        [], // no ops; just re-encode to get a file:// uri we control
        { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG }
      );

      const dir = `${FileSystem.documentDirectory}profile/`;
      await FileSystem.makeDirectoryAsync(dir, { intermediates: true }).catch(() => {});
      const dest = `${dir}hm_user_${user.id_usu}.jpg`;

      await FileSystem.copyAsync({ from: manipulated.uri, to: dest });

      // Update DB + context
      updateUser(user.id_usu, { foto_uri: dest });
      setUser({ ...user, foto_uri: dest });
      setImageUri(dest);

      fadeAnim.setValue(0);
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
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

  const removePhoto = async () => {
    try {
      if (user?.foto_uri) {
        const info = await FileSystem.getInfoAsync(user.foto_uri);
        if (info.exists) await FileSystem.deleteAsync(user.foto_uri, { idempotent: true });
      }
      if (user) {
        updateUser(user.id_usu, { foto_uri: null });
        setUser({ ...user, foto_uri: null });
      }
      setImageUri(null);
      fadeAnim.setValue(0);
      Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }).start();
    } catch (e) {
      console.warn('removePhoto error', e);
    }
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
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: '#2A9D8F' }, saving && { opacity: 0.6 }]}
                onPress={handleSave}
                disabled={saving}
              >
                <Text style={[styles.actionText, styles.actionTextPrimary]}>
                  {saving ? 'Guardando...' : 'Guardar'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
  </View>

        {/* Bottom navigation bar */}
        <View style={[styles.bottomNavWrap, { bottom: Math.max(12, insets.bottom + 8) }]} pointerEvents="box-none">
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
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#E6F4FF' },
  container: { flex: 1, position: 'relative', padding: 20, paddingBottom: 100 }, // ensure full height + space for nav
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
  bottomNavWrap: { position: 'absolute', left: 0, right: 0, alignItems: 'center' }, // bottom set dynamically
  bottomNav: { width: '92%', backgroundColor: '#E6F0F5', borderRadius: 18, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 6, height: 56 },
  navItem: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  navActive: { backgroundColor: '#D7EDF7', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  navLabel: { fontSize: 11, marginTop: 2, color: '#2A3B4A' },
  iconBg: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
});
