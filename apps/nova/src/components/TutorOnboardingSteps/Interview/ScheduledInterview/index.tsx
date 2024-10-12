import { destructureInterviewStatus } from "@litespace/sol";
import { ICall, IInterview } from "@litespace/types";
import React, { useMemo } from "react";
import PendingInterview from "./PendingInterview";
import PassedInterview from "./PassedInterview";

const ScheduledInterview: React.FC<{
  interview: IInterview.Self;
  call: ICall.Self;
  members: ICall.PopuldatedMember[];
}> = ({ interview, call, members }) => {
  // todo: handle canceled and rejected
  const { pending, passed } = useMemo(
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
    </div>
  );
};

export default ScheduledInterview;
