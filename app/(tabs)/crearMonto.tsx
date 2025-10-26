import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, FlatList, Modal, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { getCategories } from '../lib/categories';
import { addMonto, getMontos, Monto, removeMonto, updateMonto } from '../lib/montos';

type Category = { id: string; name: string; subtitle?: string; color?: string; icon?: string };

// Header form extracted to avoid inline render function in FlatList which
// can cause the header to be remounted on every parent render and make
// controlled TextInputs lose focus (keyboard hides). We render this as a
// stable component type and pass props from the parent.
function HeaderForm(props: any) {
  const {
    editingId,
    styles,
    categoria,
    errors,
    setOpenCat,
    type,
    setType,
    rawAmount,
    formatCurrency,
    onChangeAmount,
    descripcion,
    setDescripcion,
    date,
    showDatePicker,
    showPicker,
    onDateChange,
    handleRegistrar,
    handleCancelEdit,
  } = props;

  return (
    <View>
      <Text style={styles.header}>{editingId ? 'Editar' : 'Crear'}</Text>
      <View style={styles.formCard}>
        <Text style={styles.label}>Categoria</Text>
        <TouchableOpacity style={[styles.selectBox, errors.categoria ? styles.inputError : null]} onPress={() => setOpenCat(true)}>
          <View style={[styles.selectIcon, { backgroundColor: categoria?.color ?? '#D7EFFF' }]}> 
            <Ionicons name={(categoria?.icon as any) ?? 'pricetag-outline'} size={18} color="#fff" />
          </View>
          <Text style={styles.selectText}>{categoria?.name ?? 'Selecciona categoría'}</Text>
          <Ionicons name="chevron-down" size={20} color="#2A3B4A" />
        </TouchableOpacity>
        {errors.categoria ? <Text style={styles.errorText}>{errors.categoria}</Text> : null}

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
        {errors.amount ? <Text style={styles.errorText}>{errors.amount}</Text> : null}

        <Text style={styles.label}>Descripción</Text>
        <TextInput style={styles.input} placeholder="Ej: Plan Movistar" value={descripcion} onChangeText={setDescripcion} />

        <Text style={styles.label}>Fecha</Text>
        <TouchableOpacity style={styles.input} onPress={showPicker}>
          <Text style={{ fontFamily: 'Montserrat' }}>{date ? date.toLocaleDateString() : 'mm/dd/yyyy'}</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker value={date ?? new Date()} mode="date" display={Platform.OS === 'ios' ? 'spinner' : 'default'} onChange={onDateChange} />
        )}

        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 12 }}>
          <TouchableOpacity style={styles.primaryBtn} onPress={handleRegistrar}>
            <Ionicons name="cloud-upload-outline" size={18} color="#ffffffff" />
            <Text style={styles.primaryBtnText}>{editingId ? ' Guardar cambios' : ' Registra tu monto'}</Text>
          </TouchableOpacity>
          {editingId ? (
            <TouchableOpacity style={[styles.secondaryBtn]} onPress={handleCancelEdit}>
              <Text style={styles.secondaryBtnText}>Cancelar</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
      <Text style={styles.sectionTitle}>{editingId ? 'Editando monto' : 'Montos registrados'}</Text>
    </View>
  );
}
export default function CrearMonto() {
  // navigation hook
  const router = useRouter();
  const insets = useSafeAreaInsets();
  // bottomNavWrap bottom (18) + bottomNav height (56) = 74
  const NAV_OVERLAY_HEIGHT = 74;
  const bottomSpace = insets.bottom + NAV_OVERLAY_HEIGHT;
  
  const [categories, setCategories] = React.useState<Category[]>(() => getCategories());
  const [categoria, setCategoria] = React.useState<Category | null>(categories[0] ?? null);
  const [openCat, setOpenCat] = React.useState(false);
  const [rawAmount, setRawAmount] = React.useState(''); // store digits only
  const [descripcion, setDescripcion] = React.useState('');
  const [date, setDate] = React.useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = React.useState(false);
  const [type, setType] = React.useState<'ingreso' | 'egreso'>('egreso');
  const [montos, setMontos] = React.useState<Monto[]>(() => getMontos());
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const flatListRef = React.useRef<FlatList<any> | null>(null);
  const [errors, setErrors] = React.useState<{ categoria?: string; amount?: string }>(() => ({}));

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
    if (!categoria) {
      Alert.alert('Falta categoría', 'Selecciona una categoría antes de guardar.');
      return;
    }
    if (!montoNumber || montoNumber <= 0) {
      Alert.alert('Monto inválido', 'Ingresa un monto válido mayor que 0.');
      return;
    }

    if (editingId) {
      const updated: Monto = {
        id: editingId,
        categoryId: categoria.id,
        amount: montoNumber,
        type,
        description: descripcion,
        date: date ? date.toISOString() : undefined,
      };
      updateMonto(updated);
      setMontos(getMontos());
      setEditingId(null);
      setRawAmount('');
      setDescripcion('');
      setDate(null);
      setType('egreso');
      Alert.alert('Actualizado', 'El monto ha sido actualizado.');
      return;
    }

    const nuevo: Monto = {
      id: String(Date.now()),
      categoryId: categoria.id,
      amount: montoNumber,
      type,
      description: descripcion,
      date: date ? date.toISOString() : undefined,
    };
    addMonto(nuevo);
    setMontos(getMontos());
    // clear form
    setRawAmount('');
    setDescripcion('');
    setDate(null);
    setType('egreso');
    Alert.alert('Registrado', 'Monto registrado correctamente.');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setRawAmount('');
    setDescripcion('');
    setDate(null);
    setType('egreso');
  };

  const handleRowPress = (m: Monto) => {
    const cat = categories.find(c => c.id === m.categoryId) ?? null;
    setCategoria(cat);
    setRawAmount(String(m.amount));
    setDescripcion(m.description ?? '');
    setDate(m.date ? new Date(m.date) : null);
    setType(m.type);
    setEditingId(m.id);
    // scroll so the header/form is visible
    setTimeout(() => flatListRef.current?.scrollToOffset({ offset: 0, animated: true }), 80);
  };

  const handleRowLongPress = (m: Monto) => {
    Alert.alert('Eliminar monto', '¿Deseas eliminar este monto?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => {
        removeMonto(m.id);
        setMontos(getMontos());
        if (editingId === m.id) handleCancelEdit();
      } }
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={[styles.container, { paddingBottom: bottomSpace }] }>
        <FlatList
          data={montos}
          ref={flatListRef}
          keyExtractor={(i) => i.id}
          style={{ marginTop: 8, flex: 1 }}
          contentContainerStyle={{ paddingBottom: bottomSpace, flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="none"
          ListHeaderComponent={
            <HeaderForm
              editingId={editingId}
              styles={styles}
              categoria={categoria}
              errors={errors}
              setOpenCat={setOpenCat}
              type={type}
              setType={setType}
              rawAmount={rawAmount}
              formatCurrency={formatCurrency}
              onChangeAmount={onChangeAmount}
              descripcion={descripcion}
              setDescripcion={setDescripcion}
              date={date}
              showDatePicker={showDatePicker}
              showPicker={showPicker}
              onDateChange={onDateChange}
              handleRegistrar={handleRegistrar}
              handleCancelEdit={handleCancelEdit}
            />
          }
          renderItem={({ item }) => {
            const cat = categories.find(c => c.id === item.categoryId);
            const sign = item.type === 'ingreso' ? '+' : '-';
            const formatted = (() => {
              try { return new Intl.NumberFormat('es-CO').format(item.amount); } catch { return item.amount.toString(); }
            })();
            return (
              <TouchableOpacity activeOpacity={0.9} onPress={() => handleRowPress(item)} onLongPress={() => handleRowLongPress(item)}>
                <View style={[styles.montoRow, editingId === item.id ? styles.montoRowActive : null]}>
                  <View style={[styles.selectIcon, { backgroundColor: cat?.color ?? '#D7EFFF' }]}> 
                    <Ionicons name={(cat?.icon as any) ?? 'pricetag-outline'} size={16} color="#fff" />
                  </View>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.montoTitle}>{cat?.name ?? 'Sin categoría'} • {item.type}</Text>
                    {item.description ? <Text style={styles.montoDesc}>{item.description}</Text> : null}
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[styles.montoAmount, item.type === 'ingreso' ? styles.ingreso : styles.egreso]}>{sign} ${formatted}</Text>
                    <Text style={styles.montoDate}>{item.date ? new Date(item.date).toLocaleDateString() : ''}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
  />

        <View style={styles.bottomNavWrap} pointerEvents="box-none">
          <View style={styles.bottomNav} pointerEvents="box-none">
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
  // reduce top padding so header sits closer to the top (SafeArea already provides inset)
  container: { flex: 1, paddingHorizontal: 18, paddingTop: 0 },
  header: { textAlign: 'center', fontSize: 20, marginVertical: 0, fontFamily: 'SpaceGrotesk-Bold', color: '#2A3B4A' },
  formCard: { backgroundColor: '#ffffffff', borderRadius: 14, padding: 16, marginTop: 8, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 3 },
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
  secondaryBtn: { marginLeft: 10, paddingHorizontal: 14, paddingVertical: 12, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1, borderColor: '#D7E1E7', justifyContent: 'center' },
  secondaryBtnText: { fontFamily: 'Montserrat-Bold', color: '#2A3B4A' },
  // bottom nav
  bottomNavWrap: { position: 'absolute', left: 0, right: 0, bottom: 18, alignItems: 'center' },
  bottomNav: { width: '92%', backgroundColor: '#E6F0F5', borderRadius: 18, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 6, height: 56 },
  navItem: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  navActive: { backgroundColor: '#D7EDF7', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  navLabel: { fontSize: 11, marginTop: 2, color: '#2A3B4A', fontFamily: 'Montserrat-Bold' },
  iconBg: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  iconBgActive: { backgroundColor: '#D7EDF7' },

  // modal
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', alignItems: 'center' },
  modalBox: { width: '85%', backgroundColor: '#fff', borderRadius: 12, padding: 16, maxHeight: '70%' },
  modalTitle: { fontSize: 16, fontFamily: 'SpaceGrotesk-Bold', marginBottom: 8, color: '#13233A' },
  catRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F0F6F7' },
  catSubtitle: { fontSize: 12, color: '#6B7A82', fontFamily: 'Montserrat' },
  sectionTitle: { fontSize: 14, fontFamily: 'SpaceGrotesk-Bold', color: '#2A3B4A', marginTop: 14 },
  montoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F3F6F7' },
  montoRowActive: { backgroundColor: '#EDF9F8' },
  montoTitle: { fontSize: 14, fontFamily: 'Montserrat-Bold', color: '#13233A' },
  montoDesc: { fontSize: 12, color: '#6B7A82', fontFamily: 'Montserrat' },
  montoAmount: { fontSize: 14, fontFamily: 'Montserrat-Bold' },
  ingreso: { color: '#0B6B6B' },
  egreso: { color: '#D64545' },
  montoDate: { fontSize: 11, color: '#6B7A82', marginTop: 4, fontFamily: 'Montserrat' },
});
