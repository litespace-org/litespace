import { LocalMap, messages } from "@/locales";
import { useCallback } from "react";
import { PrimitiveType, useIntl } from "react-intl";

export function useFormatMessage() {
  const intl = useIntl();

  return useCallback(
    (id: keyof LocalMap, values?: Record<string, PrimitiveType>) =>
      intl.formatMessage({ id: messages[id] }, values) as string,
    [intl]
  );
}
