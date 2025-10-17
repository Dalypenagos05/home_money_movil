import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import CustomText from "@/components/CustomText";

const { width } = Dimensions.get("window");

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Fondo semicircular azul */}
      <View style={styles.backgroundShape} />

      {/* Logo y título */}
      <View style={styles.header}>
        <Image
          source={require("../../assets/images/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <CustomText style={styles.headerTitle}>Home{"\n"}Money</CustomText>
      </View>

      {/* Título central */}
      <CustomText style={styles.welcomeTitle}>
       ¿Por qué elegir{"\n"}Home Money?
      </CustomText>

      {/* Texto descriptivo */}
      <CustomText style={styles.description}>
            • Centralización de tus asuntos financieros.{"\n"}
            • Listas de mercado personalizadas.{"\n"}
            • Boletín informativo sobre precios y noticias. {"\n"}
            • Seguridad y privacidad.{"\n"}
      </CustomText>

      {/* Botones de navegación */}
      <View style={styles.buttonRow}>
        {/* Botón atrás */}
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => router.push("./home2")}
        >
          <Ionicons name="arrow-back" size={22} color="#F2D8C2" />
        </TouchableOpacity>

        {/* Botón siguiente */}
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => router.push("./home4")}
        >
          <Ionicons name="arrow-forward" size={22} color="#F2D8C2" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f7f4",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 80,
    position: "relative",
  },
  backgroundShape: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: width * 0.7,
    backgroundColor: "#1A1B41",
    borderBottomLeftRadius: width * 0.,
    borderBottomRightRadius: width * 0.7,

  },
  header: {
    position: "absolute",
    top: 50,
    left: 25,
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    width: 45,
    height: 45,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    color: "#F2D8C2",
    lineHeight: 20,
    fontFamily: "Montserrat-Bold",
  },
  welcomeTitle: {
    fontSize: 25,
    color: "#F2D8C2",
    textAlign: "center",
    marginTop: 50,
    fontFamily: "Montserrat-Bold",
  },
  description: {
    fontSize: 22,
    textAlign: "center",
    color: "#1A1B41",
    marginHorizontal: 35,
    fontFamily: "SpaceGrotesk-Bold",
    marginTop: 20,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "50%",
    marginBottom: 10,
  },
  navButton: {
    backgroundColor: "#1A1B41",
    padding: 15,
    borderRadius: 12,
    elevation: 5,
  },
});
