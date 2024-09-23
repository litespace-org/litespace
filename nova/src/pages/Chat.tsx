import Messages from "@/components/Chat/Messages";
import Rooms from "@/components/Chat/Rooms";
import { atlas } from "@/lib/atlas";
import { useAppSelector } from "@/redux/store";
import { profileSelector } from "@/redux/user/me";
import { useQuery } from "@tanstack/react-query";
import React, { useCallback, useState } from "react";

const Chat: React.FC = () => {
  const profile = useAppSelector(profileSelector);
  const [room, setRoom] = useState<number | null>(null);

  const findUserRooms = useCallback(async () => {
    if (!profile) return {};
    return await atlas.chat.findRooms(profile.id);
  }, [profile]);

  const rooms = useQuery({
    queryFn: findUserRooms,
    queryKey: ["find-user-rooms"],
  });

  return (
    <div className="flex flex-row h-[calc(100vh-4rem)] overflow-hidden">
      <Rooms map={rooms.data} room={room} setRoom={setRoom} />
      <Messages room={room} userId={profile?.id} />
    </div>
  );
};

export default Chat;
