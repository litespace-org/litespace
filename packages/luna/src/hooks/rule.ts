import { RuleFormatterMap } from "@litespace/sol";
import { useIntl } from "react-intl";
import { useTimeFormatterMap } from "@/hooks/datetime";
import { IDate, IRule } from "@litespace/types";
import { messages } from "@/locales";

export function useRuleFormatterMap(): RuleFormatterMap {
  const intl = useIntl();
  const time = useTimeFormatterMap();
  return {
    days: {
      [IDate.Weekday.Sunday]: intl.formatMessage({
        id: messages["global.days.sun"],
      }),
      [IDate.Weekday.Monday]: intl.formatMessage({
        id: messages["global.days.mon"],
      }),
      [IDate.Weekday.Tuesday]: intl.formatMessage({
        id: messages["global.days.tue"],
      }),
      [IDate.Weekday.Wednesday]: intl.formatMessage({
        id: messages["global.days.wed"],
      }),
      [IDate.Weekday.Thursday]: intl.formatMessage({
        id: messages["global.days.thu"],
      }),
      [IDate.Weekday.Friday]: intl.formatMessage({
        id: messages["global.days.fri"],
      }),
      [IDate.Weekday.Saturday]: intl.formatMessage({
        id: messages["global.days.sat"],
      }),
    },
    frequency: {
      [IRule.Frequency.Daily]: intl.formatMessage({
        id: messages["global.schedule.rule.format.freq.daily"],
      }),
      [IRule.Frequency.Weekly]: intl.formatMessage({
        id: messages["global.schedule.rule.format.freq.weekly"],
      }),
      [IRule.Frequency.Monthly]: intl.formatMessage({
        id: messages["global.schedule.rule.format.freq.monthly"],
      }),
    },
    labels: {
      monthday: {
        prefix: intl.formatMessage({
          id: messages["global.schedule.rule.format.monthday.prefix"],
        }),
        suffix: intl.formatMessage({
          id: messages["global.schedule.rule.format.monthday.suffix"],
        }),
      },
      start: intl.formatMessage({
        id: messages["global.schedule.rule.format.start"],
      }),
      until: intl.formatMessage({
        id: messages["global.schedule.rule.format.until"],
      }),
      from: intl.formatMessage({
        id: messages["global.schedule.rule.format.from"],
      }),
      onDay: intl.formatMessage({
        id: messages["global.schedule.rule.format.onDay"],
      }),
      day: intl.formatMessage({
        id: messages["global.schedule.rule.format.day"],
      }),
      weekdaySeperator: intl.formatMessage({
        id: messages["global.schedule.rule.format.weekday.seperator"],
      }),
    },
    time,
  };
}
