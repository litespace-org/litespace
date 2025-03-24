import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { Slot } from "expo-router";
import { useColorScheme } from "@/hooks/useColorScheme";
import { ServerProvider } from "@litespace/headless/server";
import { ApiProvider } from "@litespace/headless/api";
import { SocketProvider } from "@litespace/headless/socket";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import "react-native-reanimated";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const client = new QueryClient();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <QueryClientProvider client={client}>
        <ServerProvider server="local">
          <ApiProvider>
            <SocketProvider>
              <Slot />
            </SocketProvider>
          </ApiProvider>
        </ServerProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
