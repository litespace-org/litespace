import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { Slot } from "expo-router";
import { useColorScheme } from "@/hooks/useColorScheme";
import { AtlasProvider } from "@litespace/headless/atlas";
import { Backend } from "@litespace/types";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import "react-native-reanimated";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const client = new QueryClient();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [token, setToken] = useState<string | null>(null);
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  useEffect(() => {
    AsyncStorage.getItem("token").then((token) => setToken(token));
  }, []);

  if (!loaded) return null;

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <QueryClientProvider client={client}>
        <AtlasProvider backend={Backend.Staging} getToken={() => token}>
          <Slot />
        </AtlasProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
