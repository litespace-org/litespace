import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { Slot } from "expo-router";
import { useColorScheme } from "@/hooks/useColorScheme";
import { BackendProvider } from "@litespace/headless/backend";
import { AtlasProvider } from "@litespace/headless/atlas";
import { PeerProvider } from "@litespace/headless/peer";
import { SocketProvider } from "@litespace/headless/socket";
import { Backend } from "@litespace/types";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import "react-native-reanimated";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const client = new QueryClient();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [token, setToken] = useState<string | null>(null);
  const [loaded] = useFonts({
    // eslint-disable-next-line @typescript-eslint/no-require-imports
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
        <BackendProvider backend={Backend.Staging} getToken={() => token}>
          <AtlasProvider>
            <SocketProvider>
              <PeerProvider>
                <Slot />
              </PeerProvider>
            </SocketProvider>
          </AtlasProvider>
        </BackendProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
