import { unpackRules } from "@litespace/sol/rule";
import { ICall, IInterview, ILesson, IRule } from "@litespace/types";
import { concat, isEmpty } from "lodash";
import dayjs from "@/lib/dayjs";
import { platformConfig } from "@/constants";

// todo: impl: each tutor can have interview each 3 months.
export function canBeInterviewed(calls: ICall.Self[]): boolean {
  if (isEmpty(calls)) return true;
  return false;
}

export function canBook({
  rule,
  lessons = [],
  interviews = [],
  slot,
}: {
  rule: IRule.Self;
  lessons?: ILesson.Self[];
  interviews?: IInterview.Self[];
  slot: { start: string; duration: number };
}) {
  const start = dayjs.utc(slot.start).startOf("day");
  const end = start.add(1, "day");
  const lessonSlots: IRule.Slot[] = lessons.map((lesson) => ({
    ruleId: lesson.ruleId,
    start: lesson.start,
    duration: lesson.duration,
  }));
  const interviewSlots: IRule.Slot[] = interviews.map((interview) => ({
    ruleId: interview.ids.rule,
    start: interview.start,
    duration: platformConfig.interviewDuration,
  }));
  const unpackedRules = unpackRules({
    rules: [rule],
    slots: concat(lessonSlots, interviewSlots),
    start: start.toISOString(),
    end: end.toISOString(),
  });
  if (isEmpty(unpackedRules)) return false;

  const slotStart = dayjs.utc(slot.start);
  const slotEnd = slotStart.add(slot.duration, "minutes");

  /**
   * Check if the incoming slot can fit in one of the unpacked rules.
   */
  for (const unpackedRule of unpackedRules) {
    const after =
      slotStart.isSame(unpackedRule.start) ||
      slotStart.isAfter(unpackedRule.end);
    const before =
      slotEnd.isSame(unpackedRule.end) || slotEnd.isBefore(unpackedRule.end);
    const between = after && before;
    if (between) return true;
  }

  return false;
}
