import { IInterview } from "@litespace/types";
import { maxBy } from "lodash";
import dayjs from "@/lib/dayjs";

export function selectCurrentInterview(
  interviews: IInterview.Self[]
): IInterview.Self | null {
  const current = maxBy(interviews, (interview) =>
    dayjs.utc(interview.createdAt).unix()
  );
  return current || null;
}
