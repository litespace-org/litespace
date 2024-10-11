import { ICall, IInterview, IUser } from "@litespace/types";
import React from "react";

const ScheduledInterview: React.FC<{
  interviewer: IUser.Self;
  interview: IInterview.Self;
  call: ICall.Self;
}> = () => {
  // const intl = useIntl();

  // const pending = useMemo(() => {
  //   return !interview.approved || !interview.passed;
  // }, [interview.approved, interview.passed]);

  // const success = useMemo(() => {
  //   return interview.approved && interview.passed;
  // }, [interview.approved, interview.passed]);

  // const failed = useMemo(() => {
  //   return interview.approved === false || interview.passed === false;
  // }, [interview]);

  return (
    <div>
      UI REQUIRED
      {/* {pending ? (
        <PendingInterview interviewer={interviewer} call={call} />
      ) : success ? (
        <PassedInterview
          feedback={interview.feedback.interviewer}
          interviewer={interviewer.name}
          interviewId={interview.ids.self}
        />
      ) : null} */}
    </div>
  );
};

export default ScheduledInterview;
