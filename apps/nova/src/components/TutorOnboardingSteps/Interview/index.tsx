import { atlas } from "@/lib/atlas";
import { Spinner } from "@litespace/luna";
import { IInterview } from "@litespace/types";
import React, { useCallback, useMemo } from "react";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { marked } from "marked";
import markdown from "@/markdown/tutorOnboarding/interview.md?raw";
import RawHtml from "@/components/TutorOnboardingSteps/RawHtml";
import ScheduleInterview from "@/components/TutorOnboardingSteps/Interview/ScheduleInterview";
import ScheduledInterview from "@/components/TutorOnboardingSteps/Interview/ScheduledInterview";

const Interview: React.FC<{
  interviews: UseQueryResult<IInterview.Self[], unknown>;
  currentInterview: IInterview.Self | null;
}> = ({ interviews, currentInterview }) => {
  const interviewCall = useQuery({
    queryFn: async () => {
      if (!currentInterview) return null;
      return await atlas.call.findById(currentInterview.ids.call);
    },
    queryKey: ["find-interview-call"],
    enabled: !!currentInterview,
  });

  const interviewer = useQuery({
    queryKey: ["select-interviewer"],
    queryFn: () => atlas.user.selectInterviewer(),
    retry: false,
  });

  const onScheduleSuccess = useCallback(() => {
    interviews.refetch();
  }, [interviews]);

  const html = useMemo(() => {
    return marked.parse(
      markdown.replace(/{interviewer}/gi, interviewer.data?.name || ""),
      { async: false }
    );
  }, [interviewer.data?.name]);

  const finalDecision = useMemo(
    () =>
      currentInterview &&
      currentInterview.passed !== null &&
      currentInterview.approved !== null,
    [currentInterview]
  );

  if (interviewer.isLoading || interviews.isLoading || interviewCall.isLoading)
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Spinner />
      </div>
    );

  return (
    <div className="pb-10 flex flex-col w-full">
      {!finalDecision ? <RawHtml html={html} /> : null}

      {currentInterview && interviewCall.data && interviewer.data ? (
        <ScheduledInterview
          interviewer={interviewer.data}
          interview={currentInterview}
          call={interviewCall.data}
        />
      ) : interviewer.data ? (
        <ScheduleInterview
          interviewer={interviewer.data}
          onSuccess={onScheduleSuccess}
        />
      ) : null}
    </div>
  );
};

export default Interview;
