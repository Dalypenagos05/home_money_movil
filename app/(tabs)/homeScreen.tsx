/**
 * Home screen with animated donut chart and bottom navigation.
 * Requires: react-native-svg
 * Install with: npm install react-native-svg
 */
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Animated, Easing, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, G } from 'react-native-svg';
import { getCategoriasByUser, getMontosByUser } from '../../database/db';
import { useAuth } from '../lib/authContext';
import { useProfile } from '../lib/profileContext';

const AnimatedCircle: any = Animated.createAnimatedComponent(Circle);

type Category = {
  id_categoria: number;
  nombre: string;
  icono?: string;
  color?: string;
  id_usu: number;
};

type Monto = {
  id_monto: number;
  valor: number;
  descripcion?: string;
  id_categoria: number;
  fecha: string;
  id_usu: number;
};

const Donut = ({ size = 280, strokeWidth = 46, data = [] }: any) => {
  const radius = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * radius;

  const total = data.reduce((s: number, d: any) => s + d.value, 0) || 1;

  // Create animated values based on data length - recreate when data changes
  const [animatedValues, setAnimatedValues] = useState<Animated.Value[]>([]);

  useEffect(() => {
    // Create fresh animated values for current data
    const newAnimatedValues = data.map(() => new Animated.Value(0));
    setAnimatedValues(newAnimatedValues);

    // Animate each segment independently
    const animations = newAnimatedValues.map((animVal, i) => 
      Animated.timing(animVal, {
        toValue: 1,
        duration: 800,
        delay: i * 100,
        useNativeDriver: false,
        easing: Easing.out(Easing.cubic),
      })
    );

    Animated.stagger(100, animations).start();
  }, [data]);

  // Don't render until we have animated values
  if (animatedValues.length !== data.length) {
    return null;
  }

  return (
    <Svg width={size} height={size}>
      <G rotation={-90} origin={`${cx}, ${cy}`}>
        {data.map((d: any, i: number) => {
          // Calculate the offset for this segment
          const accumulatedBefore = data.slice(0, i).reduce((sum: number, item: any) => sum + item.value, 0);
          const portion = d.value / total;
          const strokeDasharray = `${portion * circumference} ${circumference}`;
          
          // The offset should place this segment after all previous segments
          const baseOffset = -(accumulatedBefore / total) * circumference;

          // Animate from hidden to visible
          const animatedOffset = animatedValues[i].interpolate({
            inputRange: [0, 1],
            outputRange: [circumference, baseOffset],
          });

          return (
            <AnimatedCircle
              key={`${d.label}-${i}`}
              cx={cx}
              cy={cy}
              r={radius}
              stroke={d.color}
              strokeWidth={strokeWidth}
              strokeLinecap="butt"
              fill="transparent"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={animatedOffset}
            />
          );
        })}
      </G>
    </Svg>
  );
};

export default function HomeScreen() {
  const router = useRouter();
  const { imageUri } = useProfile();
  const { user } = useAuth();
  
  const [chartData, setChartData] = useState<any[]>([]);
  const [categoryList, setCategoryList] = useState<any[]>([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadData = () => {
    if (!user) return;

    try {
      setLoading(true);

      // Get user's categories and montos
      const categories = getCategoriasByUser(user.id_usu) as Category[];
      const montos = getMontosByUser(user.id_usu) as Monto[];

      // Calculate total per category
      const categoryTotals: Record<number, { total: number; count: number }> = {};
      let totalIngresos = 0;
      let totalEgresos = 0;

      montos.forEach((m) => {
        if (m.valor >= 0) {
          totalIngresos += m.valor;
        } else {
          totalEgresos += Math.abs(m.valor);
          
          // Sum expenses per category
          if (!categoryTotals[m.id_categoria]) {
            categoryTotals[m.id_categoria] = { total: 0, count: 0 };
          }
          categoryTotals[m.id_categoria].total += Math.abs(m.valor);
          categoryTotals[m.id_categoria].count += 1;
        }
      });

      // Build chart data (only categories with expenses - NO INGRESOS)
      const chart: any[] = [];

      // Add categories with expenses
      categories.forEach((cat) => {
        const catTotal = categoryTotals[cat.id_categoria];
        if (catTotal && catTotal.total > 0) {
          chart.push({
            label: cat.nombre,
            value: catTotal.total,
            color: cat.color || '#9D8F86',
          });
        }
      });

      // If no data, show placeholder
      if (chart.length === 0) {
        chart.push({
          label: 'Sin datos',
          value: 1,
          color: '#E0E0E0',
        });
      }

      setChartData(chart);

      // Calculate balance (still track ingresos for balance calculation)
      const calculatedBalance = totalIngresos - totalEgresos;
      setBalance(calculatedBalance);

      // Build category list (only categories with montos)
      const catList = categories
        .filter((cat) => categoryTotals[cat.id_categoria])
        .map((cat) => {
          const catData = categoryTotals[cat.id_categoria];
          return {
            id: cat.id_categoria.toString(),
            name: cat.nombre,
            subtitle: `${catData.count} monto${catData.count !== 1 ? 's' : ''} • $${catData.total.toLocaleString()}`,
            color: cat.color || '#9D8F86',
            icon: cat.icono || 'pricetag-outline',
          };
        });

      setCategoryList(catList);

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={[styles.container, { justifyContent: 'center' }]}>
          <Text style={styles.title}>Inicia sesión para ver tus datos</Text>
          <TouchableOpacity style={styles.loginBtn} onPress={() => router.push('./login')}>
            <Text style={styles.loginBtnText}>Ir a Login</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={[styles.container, { justifyContent: 'center' }]}>
          <ActivityIndicator size="large" color="#1A1B41" />
          <Text style={{ marginTop: 12, color: '#2A3B4A', fontFamily: 'Montserrat' }}>Cargando datos...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.screen}>
        <TouchableOpacity style={styles.profileBtn} onPress={() => router.push('./perfil')} activeOpacity={0.8}>
          <View style={styles.profileAvatar}>
            {imageUri ? <Image source={{ uri: imageUri }} style={styles.profileImage} /> : <Ionicons name="person" size={18} color="#fff" />}
          </View>
        </TouchableOpacity>
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>Inicio</Text>

          <View style={styles.donutWrap}>
            <Donut size={280} strokeWidth={46} data={chartData} />

            <View style={styles.centerBubble}>
              <Text style={styles.balanceLabel}>Balance</Text>
              <Text style={styles.balanceAmount}>${balance.toLocaleString()}</Text>
            </View>
          </View>

          {categoryList.length > 0 ? (
            <View style={styles.listWrap}>
              {categoryList.map((c) => (
                <View key={c.id} style={styles.card}>
                  <View style={styles.cardLeft}>
                    <Ionicons name={c.icon as any} size={24} color={c.color} style={styles.cardIcon} />
                    <View>
                      <Text style={styles.cardTitle}>{c.name}</Text>
                      <Text style={styles.cardSubtitle}>{c.subtitle}</Text>
                    </View>
                  </View>
                  <View style={[styles.cardColor, { backgroundColor: c.color }]} />
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="folder-open-outline" size={64} color="#D0D0D0" />
              <Text style={styles.emptyText}>No tienes montos registrados</Text>
              <TouchableOpacity style={styles.createBtn} onPress={() => router.push('./crearMonto')}>
                <Text style={styles.createBtnText}>Crear monto</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={{ height: 140 }} />
        </ScrollView>

        {/* Updated Bottom Navigation Bar */}
        <View style={styles.bottomNavWrap} pointerEvents="box-none">
          <View style={styles.bottomNav}>
            <TouchableOpacity style={[styles.navItem, styles.navActive]} onPress={() => router.push('./home')}>
              <Ionicons name="home-outline" size={22} color="#2A3B4A" />
              <Text style={styles.navLabel}>Inicio</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navItem} onPress={() => router.push('./crearCategoria')}>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#EDEAE6' },
  screen: { flex: 1 },
  container: { alignItems: 'center', padding: 16 },
  title: { fontSize: 20, marginTop: 8, marginBottom: 8, color: '#333', fontWeight: '600', fontFamily: 'SpaceGrotesk-Bold' },
  donutWrap: { width: 320, height: 320, alignItems: 'center', justifyContent: 'center', marginTop: 12 },
  centerBubble: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 170 / 2,
    backgroundColor: '#F3E0D0',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  balanceLabel: { fontSize: 20, color: '#222', fontWeight: '600', fontFamily: 'SpaceGrotesk-Medium' },
  balanceAmount: { fontSize: 22, color: '#222', marginTop: 6, fontWeight: '700', fontFamily: 'Montserrat-Bold' },
  listWrap: { width: '100%', marginTop: 24 },
  card: {
    flexDirection: 'row',
    backgroundColor: '#D7E3EA',
    borderRadius: 14,
    marginHorizontal: 8,
    marginVertical: 8,
    padding: 12,
    alignItems: 'center',
  },
  cardLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  cardIcon: { fontSize: 24, marginRight: 12 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#13233A', fontFamily: 'Montserrat-Bold' },
  cardSubtitle: { fontSize: 12, color: '#2E495C', marginTop: 2, fontFamily: 'Montserrat' },
  cardColor: { width: 48, height: 48, borderRadius: 8 },

  emptyState: { alignItems: 'center', marginTop: 40 },
  emptyText: { fontSize: 14, color: '#6B7A82', marginTop: 12, fontFamily: 'Montserrat' },
  createBtn: { marginTop: 16, backgroundColor: '#1A1B41', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 10 },
  createBtnText: { color: '#F2D8C2', fontFamily: 'Montserrat-Bold' },

  loginBtn: { marginTop: 20, backgroundColor: '#1A1B41', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 10 },
  loginBtnText: { color: '#F2D8C2', fontFamily: 'Montserrat-Bold' },

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
  // top-right profile avatar
  profileBtn: { position: 'absolute', top: 12, right: 18, zIndex: 20 },
  profileAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#1A1B41', alignItems: 'center', justifyContent: 'center', elevation: 4 },
  profileImage: { width: 36, height: 36, borderRadius: 18 },
});
