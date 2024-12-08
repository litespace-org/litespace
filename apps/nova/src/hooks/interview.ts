import { IInterview } from "@litespace/types";
import { useMemo } from "react";

export function useInterviewStatus(status: IInterview.Status) {
  return useMemo(() => {
    const passed = status === IInterview.Status.Passed;
    const pending = status === IInterview.Status.Pending;
    const rejected = status === IInterview.Status.Rejected;
    const canceled = status === IInterview.Status.Canceled;
    return { passed, pending, rejected, canceled };
  }, [status]);
}
