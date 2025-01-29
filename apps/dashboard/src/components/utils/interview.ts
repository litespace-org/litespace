import { LocalId } from "@litespace/ui/locales";
import { IInterview } from "@litespace/types";

export const interviewStatusMap: Record<IInterview.Status, LocalId> = {
  [IInterview.Status.Pending]: "dashboard.interview.status.pending",
  [IInterview.Status.Passed]: "dashboard.interview.status.passed",
  [IInterview.Status.Rejected]: "dashboard.interview.status.rejected",
  [IInterview.Status.Canceled]: "dashboard.interview.status.canceled",
};
