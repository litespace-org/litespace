import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { Slot } from "expo-router";
import { useColorScheme } from "@/hooks/useColorScheme";
import { AtlasProvider } from "@litespace/headless/atlas";
import { Backend } from "@litespace/types";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import "react-native-reanimated";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const client = new QueryClient();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) return null;

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <QueryClientProvider client={client}>
        <AtlasProvider backend={Backend.Staging} getToken={() => ""}>
          {/* <Stack> */}
          {/* <Stack.Screen name="login" /> */}
          {/* <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" /> */}
          {/* </Stack> */}
          <Slot />
        </AtlasProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
