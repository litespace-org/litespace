import { atlas } from "@litespace/luna/backend";
import { IInterview } from "@litespace/types";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

export function useInterviews(user: number) {
  return useQuery({
    queryFn: async () => {
      return await atlas.interview.findInterviews({ user });
    },
    queryKey: ["get-tutuor-interviews"],
  });
}

export function useInterviewStatus(status: IInterview.Status) {
  return useMemo(() => {
    const passed = status === IInterview.Status.Passed;
    const pending = status === IInterview.Status.Pending;
    const rejected = status === IInterview.Status.Rejected;
    const canceled = status === IInterview.Status.Canceled;
    return { passed, pending, rejected, canceled };
  }, [status]);
}
