import { LocalId } from "@/locales/request";
import { RichTranslationValues, useTranslations } from "next-intl";

import React, { useCallback, useMemo } from "react";

export function useFormatMessage() {
  const intl = useTranslations();

  const format = useCallback(
    (id: LocalId, values?: Record<string, string | number>) => intl(id, values),
    [intl]
  );

  return useMemo(
    () =>
      Object.assign(format, {
        rich: (id: LocalId, values?: RichTranslationValues): React.ReactNode =>
          intl.rich(id, values),
      }),
    [format, intl]
  );
}
