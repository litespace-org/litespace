import { IInterview, IUser } from "@litespace/types";
import { maxBy } from "lodash";
import dayjs from "@/lib/dayjs";

export function canBeInterviewed(interviews: IInterview.Self[]) {
  const recent = maxBy(interviews, (interview) =>
    dayjs(interview.createdAt).unix()
  );
  if (!recent) return true;
  if (recent.status === IInterview.Status.Passed) return false;
  return dayjs
    .utc(recent.createdAt)
    .isBefore(dayjs.utc().subtract(6, "months"));
}

export function asPopulatedMember(
  user: IUser.Self
): IInterview.PopulatedMember {
  return {
    image: user.image,
    name: user.name,
    userId: user.id,
    phone: user.phone,
    role: user.role,
    verifiedPhone: user.verifiedPhone,
  };
}
