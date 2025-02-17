import { IInterview } from "@litespace/types";
import { LocalDashId } from "@/lib/intl";

export const interviewStatusMap: Record<IInterview.Status, LocalDashId> = {
  [IInterview.Status.Pending]: "dashboard.interview.status.pending",
  [IInterview.Status.Passed]: "dashboard.interview.status.passed",
  [IInterview.Status.Rejected]: "dashboard.interview.status.rejected",
  [IInterview.Status.Canceled]: "dashboard.interview.status.canceled",
};
