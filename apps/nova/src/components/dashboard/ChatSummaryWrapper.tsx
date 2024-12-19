import { Route } from "@/types/routes";
import { useFindUserRooms } from "@litespace/headless/chat";
import { useUser } from "@litespace/headless/context/user";
import { ChatSummary, type ChatSummaryProps } from "@litespace/luna/Chat";
import { orUndefined } from "@litespace/sol/utils";
import { IRoom } from "@litespace/types";
import dayjs from "dayjs";
import { useMemo } from "react";

function organizeRooms(
  list: IRoom.FindUserRoomsApiRecord[] | null
): ChatSummaryProps["rooms"] {
  return (
    list?.map((room) => ({
      id: room.roomId,
      url: Route.Chat.concat("?room=", room.roomId.toString()),
      name: orUndefined(room.otherMember?.name),
      image: orUndefined(room.otherMember?.image),
      message: room.latestMessage?.text || "TODO",
      sentAt: room.latestMessage?.updatedAt || dayjs().toString(), // TODO
      read: room.unreadMessagesCount === 0,
    })) || []
  );
}

export const ChatSummaryWrapper = () => {
  const { user } = useUser();
  const rooms = useFindUserRooms(user?.id, { size: 4 });
  const organizedRooms = useMemo(() => organizeRooms(rooms.list), [rooms.list]);

  if (rooms.query.isLoading || rooms.query.isPending)
    return <div>Loading ...</div>;
  return <ChatSummary chatsUrl={Route.Chat} rooms={organizedRooms} />;
};
