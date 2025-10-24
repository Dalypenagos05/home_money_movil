import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { FlatList, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export type IconName = React.ComponentProps<typeof Ionicons>['name'];

const iconList: IconName[] = [
  "home-outline", "car-outline", "restaurant-outline", "bulb-outline",
  "cart-outline", "wallet-outline", "bookmark-outline", "paw-outline",
  "heart-outline", "tv-outline"
];

interface IconGridDropdownProps {
  selectedIcon?: IconName;
  onSelect: (icon: IconName) => void;
}

export default function IconGridDropdown({ selectedIcon, onSelect }: IconGridDropdownProps) {
  const [open, setOpen] = useState(false);

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
            <FlatList
              data={iconList}
              numColumns={4}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.iconBox}
                  onPress={() => {
                    onSelect(item);
                    setOpen(false);
                  }}
                >
                  <Ionicons name={item} size={28} />
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity onPress={() => setOpen(false)}>
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
    width: "80%",
  },
  iconBox: {
    padding: 14,
    alignItems: "center",
    justifyContent: "center",
    width: "25%",
  },
});
