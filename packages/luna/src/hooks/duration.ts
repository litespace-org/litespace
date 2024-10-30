import { messages } from "@/locales";
import { UnitMap, UnitMapShort } from "@litespace/sol/duration";
import { useMemo } from "react";
import { useIntl } from "react-intl";

export function useDurationUnitMap(): { short: UnitMapShort; long: UnitMap } {
  const intl = useIntl();

  return useMemo(
    () => ({
      long: {
        hour: intl.formatMessage({ id: messages["global.duration.hour"] }),
        hours: intl.formatMessage({ id: messages["global.duration.hours"] }),
        pairHours: intl.formatMessage({
          id: messages["global.duration.hours.pair"],
        }),
        minute: intl.formatMessage({ id: messages["global.duration.minute"] }),
        mintues: intl.formatMessage({
          id: messages["global.duration.minutes"],
        }),
        pairMinutes: intl.formatMessage({
          id: messages["global.duration.minutes.pair"],
        }),
        seperator: intl.formatMessage({
          id: messages["global.duration.seperator"],
        }),
      },
      short: {
        hour: intl.formatMessage({
          id: messages["global.duration.hour.short"],
        }),
        minute: intl.formatMessage({
          id: messages["global.duration.minute.short"],
        }),
      },
    }),
    [intl]
  );
}
