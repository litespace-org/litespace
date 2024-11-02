import { asCalendarEvents } from "@/lib/rule";
import { Event } from "@litespace/luna/components/Calendar";
import { IRule } from "@litespace/types";
import { Dayjs } from "dayjs";
import dayjs from "@/lib/dayjs";
import { useCallback, useEffect, useMemo, useState } from "react";

type UnpackRules = { rules: IRule.Self[] };
type UnpackRule = { rule: IRule.Self };
type Payload = UnpackRules | UnpackRule;

export function useCalendarEvents(payload: Payload) {
  const [events, setEvents] = useState<Event[]>([]);

  const isRules = useCallback(
    (payload: Payload): payload is UnpackRules => "rules" in payload,
    []
  );

  const rules = useMemo(
    () => (isRules(payload) ? payload.rules : [payload.rule]),
    [isRules, payload]
  );

  const unpack = useCallback(
    (start: Dayjs, end: Dayjs, rules: IRule.Self[]) => {
      setEvents(
        asCalendarEvents({
          rules,
          start: start.toISOString(),
          end: end.toISOString(),
        })
      );
    },
    []
  );

  const unpackRule = useCallback(
    (rule: IRule.Self) => {
      const start = dayjs.utc(rule.start);
      const end = dayjs.utc(rule.end);
      return unpack(start, end, [rule]);
    },
    [unpack]
  );

  const unapckWeek = useCallback(
    (week: Dayjs) => {
      const start = week.utc();
      const end = week.utc().add(7, "days");
      return unpack(start, end, rules);
    },
    [rules, unpack]
  );

  useEffect(() => {
    if (isRules(payload)) unapckWeek(dayjs().startOf("week"));
    else return unpackRule(payload.rule);
  }, [isRules, payload, unapckWeek, unpack, unpackRule]);

  return { unpack, unapckWeek, events };
}
