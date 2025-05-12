import { ISession, Void } from "@litespace/types";
import React from "react";
import { RoomContext } from "@livekit/components-react";
import Content from "@/components/SessionV3/Content";
import { useRoom } from "@/components/SessionV3/room";
import { LocalMember, RemoteMember } from "@/components/SessionV3/types";

const Main: React.FC<{
  type: ISession.Type;
  localMember: LocalMember;
  remoteMember: RemoteMember;
  token: string;
  onLeave: Void;
}> = ({ token, localMember, remoteMember, onLeave }) => {
  const room = useRoom(token);

  return (
    <RoomContext.Provider value={room}>
      <Content
        localMember={localMember}
        remoteMember={remoteMember}
        leave={() => {
          room.disconnect();
          onLeave();
        }}
      />
    </RoomContext.Provider>
  );
};

export default Main;
