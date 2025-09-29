import { LocalMap, messages } from "@/locales";
import React, { useCallback, useMemo } from "react";
import { PrimitiveType, useIntl } from "react-intl";

type ReplaceParts = (text: string[]) => React.ReactNode;

export function useFormatMessage() {
  const intl = useIntl();

  const format = useCallback(
    (id: keyof LocalMap, values?: Record<string, PrimitiveType>): string =>
      intl.formatMessage({ id: messages[id] }, values),
    [intl]
  );

  return useMemo(
    () =>
      Object.assign(format, {
        rich: (
          id: keyof LocalMap,
          values?: Record<
            string,
            React.ReactNode | PrimitiveType | ReplaceParts
          >
        ): React.ReactNode => intl.formatMessage({ id: messages[id] }, values),
      }),
    [format, intl]
  );
}
