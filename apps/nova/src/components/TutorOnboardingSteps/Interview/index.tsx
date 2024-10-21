import { Element, IInterview } from "@litespace/types";
import React, { useCallback, useMemo } from "react";
import { marked } from "marked";
import markdown from "@/markdown/tutorOnboarding/interview.md?raw";
import RawHtml from "@/components/TutorOnboardingSteps/RawHtml";
import ScheduleInterview from "@/components/TutorOnboardingSteps/Interview/ScheduleInterview";
import ScheduledInterview from "./ScheduledInterview";
// import ScheduledInterview from "@/components/TutorOnboardingSteps/Interview/ScheduledInterview";

const Interview: React.FC<{
  interviews: IInterview.FindPagedInterviewsProps;
  current: Element<IInterview.FindInterviewsApiResponse["list"]> | null;
}> = ({ interviews, current }) => {
  const onScheduleSuccess = useCallback(() => {
    interviews.query.refetch();
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
    <div className="flex flex-col w-full pb-10">
      <RawHtml html={html} />

      {current ? (
        <ScheduledInterview
          interview={current.interview}
          call={current.call}
          members={current.members}
        />
      ) : (
        <ScheduleInterview onSuccess={onScheduleSuccess} />
      )}
    </div>
  );
};

export default Interview;
