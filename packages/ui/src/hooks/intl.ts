import React, { useCallback, useMemo } from "react";
import { PrimitiveType, useIntl } from "react-intl";
import uiMessages from "@/locales/ar-eg.json" assert { type: "json" };

export function createFormatMessageHook<T extends Record<string, string>>(
  customMessages: T
) {
  return function useFormatMessage() {
    const intl = useIntl();

    const mergedMessages = useMemo(
      () => ({ ...uiMessages, ...customMessages }),
      []
    );

    const format = useCallback(
      (
        id: keyof typeof mergedMessages,
        values?: Record<string, PrimitiveType>
      ) => intl.formatMessage({ id: mergedMessages[id] }, values),
      [intl, mergedMessages]
    );

    return useMemo(
      () =>
        Object.assign(format, {
          node: (
            id: keyof typeof mergedMessages,
            values?: Record<string, PrimitiveType | React.ReactNode>
          ): React.ReactNode =>
            intl.formatMessage({ id: mergedMessages[id] }, values),
        }),
      [format, intl, mergedMessages]
    );
  };
}

// The generic intl for the ui packages
export const useFormatMessage = createFormatMessageHook({});
