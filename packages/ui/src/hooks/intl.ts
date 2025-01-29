import { LocalMap, messages } from "@/locales";
import React, { useCallback, useMemo } from "react";
import { PrimitiveType, useIntl } from "react-intl";

export function useFormatMessage() {
  const intl = useIntl();

  const format = useCallback(
    (id: keyof LocalMap, values?: Record<string, PrimitiveType>) =>
      intl.formatMessage({ id: messages[id] }, values),
    [intl]
  );

  return useMemo(
    () =>
      Object.assign(format, {
        node: (
          id: keyof LocalMap,
          values?: Record<string, PrimitiveType | React.ReactNode>
        ): React.ReactNode => intl.formatMessage({ id: messages[id] }, values),
      }),
    [format, intl]
  );
}
