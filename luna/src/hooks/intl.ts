import { LocalMap, messages } from "@/locales";
import React, { useCallback } from "react";
import { useIntl } from "react-intl";

export function useFormatMessage() {
  const intl = useIntl();

  return useCallback(
    (id: keyof LocalMap, values?: Record<string, React.ReactNode>) =>
      intl.formatMessage({ id: messages[id] }, values) as string,
    [intl]
  );
}
