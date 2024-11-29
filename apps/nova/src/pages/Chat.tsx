import Messages from "@/components/Chat/Messages";
import RoomsContainer from "@/components/Chat/RoomsContainer";
import React from "react";
import cn from "classnames";
import { useSelectedRoom } from "@litespace/luna/hooks/chat";
import { useFindRoomMembers } from "@litespace/headless/chat";
import { profileSelectors } from "@/redux/user/profile";
import { useAppSelector } from "@/redux/store";
import { asOtherMember } from "@/lib/room";

const Chat: React.FC = () => {
  const profile = useAppSelector(profileSelectors.user);

  const { select, selected } = useSelectedRoom();
  // TODO: Read/Unread Function
  const roomMembers = useFindRoomMembers(selected.room);
  const otherMember = asOtherMember(profile?.id, roomMembers.data);

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
