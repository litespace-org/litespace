import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { Link, Stack } from "expo-router";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
      <Box className="flex-1 flex items-center justify-center p-[20px]">
        <Text className="text-lg font-bold">This screen doesn't exist.</Text>

        <Link href="/" className="mt-2 pv-2">
          <Text className="text-md text-brand-500">Go to home screen!</Text>
        </Link>
      </Box>
    </>
  );
}
