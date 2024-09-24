import Messages from "@/components/Chat/Messages";
import Rooms, { SelectedRoom } from "@/components/Chat/Rooms";
import React, { useState } from "react";
import cn from "classnames";

const Chat: React.FC = () => {
  const [selected, setRoom] = useState<SelectedRoom>({
    room: null,
    members: [],
  });

  return (
    <div
      className={cn(
        "flex flex-row h-[calc(100vh-4rem)] 2xl:h-[calc(100vh-6rem)] overflow-hidden",
        "max-w-screen-2xl mx-auto w-full 2xl:my-4 2xl:border 2xl:border-border-strong 2xl:shadow-2xl 2xl:rounded-md"
      )}
    >
      <Rooms room={selected.room} setRoom={setRoom} />
      <Messages room={selected.room} members={selected.members} />
    </div>
  );
};

export default Chat;
