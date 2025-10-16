import { AntDesign, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState, useEffect, useRef } from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Animated,
} from "react-native";
import CustomText from "../../components/CustomText";

const { width } = Dimensions.get("window");

// Componente Input con etiqueta flotante
type FloatingInputProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  isPassword?: boolean;
};

const FloatingInput: React.FC<FloatingInputProps> = ({
  label,
  value,
  onChangeText,
  isPassword = false,
}) => 
  {
  const [isFocused, setIsFocused] = useState(false);
  const animatedLabel = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(animatedLabel, {
      toValue: isFocused || value ? 1 : 0,
      duration: 180,
      useNativeDriver: false,
    }).start();
  }, [isFocused, value]);

  const labelStyle = {
    position: "absolute",
    left: 15,
    top: animatedLabel.interpolate({
      inputRange: [0, 1],
      outputRange: [18, -8],
    }),
    fontSize: animatedLabel.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 12],
    }),
    color: animatedLabel.interpolate({
      inputRange: [0, 1],
      outputRange: ["#6c757d", "#1A1B41"],
    }),
    // 👇 este color debe ser el MISMO que el fondo general del formulario
    backgroundColor: "#d6e6f2",
    paddingHorizontal: 4,
    fontFamily: "SpaceGrotesk",
    zIndex: 1,
  };

  return (
    <View style={styles.inputContainer}>
      <Animated.Text style={[labelStyle as any]}>
        {label}
      </Animated.Text>

      <TextInput
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={isPassword}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={!isFocused && !value ? label : ""}
        placeholderTextColor="#aaa"
        style={[
          styles.input,
          isFocused && styles.inputFocused,
        ]}
      />
    </View>
  );
};


export default function LoginScreen() {
  const router = useRouter();

  const [correo, setCorreo] = useState("");
  const [contraseña, setContraseña] = useState("");

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.container}>
        {/* Fondo semicircular */}
        <View style={styles.backgroundCircle} />

        {/* Encabezado con logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require("../../assets/images/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <CustomText style={styles.logoTitle}>Iniciar sesión</CustomText>
        </View>

        {/* Formulario */}
        <View style={styles.form}>
          <FloatingInput label="Correo" value={correo} onChangeText={setCorreo} />
          <FloatingInput
            label="Contraseña"
            value={contraseña}
            onChangeText={setContraseña}
            isPassword
          />
        </View>

        {/* Botones */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.push("./home")}
          >
            <Ionicons name="person-circle-outline" size={18} color="#F2D8C2" />
            <Text style={styles.loginButtonText}> Inicia sesión</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.registerButton}
            onPress={() => router.push("./registro")}>
            <AntDesign name="plus" size={18} color="#1A1B41" />
            <Text style={styles.registerButtonText}> Registrarse</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

// Estilos
const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "flex-start",
  },
container: {
  flex: 1,
  alignItems: "center",
  backgroundColor: "#f8f7f4",
  paddingHorizontal: 25,
  paddingTop: 60, // era 230 antes
  paddingBottom: 60,
  position: "relative",
},

  backgroundCircle: {
    ...StyleSheet.absoluteFillObject,
    top: -width * 1.4,
    height: width * 2.2,
    backgroundColor: "#1a1a40",
    borderBottomLeftRadius: width * 0.25,
    borderBottomRightRadius: width * 0.5,
  },
  logoContainer: {
  alignItems: "center",
  marginBottom: 10, // separación con el formulario
},

  logo: {
    width: width * 0.5,
    height: width * 0.5,
    marginBottom: 8,
  },
  logoTitle: {
    fontSize: 30,
    color: "#F2D8C2",
    marginTop: -30,
    marginBottom: 60,
    fontFamily: "Montserrat-Bold",
  },
  form: {
    width: "100%",
  },
  inputContainer: {
    marginBottom: 25,
    position: "relative",
    overflow: "visible", // 👈 evita que se corte la animación
    paddingTop: 6, // 👈 espacio adicional arriba
  },
  input: {
    backgroundColor: "#d6e6f2",
    borderWidth: 1.5,
    borderColor: "transparent",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    fontFamily: "SpaceGrotesk",
    color: "#1A1B41",
  },
  inputFocused: {
    borderColor: "#1A1B41",
    backgroundColor: "#ffffff",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 35,
  },
  loginButton: {
    flexDirection: "row",
    backgroundColor: "#1A1B41",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 15,
    alignItems: "center",
    flex: 0.48,
    justifyContent: "center",
  },
  registerButton: {
    flexDirection: "row",
    backgroundColor: "#7CC6FE",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 15,
    alignItems: "center",
    flex: 0.48,
    justifyContent: "center",
  },
  loginButtonText: {
    color: "#F2D8C2",
    fontFamily: "SpaceGrotesk-Bold",
    fontSize: 15,
  },
  registerButtonText: {
    color: "#1A1B41",
    fontFamily: "SpaceGrotesk-Bold",
    fontSize: 15,
  },
});
