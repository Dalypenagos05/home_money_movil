import CustomText from "@/components/CustomText";
import { Ionicons,AntDesign } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const { width } = Dimensions.get("window");

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Fondo semicircular */}
      <View style={styles.backgroundCircle} />

      {/* Contenido principal */}
      <View style={styles.logoContainer}>
        <Image
          source={require("../../assets/images/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <CustomText style={styles.title}>Home Money</CustomText>
      </View>

      <CustomText style={styles.slogan}>
        ¡Comienza una vida mejor organizada!
      </CustomText>

      {/* Botón "Conócenos" */}
      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => router.push("./login")}
        accessible={true}
        accessibilityLabel="Ir a iniciar sesión"
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="arrow-forward" size={18} color={"#F2D8C2"} style={styles.icon} />
        <Text style={styles.primaryButtonText}>Inicia sesión</Text>
      </TouchableOpacity>

      {/* Botón "¿Ya tienes una cuenta?" */}
      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => router.push("./login")}
      >
        <AntDesign name="plus" size={18} color="#1A1B41" />
        <Text style={styles.secondaryButtonText}>Registrate</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f7f4",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },

  backgroundCircle: {
    ...StyleSheet.absoluteFillObject, // asegura que cubra toda la parte superior
    top: -width * 1.10,               // desplaza un poco hacia arriba
    height: width * 2,              // controla el tamaño del semicírculo
    backgroundColor: "#1a1a40",
    borderBottomLeftRadius: width * 0,
    borderBottomRightRadius: width * 0.50,
  },

  logoContainer: {
    alignItems: "center",
    marginBottom: 130,
  },
  logo: {
    width: width * 0.6,
    height: width * 0.6,
    alignSelf: "center",
    marginBottom: -8,
  },
  title: {
    fontSize: 35,
    color: "#F2D8C2",
    marginTop: -25,
    fontFamily: "Montserrat-Bold",
  },
  slogan: {
    fontSize: 30,
    textAlign: "center",
    color: "#2c2c54",
    marginBottom: 40,
    fontFamily: "SpaceGrotesk-Bold",
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1A1B41",
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 15,
    marginBottom: 15,
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#7CC6FE",
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 15,
  },
  primaryButtonText: {
    color: "#F2D8C2",
    fontSize: 16,
    fontFamily: "SpaceGrotesk",
  },
  secondaryButtonText: {
    color: "#1a1a40",
    fontSize: 16,
    fontFamily: "SpaceGrotesk",
  },
  icon: {
    marginRight: 8,
  },
});
