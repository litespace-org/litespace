import { Event } from "@litespace/ui/Calendar";
import { unpackRules } from "@litespace/utils/rule";
import { IRule } from "@litespace/types";
import { first, groupBy } from "lodash";

export function asCalendarEvents({
  rules,
  start,
  end,
}: {
  rules: IRule.Self[];
  start: string;
  end: string;
}): Event[] {
  const ruleMap = groupBy(rules, "id");
  const events = unpackRules({ rules, slots: [], start, end });

  return events.map((event) => {
    const rules = ruleMap[event.id];
    const rule = first(rules);
    const title = rule ? rule.title : "";
    return {
      id: event.id,
      start: event.start,
      end: event.end,
      wrapper: null,
      title,
    };
  });
}
