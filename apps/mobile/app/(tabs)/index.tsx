import { Button } from "@/components";
import { Checkbox } from "@/components/Checkbox";
import { Switch } from "@/components/Switch";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { useFormatMessage } from "@/hooks/intl";

export default function TabOneScreen() {
  const intl = useFormatMessage();
  return (
    <Box className="flex-1 flex items-center justify-center">
      <Text className="text-xl text-bold text-brand-700">Tab One</Text>
      <Box className="flex flex-col gap-4 w-4/5 mv-[30px]">
        <Button type="main" variant="primary" size="large">
          {intl("labels.done")}
        </Button>
        <Switch size="large" />
        <Checkbox label="check me" />
      </Box>
    </Box>
  );
}
