import { Platform } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";

export default function ModalScreen() {
  return (
    <Box className="flex-1 flex items-center justify-center">
      <Text className="text-lg font-bold text-natural-950">Modal</Text>
      <Box className="mv-4 h-1 w-4/5 bg-natural-200" />

      {/* Use a light status bar on iOS to account for the black space above the modal */}
      <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
    </Box>
  );
}
