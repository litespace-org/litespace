import Messages from "@/components/Chat/Messages";
import Rooms from "@/components/Chat/Rooms";
import { useAppSelector } from "@/redux/store";
import { profileSelector } from "@/redux/user/me";
import React, { useState } from "react";

const Chat: React.FC = () => {
  const profile = useAppSelector(profileSelector);
  const [room, setRoom] = useState<number | null>(null);

  return (
    <div className="flex flex-row h-[calc(100vh-4rem)] overflow-hidden">
      <Rooms room={room} setRoom={setRoom} />
      <Messages room={room} userId={profile?.id} />
    </div>
  );
};

export default Chat;
