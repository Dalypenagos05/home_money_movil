/**
 * Home screen with animated donut chart and bottom navigation.
 * Requires: react-native-svg
 * Install with: npm install react-native-svg
 */
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, G } from 'react-native-svg';
import { useProfile } from '../lib/profileContext';

const AnimatedCircle: any = Animated.createAnimatedComponent(Circle);

const Donut = ({ size = 280, strokeWidth = 46, data = [] }: any) => {
  const radius = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * radius;

  const total = data.reduce((s: number, d: any) => s + d.value, 0) || 1;

  // Animated values per segment (start from full hidden circumference)
  const offsetsRef = useRef(data.map(() => new Animated.Value(circumference)));

  useEffect(() => {
    const animations: Animated.CompositeAnimation[] = [];
    let acc = 0;

    data.forEach((d: any, i: number) => {
      const targetOffset = (acc / total) * circumference * -1;
      acc += d.value;

      animations.push(
        Animated.timing(offsetsRef.current[i], {
          toValue: targetOffset,
          duration: 700,
          delay: i * 120,
          useNativeDriver: false,
          easing: Easing.out(Easing.cubic),
        })
      );
    });

    Animated.stagger(80, animations).start();
  }, [data, circumference, total]);

  return (
    <Svg width={size} height={size}>
      <G rotation={-90} origin={`${cx}, ${cy}`}>
        {data.map((d: any, i: number) => {
          const portion = d.value / total;
          const strokeDasharray = `${portion * circumference} ${circumference}`;

          return (
            <AnimatedCircle
              key={i}
              cx={cx}
              cy={cy}
              r={radius}
              stroke={d.color}
              strokeWidth={strokeWidth}
              strokeLinecap="butt"
              fill="transparent"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={offsetsRef.current[i]}
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
  const chartData = [
    { label: 'Ingresos', value: 4200, color: '#7ED9FF' },
    { label: 'Ahorros', value: 1800, color: '#0B6B6B' },
    { label: 'Transporte', value: 1200, color: '#9D8F86' },
    { label: 'Compras', value: 2600, color: '#13153E' },
  ];

  const balance = chartData[0].value - chartData.slice(1).reduce((s, c) => s + c.value, 0);

  const categories = [
    { id: '1', name: 'Mercado', subtitle: '2 mercados mensuales', color: '#7ED9FF', icon: 'cart-outline' },
    { id: '2', name: 'Recibos', subtitle: '4 recibos y facturas', color: '#0B6B6B', icon: 'receipt-outline' },
    { id: '3', name: 'Transporte', subtitle: 'Para 2 personas', color: '#9D8F86', icon: 'car-outline' },
  ];

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

          <View style={styles.listWrap}>
            {categories.map((c) => (
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

          <View style={{ height: 140 }} />
        </ScrollView>

        {/* Bottom navigation bar */}
        <View style={styles.bottomNavWrap} pointerEvents="box-none">
          <View style={styles.bottomNav}>
            <TouchableOpacity style={[styles.navItem, styles.navActive]}>
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
            <TouchableOpacity style={styles.navItem} onPress={() => router.push('./blog')}>
              <Ionicons name="newspaper-outline" size={22} color="#2A3B4A" />
              <Text style={styles.navLabel}>Blog</Text>
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
  title: { fontSize: 20, marginTop: 8, marginBottom: 8, color: '#333', fontWeight: '600' },
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
  balanceLabel: { fontSize: 20, color: '#222', fontWeight: '600' },
  balanceAmount: { fontSize: 22, color: '#222', marginTop: 6, fontWeight: '700' },
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
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#13233A' },
  cardSubtitle: { fontSize: 12, color: '#2E495C', marginTop: 2 },
  cardColor: { width: 48, height: 48, borderRadius: 8 },

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
  // top-right profile avatar
  profileBtn: { position: 'absolute', top: 12, right: 18, zIndex: 20 },
  profileAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#0B6B6B', alignItems: 'center', justifyContent: 'center', elevation: 4 },
  profileImage: { width: 36, height: 36, borderRadius: 18 },
});
