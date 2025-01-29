import { IInterview } from "@litespace/types";

export function destructureInterviewStatus(status: IInterview.Status) {
  return {
    pending: status === IInterview.Status.Pending,
    canceled: status === IInterview.Status.Canceled,
    passed: status === IInterview.Status.Passed,
    rejected: status === IInterview.Status.Rejected,
  };
}
