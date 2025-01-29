import { useIntl } from "react-intl";
import { FormatterMap } from "@litespace/utils/time";
import { useMemo } from "react";
import { messages } from "@/locales";
import { WeekdayMap } from "@/components/WeekdayPicker";

export function useTimeFormatterMap(): FormatterMap {
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

export function useWeekdayMap(): WeekdayMap {
  const intl = useIntl();
  return {
    saturday: intl.formatMessage({ id: messages["global.days.sat"] }),
    sunday: intl.formatMessage({ id: messages["global.days.sun"] }),
    monday: intl.formatMessage({ id: messages["global.days.mon"] }),
    tuesday: intl.formatMessage({ id: messages["global.days.tue"] }),
    wednesday: intl.formatMessage({ id: messages["global.days.wed"] }),
    thursday: intl.formatMessage({ id: messages["global.days.thu"] }),
    friday: intl.formatMessage({ id: messages["global.days.fri"] }),
    all: intl.formatMessage({ id: messages["global.labels.all"] }),
    reset: intl.formatMessage({ id: messages["global.labels.cancel"] }),
  };
}
