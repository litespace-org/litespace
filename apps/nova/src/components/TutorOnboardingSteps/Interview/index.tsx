import { Element, IInterview } from "@litespace/types";
import React, { useCallback, useMemo } from "react";
import { UseQueryResult } from "@tanstack/react-query";
import { marked } from "marked";
import markdown from "@/markdown/tutorOnboarding/interview.md?raw";
import RawHtml from "@/components/TutorOnboardingSteps/RawHtml";
import ScheduleInterview from "@/components/TutorOnboardingSteps/Interview/ScheduleInterview";
// import ScheduledInterview from "@/components/TutorOnboardingSteps/Interview/ScheduledInterview";

const Interview: React.FC<{
  interviews: UseQueryResult<IInterview.FindInterviewsApiResponse, unknown>;
  current: Element<IInterview.FindInterviewsApiResponse["list"]> | null;
}> = ({ interviews, current }) => {
  const onScheduleSuccess = useCallback(() => {
    interviews.refetch();
  }, [interviews]);

  const interviewer = useMemo(() => {
    if (!current) return null;
    return current.members.find(
      (member) => member.userId === current.interview.ids.interviewer
    );
  }, [current]);

  const html = useMemo(() => {
    return marked.parse(
      markdown.replace(/{interviewer}/gi, interviewer?.name || ""),
      { async: false }
    );
  }, [interviewer?.name]);

  return (
    <div className="pb-10 flex flex-col w-full">
      <RawHtml html={html} />

      <ScheduleInterview onSuccess={onScheduleSuccess} />

      {/* {currentInterview && interviewCall.data && interviewer.data ? (
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
      ) : null} */}
    </div>
  );
};

export default Interview;
