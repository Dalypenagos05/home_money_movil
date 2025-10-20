import { Ionicons } from "@expo/vector-icons";
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
import { createUser, getUserByEmail } from "../../database/db";

const { width } = Dimensions.get("window");

// Componente Input con etiqueta flotante
type FloatingInputProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  isPassword?: boolean;
  keyboardType?: "default" | "email-address" | "phone-pad";
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
        autoCapitalize={keyboardType === "email-address" ? "none" : "words"}
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

export default function RegistroScreen() {
  const router = useRouter();

  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [contraseña, setContraseña] = useState("");
  const [confirmarContraseña, setConfirmarContraseña] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    // Validación de campos vacíos
    if (!nombre || !apellido || !correo || !telefono || !contraseña || !confirmarContraseña) {
      Alert.alert("Error", "Por favor complete todos los campos");
      return;
    }

    // Validar formato de correo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
      Alert.alert("Error", "Por favor ingrese un correo válido");
      return;
    }

    // Validar teléfono (solo números)
    const phoneRegex = /^[0-9]{10,}$/;
    if (!phoneRegex.test(telefono)) {
      Alert.alert("Error", "El teléfono debe tener al menos 10 dígitos");
      return;
    }

    // Validar longitud de contraseña
    if (contraseña.length < 6) {
      Alert.alert("Error", "La contraseña debe tener al menos 6 caracteres");
      return;
    }

    // Validar que las contraseñas coincidan
    if (contraseña !== confirmarContraseña) {
      Alert.alert("Error", "Las contraseñas no coinciden");
      return;
    }

    setIsLoading(true);

    try {
      // Verificar si el usuario ya existe
      const existingUser = getUserByEmail(correo.toLowerCase().trim());
      
      if (existingUser) {
        Alert.alert("Error", "Ya existe un usuario con este correo");
        setIsLoading(false);
        return;
      }

      // Crear nuevo usuario
      const userId = createUser({
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        correo: correo.toLowerCase().trim(),
        telefono: telefono.trim(),
        clave: contraseña, // En producción, deberías hashear la contraseña
      });

      // Registro exitoso
      Alert.alert(
        "¡Registro exitoso!",
        `Bienvenido ${nombre}. Ya puedes iniciar sesión.`,
        [
          {
            text: "OK",
            onPress: () => router.push("./login")
          }
        ]
      );

    } catch (error) {
      console.error("Error en registro:", error);
      Alert.alert("Error", "Ocurrió un error al registrar el usuario");
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
          <CustomText style={styles.logoTitle}>Crear cuenta</CustomText>
        </View>

        {/* Formulario */}
        <View style={styles.form}>
          <FloatingInput 
            label="Nombre" 
            value={nombre} 
            onChangeText={setNombre}
          />
          <FloatingInput 
            label="Apellido" 
            value={apellido} 
            onChangeText={setApellido}
          />
          <FloatingInput 
            label="Correo" 
            value={correo} 
            onChangeText={setCorreo}
            keyboardType="email-address"
          />
          <FloatingInput 
            label="Teléfono" 
            value={telefono} 
            onChangeText={setTelefono}
            keyboardType="phone-pad"
          />
          <FloatingInput
            label="Contraseña"
            value={contraseña}
            onChangeText={setContraseña}
            isPassword
          />
          <FloatingInput
            label="Confirmar contraseña"
            value={confirmarContraseña}
            onChangeText={setConfirmarContraseña}
            isPassword
          />
        </View>

        {/* Botones */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.registerButton, isLoading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={isLoading}
          >
            <Ionicons name="person-add-outline" size={18} color="#1A1B41" />
            <Text style={styles.registerButtonText}>
              {isLoading ? " Registrando..." : " Registrarse"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={18} color="#F2D8C2" />
            <Text style={styles.backButtonText}> Volver</Text>
          </TouchableOpacity>
        </View>

        {/* Enlace a login */}
        <TouchableOpacity
          onPress={() => router.push("./login")}
        >
          <Text style={styles.loginLinkText}>¿Ya tienes cuenta? Inicia sesión</Text>
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
    paddingTop: 40,
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
    width: width * 0.4,
    height: width * 0.4,
    marginBottom: 8,
  },
  logoTitle: {
    fontSize: 28,
    color: "#F2D8C2",
    marginTop: -20,
    marginBottom: 40,
    fontFamily: "Montserrat-Bold",
  },
  form: {
    width: "100%",
  },
  inputContainer: {
    marginBottom: 20,
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
    marginTop: 25,
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
  backButton: {
    flexDirection: "row",
    backgroundColor: "#1A1B41",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 15,
    alignItems: "center",
    flex: 0.48,
    justifyContent: "center",
  },
  registerButtonText: {
    color: "#1A1B41",
    fontFamily: "SpaceGrotesk-Bold",
    fontSize: 15,
  },
  backButtonText: {
    color: "#F2D8C2",
    fontFamily: "SpaceGrotesk-Bold",
    fontSize: 15,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  loginLinkText: {
    alignSelf: "center",
    marginTop: 15,
    color: "#1A1B41",
    fontSize: 14,
    fontFamily: "SpaceGrotesk-Bold",
    textDecorationLine: "underline",
  },
});
