import { IInterview } from "@litespace/types";

export function destructureInterviewStatus(status: IInterview.Status) {
  return {
    pending: status === IInterview.Status.Pending,
    passed: status === IInterview.Status.Passed,
    rejected: status === IInterview.Status.Rejected,
    canceledByInterviewer: status === IInterview.Status.CanceledByInterviewer,
    canceledByInterviewee: status === IInterview.Status.CanceledByInterviewee,
    canceled:
      status === IInterview.Status.CanceledByInterviewer ||
      status === IInterview.Status.CanceledByInterviewee,
  };
}
