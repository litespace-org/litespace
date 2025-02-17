import { LocalMap } from "@/locales/request";
import { useTranslations } from "next-intl";

import { useCallback, useMemo } from "react";

export function useFormatMessage() {
  const intl = useTranslations();

  const format = useCallback(
    (id: keyof LocalMap, values?: Record<string, string | number>) =>
      intl(id, values),
    [intl]
  );

  return useMemo(
    () =>
      Object.assign(format, {
        rich: (
          id: keyof LocalMap,
          values?: Record<string, string | number>
        ): React.ReactNode => intl(id, values),
      }),
    [format, intl]
  );
}
