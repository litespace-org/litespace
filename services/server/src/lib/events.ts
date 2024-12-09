import { ILesson, IRule, ITutor } from "@litespace/types";
import { flatten } from "lodash";
import { Schedule } from "@litespace/sol/rule";
import dayjs from "./dayjs";

/*
 * returns IRule.RuleEvent objects from IRule.Cache for a specific tutor.
 * returned events are filtered to contain only bookable events.
 */
export function selectRuleEventsForTutor(
  rules: IRule.Cache[], 
  tutor: ITutor.Cache,
): IRule.RuleEvent[] {
  const now = dayjs.utc();

  const tutorRules = rules.filter((rule) => rule.tutor === tutor.id);
  const events = flatten(tutorRules.map((rule) => rule.events)).filter(
    (event) => {
      const adjustedNow = now.add(tutor.notice, "minutes");
      const start = dayjs.utc(event.start);
      const same = start.isSame(adjustedNow);
      const after = start.isAfter(adjustedNow);
      // NOTE: users can book after the start of the event!?
      const between = adjustedNow.isBetween(
        event.start,
        // rule should have some time suitable for booking at least one short lesson.
        dayjs.utc(event.end).subtract(ILesson.Duration.Short, "minutes"),
        "minute",
        "[]"
      );
      return same || after || between;
    }
  );

  return Schedule.order(events, "asc");
}
