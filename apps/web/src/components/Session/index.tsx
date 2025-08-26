import { ISession, Void } from "@litespace/types";
import React from "react";
import { RoomContext } from "@livekit/components-react";
import Session from "@/components/Session/Session";
import { useRoom } from "@/components/Session/room";
import { LocalMember, RemoteMember } from "@/components/Session/types";
import PreSession from "@/components/Session/PreSession";
import { getEmailUserName } from "@litespace/utils";
import { useGetSessionToken } from "@litespace/headless/sessions";
import { useOnError } from "@/hooks/error";
import { Loading, LoadingError } from "@litespace/ui/Loading";

const Main: React.FC<{
  type: ISession.Type;
  sessionId: ISession.Id;
  localMember: LocalMember;
  remoteMember: RemoteMember;
  start: string;
  duration: number;
  onLeave: Void;
}> = ({
  type,
  sessionId,
  localMember,
  remoteMember,
  start,
  duration,
  onLeave,
}) => {
  const tokenQuery = useGetSessionToken(sessionId);
  const { room, published, connected } = useRoom(
    sessionId,
    tokenQuery.data?.token
  );

  useOnError({
    type: "query",
    error: tokenQuery.error,
    keys: tokenQuery.keys,
  });

  if (tokenQuery.isLoading)
    return (
      <div className="mx-auto mt-[15vh]">
        <Loading size="large" />
      </div>
    );

  if (tokenQuery.isError || !tokenQuery.data)
    return (
      <div className="mx-auto mt-[15vh]">
        <LoadingError size="small" retry={tokenQuery.refetch} />
      </div>
    );

  return (
    <RoomContext.Provider value={room}>
      {!published ? (
        <PreSession
          type={type}
          start={start}
          duration={duration}
          localMemberId={localMember.id}
          localMemberName={
            localMember.name || getEmailUserName(localMember.email)
          }
          localMemberRole={localMember.role}
          localMemberImage={localMember.image}
          remoteMemberId={remoteMember.id}
          remoteMemberRole={remoteMember.role}
        />
      ) : null}

      {published && connected ? (
        <Session
          localMember={localMember}
          remoteMember={remoteMember}
          leave={() => {
            room.disconnect().then(() => onLeave());
          }}
        />
      ) : null}
    </RoomContext.Provider>
  );
};

export default Main;
