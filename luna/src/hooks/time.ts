import { useIntl } from "react-intl";
import { FormatterMap } from "@litespace/sol";
import { useMemo } from "react";
import { messages } from "@/locales";

export function useFormatterMap(): FormatterMap {
  const intl = useIntl();

  return useMemo(
    () => ({
      midnight: intl.formatMessage({
        id: messages["global.time.segments.midnight"],
      }),
      morning: intl.formatMessage({
        id: messages["global.time.segments.morning"],
      }),
      noon: intl.formatMessage({
        id: messages["global.time.segments.noon"],
      }),
      afternoon: intl.formatMessage({
        id: messages["global.time.segments.afternoon"],
      }),
      night: intl.formatMessage({
        id: messages["global.time.segments.night"],
      }),
    }),
    [intl]
  );
}
