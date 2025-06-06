import { IInterview } from "@litespace/types";
import dayjs from "@/lib/dayjs";
import { INTERVIEW_MIN_RETRY_PERIOD_IN_DAYS } from "@litespace/utils/constants";

/**
 * @description tutor can book an interview in case:
 * 1. No previous interviews.
 * 2. He was rejected in his last interview that occured more than 3 months
 *    ago.
 * 3. The last interview was canceled
 */
export function canBeInterviewed(interview: IInterview.Self | null): boolean {
  const rejectedWhileAgo =
    interview?.status === IInterview.Status.Rejected &&
    dayjs.utc().diff(interview.createdAt, "days") >=
      INTERVIEW_MIN_RETRY_PERIOD_IN_DAYS;

  const canceled =
    interview?.status === IInterview.Status.CanceledByInterviewee ||
    interview?.status === IInterview.Status.CanceledByInterviewer;

  return !interview || rejectedWhileAgo || canceled;
}
