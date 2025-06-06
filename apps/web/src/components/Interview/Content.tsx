import { useOnError } from "@/hooks/error";
import { useFindInterviews } from "@litespace/headless/interviews";
import { IUser } from "@litespace/types";
import { INTERVIEW_DURATION } from "@litespace/utils/constants";
import { first } from "lodash";
import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Session from "@/components/Session";
import { Loading, LoadingError } from "@litespace/ui/Loading";
import { isRegularTutorRole, isTutorManagerRole } from "@litespace/utils/user";
import { Web } from "@litespace/utils/routes";

const Content: React.FC<{ interviewId: number; self: IUser.Self }> = ({
  interviewId,
  self,
}) => {
  const navigate = useNavigate();

  const { query: interviewsQuery } = useFindInterviews({
    ids: [interviewId],
    size: 1,
  });

  useOnError({
    type: "query",
    error: interviewsQuery.error,
    keys: interviewsQuery.keys,
  });

  const interview = useMemo(() => {
    return first(interviewsQuery.data?.list) || null;
  }, [interviewsQuery.data?.list]);

  const remoteMember = useMemo(() => {
    if (self.role === IUser.Role.TutorManager) return interview?.interviewer;
    return interview?.interviewee;
  }, [interview?.interviewee, interview?.interviewer, self.role]);

  if (interviewsQuery.isLoading)
    return (
      <div className="mx-auto mt-[15vh]">
        <Loading size="large" />
      </div>
    );

  if (
    interviewsQuery.isError ||
    !interviewsQuery.data ||
    !interview ||
    !remoteMember
  )
    return (
      <div className="mx-auto mt-[15vh]">
        <LoadingError size="small" retry={interviewsQuery.refetch} />
      </div>
    );

  return (
    <Session
      type="interview"
      sessionId={interview.sessionId}
      remoteMember={remoteMember}
      localMember={self}
      onLeave={() => {
        if (isTutorManagerRole(self.role)) return navigate(Web.TutorDashboard);
        if (isRegularTutorRole(remoteMember.role))
          return navigate(Web.TutorOnboarding);
      }}
      start={interview.start}
      duration={INTERVIEW_DURATION}
    />
  );
};

export default Content;
