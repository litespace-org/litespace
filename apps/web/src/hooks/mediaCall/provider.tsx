import React, { useMemo, useState } from "react";
import { makeCall } from "@/lib/mediaCall";
import { MediaCallContext, MediaCallCtx } from "@/hooks/mediaCall/context";
import { useFindLesson } from "@litespace/headless/lessons";
import { useUser } from "@litespace/headless/context/user";
import { CallMember } from "@/modules/MediaCall/CallMember";
import { useCallErrorHandler } from "@/hooks/error";

export const MediaCallProvider: React.FC<{
  children: React.ReactNode;
  lessonId: number;
}> = ({ children, lessonId }) => {
  const { user } = useUser();
  const lessonQuery = useFindLesson(lessonId);
  const errorHandler = useCallErrorHandler();

  const [curMember, setCurMember] = useState<CallMember | null>(null);
  const [inMembers, setInMembers] = useState<CallMember[]>([]);

  const callManager = useMemo(() => {
    if (!user || !lessonQuery.data) return null;

    const members = lessonQuery.data?.members;
    const memberIds = members.map((m) => m.userId);
    const ordered = [user.id, ...memberIds.filter((id) => id !== user.id)];

    const call = makeCall(
      ordered.map((id) => id.toString()),
      {
        onMemberConnect: {
          after: (s) => {
            setInMembers(() => [...(s.getJoinedMembers() || [])]);
            setCurMember(() => s.curMember.clone());
          },
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
        onMemberScreenPublish: {
          after: (s) => {
            setInMembers(() => [...(s.getJoinedMembers() || [])]);
            setCurMember(() => s.curMember.clone());
          },
        },
        onMemberMicChange: {
          after: (s) => setCurMember(() => s.curMember.clone()),
        },
        onMemberCamChange: {
          after: (s) => setCurMember(() => s.curMember.clone()),
        },
        onMemberScreenChange: {
          after: (s) => {
            setInMembers(() => [...(s.getJoinedMembers() || [])]);
            setCurMember(() => s.curMember.clone());
          },
        },
        onMemberConnectionStateChange: {
          after: (s) => {
            setInMembers(() => [...(s.getJoinedMembers() || [])]);
            setCurMember(() => s.curMember.clone());
          },
        },
      },
      errorHandler || undefined
    );

    // Set members info
    for (const member of members) {
      const memObj = call.session.getMember(member.userId.toString());
      memObj?.setInfo({
        name: member.name || undefined,
        imgSrc: member.image || undefined,
      });
    }

    return call;
  }, [lessonQuery.data, user, setInMembers, errorHandler]);

  const connected = useMemo(() => {
    return !!inMembers.find((m) => m.id === curMember?.id);
  }, [inMembers, curMember]);

  const ctx = useMemo<MediaCallCtx>(
    () => ({
      manager: callManager,
      curMember,
      inMembers,
      connected,
      errorHandler,
    }),
    [callManager, inMembers, curMember, connected, errorHandler]
  );

  return (
    <MediaCallContext.Provider value={ctx}>
      {children}
    </MediaCallContext.Provider>
  );
};
