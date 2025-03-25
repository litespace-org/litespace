import { useUserContext } from "@litespace/headless/context/user";
import { useCallback, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useFindInterviewById } from "@litespace/headless/interviews";
import SessionWrapper from "@/components/Session/Session";
import { INTERVIEW_DURATION } from "@litespace/utils";

const Interview = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useUserContext();

  const interviewId = useMemo(() => {
    if (!id) return;
    const interviewId = Number(id);
    if (Number.isNaN(interviewId)) return;
    return interviewId;
  }, [id]);

  const interview = useFindInterviewById(interviewId);

  const interviewMembers = useMemo(() => {
    if (!interview.data || !user) return null;
    const current = interview.data.members.find(
      (member) => member.userId === user.id
    );

    const other = interview.data.members.find(
      (member) => member.userId !== user.id
    );

    if (!current || !other) return null;
    return { current, other };
  }, [interview.data, user]);

  const [chatEnabled, setChatEnabled] = useState<boolean>(false);

  const toggleChat = useCallback(() => {
    setChatEnabled((prev) => !prev);
  }, []);

  return (
    <SessionWrapper
      loading={interview.isPending}
      error={interview.isError}
      refetch={interview.refetch}
      chatEnabled={chatEnabled}
      type="interview"
      toggleChat={toggleChat}
      id={interviewId}
      sessionData={
        interview.data
          ? {
              start: interview.data.interview.start,
              duration: INTERVIEW_DURATION,
              sessionId: interview.data.interview.ids.session,
            }
          : undefined
      }
      members={interviewMembers}
    />
  );
};

export default Interview;
