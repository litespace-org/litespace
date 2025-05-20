import { ISession, Void } from "@litespace/types";
import React from "react";
import { RoomContext } from "@livekit/components-react";
import Session from "@/components/Session/Session";
import { useRoom } from "@/components/Session/room";
import { LocalMember, RemoteMember } from "@/components/Session/types";
import PreSession from "@/components/Session/PreSession";
import { getEmailUserName } from "@litespace/utils";

const Main: React.FC<{
  id: ISession.Id;
  type: ISession.Type;
  localMember: LocalMember;
  remoteMember: RemoteMember;
  start: string;
  duration: number;
  token: string;
  onLeave: Void;
}> = ({ id, token, localMember, remoteMember, start, duration, onLeave }) => {
  const { room, publised } = useRoom(token);

  return (
    <RoomContext.Provider value={room}>
      {!publised ? (
        <PreSession
          start={start}
          duration={duration}
          localMemberId={localMember.id}
          localMemberName={
            localMember.name || getEmailUserName(localMember.email)
          }
          localMemberImage={localMember.image}
          remoteMemberId={remoteMember.id}
          remoteMemberRole={remoteMember.role}
        />
      ) : null}

      {publised ? (
        <Session
          id={id}
          localMember={localMember}
          remoteMember={remoteMember}
          leave={() => {
            room.disconnect();
            onLeave();
          }}
        />
      ) : null}
    </RoomContext.Provider>
  );
};

export default Main;
