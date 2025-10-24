import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, Modal, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getCategories } from '../lib/categories';

type Category = { id: string; name: string; subtitle?: string; color?: string; icon?: string };

export default function CrearMonto() {
  // navigation hook
  const router = useRouter();
  const [categories, setCategories] = React.useState<Category[]>(() => getCategories());
  const [categoria, setCategoria] = React.useState<Category | null>(categories[0] ?? null);
  const [openCat, setOpenCat] = React.useState(false);
  const [rawAmount, setRawAmount] = React.useState(''); // store digits only
  const [descripcion, setDescripcion] = React.useState('');
  const [date, setDate] = React.useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = React.useState(false);
  const [type, setType] = React.useState<'ingreso' | 'egreso'>('egreso');

  React.useEffect(() => {
    setCategories(getCategories());
  }, []);

  const formatCurrency = (digits?: string): string => {
    if (!digits) return '';
    const n = Number(digits);
    try {
      return new Intl.NumberFormat('es-CO').format(n);
    } catch {
      return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    }
  };

  const onChangeAmount = (text: string) => setRawAmount(text.replace(/[^0-9]/g, ''));
  const showPicker = () => setShowDatePicker(true);
  const onDateChange = (_e: any, d?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (d) setDate(d);
  };

  const handleRegistrar = () => {
    const montoNumber = Number(rawAmount || 0);
    console.log('Registrar monto', { categoria, tipo: type, monto: montoNumber, descripcion, fecha: date });
    alert('Monto registrado (demo)');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.header}>Crear</Text>

        <View style={styles.formCard}>
          <Text style={styles.label}>Categoria</Text>
          <TouchableOpacity style={styles.selectBox} onPress={() => setOpenCat(true)}>
            <View style={[styles.selectIcon, { backgroundColor: categoria?.color ?? '#D7EFFF' }]}> 
              <Ionicons name={(categoria?.icon as any) ?? 'pricetag-outline'} size={18} color="#fff" />
            </View>
            <Text style={styles.selectText}>{categoria?.name ?? 'Selecciona categoría'}</Text>
            <Ionicons name="chevron-down" size={20} color="#2A3B4A" />
          </TouchableOpacity>

          <Text style={styles.label}>Tipo</Text>
          <View style={styles.typeRow}>
            <TouchableOpacity
              style={[styles.typeBtn, type === 'ingreso' ? styles.typeBtnActiveSelected : styles.typeBtnInactive]}
              onPress={() => setType('ingreso')}
            >
              <Text style={[styles.typeText, type === 'ingreso' ? styles.typeTextActive : null]}>Ingreso</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.typeBtn, type === 'egreso' ? styles.typeBtnActiveSelected : styles.typeBtnInactive]}
              onPress={() => setType('egreso')}
            >
              <Text style={[styles.typeText, type === 'egreso' ? styles.typeTextActive : null]}>Egreso</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Monto</Text>
          <View style={styles.amountRow}>
            <Text style={styles.currencyPrefix}>$</Text>
            <TextInput
              style={[styles.input, styles.inputAmount]}
              placeholder="34.000"
              keyboardType="numeric"
              value={formatCurrency(rawAmount)}
              onChangeText={onChangeAmount}
            />
          </View>

          <Text style={styles.label}>Descripción</Text>
          <TextInput style={styles.input} placeholder="Ej: Plan Movistar" value={descripcion} onChangeText={setDescripcion} />

          <Text style={styles.label}>Fecha</Text>
          <TouchableOpacity style={styles.input} onPress={showPicker}>
            <Text style={{ fontFamily: 'Montserrat' }}>{date ? date.toLocaleDateString() : 'mm/dd/yyyy'}</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker value={date ?? new Date()} mode="date" display={Platform.OS === 'ios' ? 'spinner' : 'default'} onChange={onDateChange} />
          )}

          <TouchableOpacity style={styles.primaryBtn} onPress={handleRegistrar}>
            <Ionicons name="cloud-upload-outline" size={18} color="#ffffffff" />
            <Text style={styles.primaryBtnText}> Registra tu monto</Text>
          </TouchableOpacity>
        </View>

        <View style={{ flex: 1 }} />

        <View style={styles.bottomNavWrap} pointerEvents="box-none">
          <View style={styles.bottomNav}>
            <TouchableOpacity style={[styles.navItem]} onPress={() => router.push('./homeScreen')}>
              <Ionicons name="home-outline" size={22} color="#2A3B4A" />
              <Text style={styles.navLabel}>Inicio</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navItem} onPress={() => router.push('./crearCategoria')}>
              <Ionicons name="folder-open-outline" size={22} color="#2A3B4A" />
              <Text style={styles.navLabel}>Categoria</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.navItem, styles.navActive]} onPress={() => router.push('./crearMonto')}>
              <Ionicons name="cash-outline" size={22} color="#2A3B4A" />
              <Text style={styles.navLabel}>Monto</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navItem} onPress={() => router.push('./blog')}>
              <Ionicons name="newspaper-outline" size={22} color="#2A3B4A" />
              <Text style={styles.navLabel}>Blog</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Modal visible={openCat} transparent animationType="fade">
          <View style={styles.modalBg}>
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>Selecciona categoría</Text>
              <FlatList
                data={categories}
                keyExtractor={(i) => i.id}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.catRow} onPress={() => { setCategoria(item); setOpenCat(false); }}>
                    <View style={[styles.selectIcon, { backgroundColor: item.color }]}> 
                      <Ionicons name={(item.icon as any)} size={18} color="#fff" />
                    </View>
                    <View style={{ marginLeft: 10 }}>
                      <Text style={styles.selectText}>{item.name}</Text>
                      {item.subtitle ? <Text style={styles.catSubtitle}>{item.subtitle}</Text> : null}
                    </View>
                  </TouchableOpacity>
                )}
              />
              <TouchableOpacity style={{ marginTop: 12 }} onPress={() => setOpenCat(false)}>
                <Text style={{ textAlign: 'center', color: '#2A3B4A' }}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F3EFEA' },
  container: { flex: 1, padding: 18 },
  header: { textAlign: 'center', fontSize: 20, marginVertical: 8, fontFamily: 'SpaceGrotesk-Bold', color: '#2A3B4A' },
  formCard: { backgroundColor: '#EAF6FB', borderRadius: 14, padding: 16, marginTop: 8, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 3 },
  label: { fontSize: 12, color: '#1A1B41', marginBottom: 8, fontFamily: 'Montserrat-Bold' },
  selectBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#D7EFFF', padding: 12, borderRadius: 8 },
  selectIcon: { width: 36, height: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  selectText: { marginLeft: 12, fontSize: 16, color: '#13233A', fontFamily: 'Montserrat-Bold' },
  typeRow: { flexDirection: 'row', marginVertical: 8 },
  typeBtn: { flex: 1, padding: 10, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  typeBtnInactive: { backgroundColor: '#D7EDF7' },
  typeBtnActiveSelected: { backgroundColor: '#1A1B41' },
  typeText: { fontFamily: 'Montserrat', color: '#2A3B4A' },
  typeTextActive: { color: '#fff', fontFamily: 'Montserrat-Bold' },
  input: { backgroundColor: '#D7EEF7', padding: 12, borderRadius: 10, marginBottom: 10, fontFamily: 'Montserrat' },
  amountRow: { flexDirection: 'row', alignItems: 'center' },
  currencyPrefix: { marginRight: 8, fontSize: 16, fontFamily: 'Montserrat-Bold', color: '#2A3B4A' },
  inputAmount: { flex: 1 },
  primaryBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#1A1B41', padding: 12, borderRadius: 20, alignSelf: 'center', marginTop: 12, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, elevation: 4 },
  primaryBtnText: { color: '#ffffffff', fontWeight: '700', fontFamily: 'Montserrat-Bold' },
  // bottom nav
  bottomNavWrap: { position: 'absolute', left: 0, right: 0, bottom: 18, alignItems: 'center' },
  bottomNav: { width: '92%', backgroundColor: '#E6F0F5', borderRadius: 18, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 6, height: 56 },
  navItem: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  navActive: { backgroundColor: '#D7EDF7', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  navLabel: { fontSize: 11, marginTop: 2, color: '#2A3B4A' },
  iconBg: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  iconBgActive: { backgroundColor: '#D7EDF7' },

  // modal
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', alignItems: 'center' },
  modalBox: { width: '85%', backgroundColor: '#fff', borderRadius: 12, padding: 16, maxHeight: '70%' },
  modalTitle: { fontSize: 16, fontFamily: 'SpaceGrotesk-Bold', marginBottom: 8, color: '#13233A' },
  catRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F0F6F7' },
  catSubtitle: { fontSize: 12, color: '#6B7A82', fontFamily: 'Montserrat' },
});
