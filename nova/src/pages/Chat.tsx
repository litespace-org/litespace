import Messages from "@/components/Chat/Messages";
import Rooms from "@/components/Chat/Rooms";
import React from "react";
import cn from "classnames";
import { useSelectedRoom } from "@litespace/luna";

const Chat: React.FC = () => {
  const { select, selected } = useSelectedRoom();

  return (
    <div className={cn("flex flex-row h-[calc(100vh-4rem)] overflow-hidden")}>
      <Rooms room={selected.room} select={select} />
      <Messages room={selected.room} members={selected.members} />
    </div>
  );
};

export default Chat;
