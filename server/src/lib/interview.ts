import { IInterview } from "@litespace/types";
import { maxBy } from "lodash";
import dayjs from "@/lib/dayjs";

export function canBeInterviewed(interviews: IInterview.Self[]) {
  const recent = maxBy(interviews, (interview) =>
    dayjs(interview.createdAt).unix()
  );
  if (!recent) return true;
  if (recent.passed) return false;
  return (
    !recent.passed &&
    dayjs.utc(recent.createdAt).isBefore(dayjs.utc().subtract(6, "months"))
  );
}
