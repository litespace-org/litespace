import React, { useMemo, useState } from "react";
import { makeCall } from "@/lib/mediaCall";
import { MediaCallContext, MediaCallCtx } from "./context";
import { useFindLesson } from "@litespace/headless/lessons";
import { useUser } from "@litespace/headless/context/user";
import { CallMember } from "@/modules/MediaCall/CallMember";

export const MediaCallProvider: React.FC<{
  children: React.ReactNode;
  lessonId: number;
}> = ({ children, lessonId }) => {
  const { user } = useUser();
  const lessonQuery = useFindLesson(lessonId);

  const [curMember, setCurMember] = useState<CallMember | null>(null);
  const [inMembers, setInMembers] = useState<CallMember[]>([]);

  const callManager = useMemo(() => {
    if (!user || !lessonQuery.data) return null;

    const memberIds = lessonQuery.data?.members.map((m) => m.userId);
    const ordered = [user.id, ...memberIds.filter((id) => id !== user.id)];

    return makeCall(
      ordered.map((id) => id.toString()),
      {
        onMemberConnect: {
          after: (s) => setInMembers(() => [...(s.getJoinedMembers() || [])]),
        },
        onMemberDisconnect: {
          after: (s) => setInMembers(() => [...(s.getJoinedMembers() || [])]),
        },
        onMemberMicPublish: {
          after: (s) => setCurMember(() => s.curMember.clone()),
        },
        onMemberCamPublish: {
          after: (s) => setCurMember(() => s.curMember.clone()),
        },
        onMemberMicChange: {
          after: (s) => setCurMember(() => s.curMember.clone()),
        },
        onMemberCamChange: {
          after: (s) => setCurMember(() => s.curMember.clone()),
        },
      }
    );
  }, [lessonQuery.data, user, setInMembers]);

  const ctx = useMemo<MediaCallCtx>(
    () => ({
      manager: callManager,
      curMember,
      inMembers,
    }),
    [callManager, inMembers, curMember]
  );

  return (
    <MediaCallContext.Provider value={ctx}>
      {children}
    </MediaCallContext.Provider>
  );
};
