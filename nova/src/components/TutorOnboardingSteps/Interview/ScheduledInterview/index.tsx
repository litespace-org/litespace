import { backend } from "@/lib/atlas";
import { asAssetUrl } from "@litespace/atlas";
import { Button, ButtonType, messages } from "@litespace/luna";
import { ICall, IInterview, IUser } from "@litespace/types";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";
import dayjs from "@/lib/dayjs";
import { Link } from "react-router-dom";
import { Route } from "@/types/routes";
import PendingInterview from "./PendingInterview";
import PassedInterview from "./PassedInterview";

const ScheduledInterview: React.FC<{
  interviewer: IUser.Self;
  interview: IInterview.Self;
  call: ICall.Self;
}> = ({ interview, interviewer, call }) => {
  const intl = useIntl();

  const pending = useMemo(() => {
    return !interview.approved || !interview.passed;
  }, [interview.approved, interview.passed]);

  const success = useMemo(() => {
    return interview.approved && interview.passed;
  }, [interview.approved, interview.passed]);

  const failed = useMemo(() => {
    return interview.approved === false || interview.passed === false;
  }, [interview]);

  return (
    <div>
      {pending ? (
        <PendingInterview interviewer={interviewer} call={call} />
      ) : success ? (
        <PassedInterview
          feedback={interview.feedback.interviewer}
          interviewer={interviewer.name.ar}
          interviewId={interview.ids.self}
        />
      ) : null}
    </div>
  );
};

export default ScheduledInterview;
