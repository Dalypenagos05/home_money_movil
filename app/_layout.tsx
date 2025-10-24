import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { initDatabase } from "../database/db";
import { AuthProvider } from "./lib/authContext";
import { ProfileProvider } from "./lib/profileContext";

export default function RootLayout() {
  
  const [fontsLoaded] = useFonts({
    "SpaceGrotesk": require("../assets/fonts/SpaceGrotesk.ttf"),
    "SpaceGrotesk-Bold": require("../assets/fonts/SpaceGrotesk-Bold.ttf"),
    "SpaceGrotesk-Medium": require("../assets/fonts/SpaceGrotesk-Medium.ttf"),
    "SpaceGrotesk-Regular": require("../assets/fonts/SpaceGrotesk-Regular.ttf"),
    "Montserrat": require("../assets/fonts/Montserrat.ttf"),
    "Montserrat-Bold": require("../assets/fonts/Montserrat-Bold.ttf"),
  });

  // Initialize database when app loads
  useEffect(() => {
    initDatabase();
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#2c2c54" />
      </View>
    );
  }

  return (
    <AuthProvider>
      <ProfileProvider>
        <Stack />
      </ProfileProvider>
    </AuthProvider>
  );
}
