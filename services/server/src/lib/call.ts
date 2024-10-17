import { unpackRules } from "@litespace/sol";
import { ICall, IRule } from "@litespace/types";
import { isEmpty } from "lodash";
import dayjs from "@/lib/dayjs";

// todo: impl: each tutor can have interview each 3 months.
export function canBeInterviewed(calls: ICall.Self[]): boolean {
  if (isEmpty(calls)) return true;
  return false;
}

export function canBook({
  rule,
  calls,
  call,
}: {
  rule: IRule.Self;
  calls: ICall.Self[];
  call: { start: string; duration: number };
}) {
  const start = dayjs.utc(call.start).startOf("day");
  const end = start.add(1, "day");
  const events = unpackRules({
    calls,
    rules: [rule],
    start: start.toISOString(),
    end: end.toISOString(),
  });
  if (isEmpty(events)) return false;

  const callStart = dayjs.utc(call.start);
  const callEnd = callStart.add(call.duration, "minutes");

  for (const event of events) {
    if (
      (callStart.isSame(event.start) || callStart.isAfter(event.end)) &&
      (callEnd.isSame(event.end) || callEnd.isBefore(event.end))
    )
      return true;
  }

  return false;
}
