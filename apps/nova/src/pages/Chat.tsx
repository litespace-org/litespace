// import Messages from "@/components/Chat/Messages";
import RoomsContainer from "@/components/Chat/RoomsContainer";
import React from "react";
import cn from "classnames";
import { useSelectedRoom } from "@litespace/luna/hooks/chat";

const Chat: React.FC = () => {
  const { select, selected } = useSelectedRoom();

  return (
    <div className={cn("flex flex-row min-h-screen overflow-hidden")}>
      <RoomsContainer selected={selected} select={select} />
      {/* <Messages room={selected.room} members={selected.members} /> */}
      <div></div>
    </div>
  );
};

export default Chat;
