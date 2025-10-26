import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { FlatList, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export type IconName = React.ComponentProps<typeof Ionicons>['name'];

const ICONS: { name: IconName; keywords: string[] }[] = [
  { name: 'home-outline', keywords: ['home', 'casa', 'hogar'] },
  { name: 'car-outline', keywords: ['car', 'auto', 'coche', 'carro'] },
  { name: 'restaurant-outline', keywords: ['restaurant', 'restaurante', 'comida', 'almuerzo', 'cena'] },
  { name: 'bulb-outline', keywords: ['bulb', 'idea', 'luz', 'bombilla'] },
  { name: 'cart-outline', keywords: ['cart', 'super', 'compras', 'mercado'] },
  { name: 'wallet-outline', keywords: ['wallet', 'billetera', 'dinero', 'cartera'] },
  { name: 'bookmark-outline', keywords: ['bookmark', 'favorito', 'guardar'] },
  { name: 'paw-outline', keywords: ['paw', 'mascota', 'perro', 'gato'] },
  { name: 'heart-outline', keywords: ['heart', 'salud', 'amor', 'corazon'] },
  { name: 'tv-outline', keywords: ['tv', 'televisor', 'entretenimiento', 'tele'] },
  { name: 'pricetag-outline', keywords: ['tag', 'etiqueta', 'precio'] },
  { name: 'cash-outline', keywords: ['cash', 'efectivo', 'dinero'] },
  { name: 'person-outline', keywords: ['person', 'persona', 'perfil', 'usuario'] },
  { name: 'airplane-outline', keywords: ['airplane', 'avion', 'viaje', 'vuelo'] },
  { name: 'bed-outline', keywords: ['bed', 'hotel', 'alojamiento', 'descanso'] },
  { name: 'bicycle-outline', keywords: ['bicycle', 'bicicleta', 'bici'] },
  { name: 'bus-outline', keywords: ['bus', 'autobus', 'transporte'] },
  { name: 'train-outline', keywords: ['train', 'tren', 'transporte'] },
  { name: 'gift-outline', keywords: ['gift', 'regalo', 'presentes'] },
  { name: 'cafe-outline', keywords: ['cafe', 'cafeteria', 'café', 'coffee'] },
  // food / dining related
  { name: 'fast-food-outline' as IconName, keywords: ['fast', 'fast-food', 'rápido', 'comida rápida', 'hamburguesa'] },
  { name: 'pizza-outline' as IconName, keywords: ['pizza', 'pizzería', 'comida', 'comer'] },
  { name: 'beer-outline' as IconName, keywords: ['beer', 'cerveza', 'bar', 'bebida', 'trago'] },
  { name: 'ice-cream-outline' as IconName, keywords: ['ice', 'helado', 'postre', 'dulce'] },
  { name: 'wine-outline' as IconName, keywords: ['vino', 'copa', 'bar', 'bebida'] },
  { name: 'cake-outline' as IconName, keywords: ['cake', 'pastel', 'torta', 'postre'] },
  // education related
  { name: 'book-outline', keywords: ['book', 'libro', 'lectura', 'cuaderno'] },
  { name: 'school-outline', keywords: ['school', 'colegio', 'escuela', 'educacion', 'estudio'] },
  { name: 'create-outline', keywords: ['create', 'lapiz', 'lápiz', 'escribir', 'nota', 'pencil'] },
  { name: 'document-text-outline', keywords: ['document', 'documento', 'archivo', 'nota'] },
  { name: 'clipboard-outline', keywords: ['clipboard', 'lista', 'tarea', 'checklist'] },
];

interface IconGridDropdownProps {
  selectedIcon?: IconName;
  onSelect: (icon: IconName) => void;
  numColumns?: number;
}

export default function IconGridDropdown({ selectedIcon, onSelect, numColumns }: IconGridDropdownProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const normalize = (s: string) =>
    s
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9-]/g, '');

  return (
    <View style={{ marginHorizontal: 20 }}>
      <TouchableOpacity style={styles.dropdown} onPress={() => setOpen(true)}>
        <Text style={{ fontSize: 16 }}>
          {selectedIcon ? <Ionicons name={selectedIcon} size={22} /> : "Selecciona un icono"}
        </Text>
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade">
        <View style={styles.modalBackground}>
          <View style={styles.modalBox}>
            <TextInput
              placeholder="Buscar icono..."
              value={query}
              onChangeText={setQuery}
              style={styles.searchInput}
              autoCorrect={false}
              autoCapitalize="none"
              clearButtonMode="while-editing"
            />
            {(() => {
              const filtered = ICONS.filter((i) => {
                const q = normalize(query || '');
                if (!q) return true;
                if (normalize(i.name).includes(q)) return true;
                return i.keywords.some((k) => normalize(k).includes(q));
              });

              if (filtered.length === 0) {
                return <Text style={styles.noResults}>No se encontraron iconos{query ? ` para "${query}"` : ''}.</Text>;
              }

              return (
                <FlatList
                  data={filtered}
                  numColumns={numColumns ?? 4}
                  keyExtractor={(item) => item.name}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.iconBox}
                      onPress={() => {
                        onSelect(item.name);
                        setOpen(false);
                        setQuery('');
                      }}
                    >
                      <Ionicons name={item.name} size={28} />
                    </TouchableOpacity>
                  )}
                />
              );
            })()}
            <TouchableOpacity onPress={() => { setOpen(false); setQuery(''); }}>
              <Text style={{ textAlign: "center", marginTop: 10 }}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  dropdown: {
    backgroundColor: "#D5DEE8",
    padding: 14,
    borderRadius: 8,
  },
  modalBackground: {
    flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalBox: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "85%",
  },
  searchInput: {
    backgroundColor: '#F1F5F8',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  iconBox: {
    padding: 14,
    alignItems: "center",
    justifyContent: "center",
    width: "25%",
  },
  noResults: {
    textAlign: 'center',
    paddingVertical: 18,
    color: '#3b3b3b',
  },
});
