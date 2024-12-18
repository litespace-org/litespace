import { destructureInterviewStatus } from "@litespace/sol/interview";
import { ICall, IInterview } from "@litespace/types";
import React, { useMemo } from "react";
import PendingInterview from "@/components/TutorOnboardingSteps/Interview/ScheduledInterview/PendingInterview";
import PassedInterview from "@/components/TutorOnboardingSteps/Interview/ScheduledInterview/PassedInterview";

const ScheduledInterview: React.FC<{
  interview: IInterview.Self;
  call: ICall.Self;
  members: ICall.PopuldatedMember[];
}> = ({ interview, call, members }) => {
  // todo: handle canceled and rejected
  const { pending, passed, rejected, canceled } = useMemo(
    () => destructureInterviewStatus(interview.status),
    [interview.status]
  );

  const interviewer = useMemo(() => {
    return (
      members.find((member) => member.userId === interview.ids.interviewer) ||
      null
    );
  }, [interview.ids.interviewer, members]);

  return (
    <div>
      {pending && interviewer ? (
        <PendingInterview interviewer={interviewer} call={call} />
      ) : passed && interviewer ? (
        <PassedInterview
          feedback={interview.feedback.interviewer}
          interviewer={interviewer.name}
          interviewId={interview.ids.self}
        />
      ) : null}

      {rejected ? <h1>You got rejected - UI REQUIRED</h1> : null}
      {canceled ? <h1>Interview got canceled - UI REQUIRED</h1> : null}
    </div>
  );
};

export default ScheduledInterview;
