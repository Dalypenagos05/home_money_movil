import { AntDesign, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import CustomText from "../../components/CustomText";
import { getUserByEmail } from "../../database/db";

const { width } = Dimensions.get("window");

// Componente Input con etiqueta flotante
type FloatingInputProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  isPassword?: boolean;
  keyboardType?: "default" | "email-address";
};

const FloatingInput: React.FC<FloatingInputProps> = ({
  label,
  value,
  onChangeText,
  isPassword = false,
  keyboardType = "default",
}) => {
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
        keyboardType={keyboardType}
        autoCapitalize="none"
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
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    // Validación básica
    if (!correo || !contraseña) {
      Alert.alert("Error", "Por favor complete todos los campos");
      return;
    }

    // Validar formato de correo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
      Alert.alert("Error", "Por favor ingrese un correo válido");
      return;
    }

    setIsLoading(true);

    try {
      // Buscar usuario en la base de datos
      const user = getUserByEmail(correo.toLowerCase().trim()) as any;

      if (!user) {
        Alert.alert("Error", "Usuario no encontrado");
        setIsLoading(false);
        return;
      }

      // Verificar contraseña
      if (user.clave !== contraseña) {
        Alert.alert("Error", "Contraseña incorrecta");
        setIsLoading(false);
        return;
      }

      // Login exitoso
      Alert.alert("Éxito", `Bienvenido ${user.nombre}!`, [
        {
          text: "OK",
          onPress: () => {
            // Aquí puedes guardar el usuario en contexto o AsyncStorage
            router.push({
              pathname: "./home",
              params: { userId: user.id_usu }
            });
          }
        }
      ]);

    } catch (error) {
      console.error("Error en login:", error);
      Alert.alert("Error", "Ocurrió un error al iniciar sesión");
    } finally {
      setIsLoading(false);
    }
  };

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
          <FloatingInput 
            label="Correo" 
            value={correo} 
            onChangeText={setCorreo}
            keyboardType="email-address"
          />
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
            style={[styles.loginButton, isLoading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Ionicons name="person-circle-outline" size={18} color="#F2D8C2" />
            <Text style={styles.loginButtonText}>
              {isLoading ? " Cargando..." : " Inicia sesión"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.registerButton}
            onPress={() => router.push("./registro")}
          >
            <AntDesign name="plus" size={18} color="#1A1B41" />
            <Text style={styles.registerButtonText}> Registrarse</Text>
          </TouchableOpacity>
        </View>

        {/* Enlace de recuperación */}
        <TouchableOpacity
          onPress={() => Alert.alert("Función no disponible", "Esta función estará disponible próximamente")}
        >
          <Text style={styles.forgotPasswordText}>¿Olvidó su contraseña?</Text>
        </TouchableOpacity>
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
    paddingTop: 60,
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
    marginBottom: 10,
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
    overflow: "visible",
    paddingTop: 6,
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
  buttonDisabled: {
    opacity: 0.6,
  },
  forgotPasswordText: {
    alignSelf: "flex-end",
    marginTop: 10,
    marginBottom: 20,
    color: "#1A1B41",
    fontSize: 14,
    fontFamily: "SpaceGrotesk-Bold",
    textDecorationLine: "underline",
  },
});
