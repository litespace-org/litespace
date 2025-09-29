import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";

export default function TabOneScreen() {
  return (
    <Box className="flex-1 flex items-center justify-center">
      <Text className="text-xl text-bold text-brand-700">Tab One</Text>
      <Box className="w-4/5 h-1 mv-[30px]" />
    </Box>
  );
}
