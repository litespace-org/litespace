import Messages from "@/components/Chat/Messages";
import RoomsContainer from "@/components/Chat/RoomsContainer";
import React from "react";
import cn from "classnames";
import { useSelectedRoom } from "@litespace/luna/hooks/chat";
import { useFindRoomMembers } from "@litespace/headless/chat";
import { asOtherMember } from "@/lib/room";
import { useUserContext } from "@litespace/headless/context/user";

const Chat: React.FC = () => {
  const { user } = useUserContext();

  const { select, selected } = useSelectedRoom();
  // TODO: read/unread function
  const roomMembers = useFindRoomMembers(selected.room);
  const otherMember = asOtherMember(user?.id, roomMembers.data);

  return (
    <div className={cn("flex flex-row min-h-screen overflow-hidden")}>
      <RoomsContainer selected={selected} select={select} />

      {otherMember && (
        <Messages room={selected.room} otherMember={otherMember} />
      )}
    </div>
  );
};

export default Chat;
