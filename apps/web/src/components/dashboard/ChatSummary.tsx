import { useFindUserRooms } from "@litespace/headless/chat";
import { useUserContext } from "@litespace/headless/context/user";
import {
  ChatSummary as Summary,
  type ChatSummaryProps,
} from "@litespace/ui/Chat";
import { IRoom } from "@litespace/types";
import React, { useMemo } from "react";
import { router } from "@/lib/routes";
import { Web } from "@litespace/utils/routes";

function asRooms(
  list: IRoom.FindUserRoomsApiRecord[] | null
): ChatSummaryProps["rooms"] {
  if (!list) return [];

  return list.map((room) => ({
    id: room.roomId,
    otherMemberId: room.otherMember.id,
    otherMember: {
      id: room.otherMember.id,
      image: room.otherMember.image,
      name: room.otherMember.name,
      online: room.otherMember.online,
    },
    url: router.web({
      route: Web.Chat,
      query: { room: room.roomId.toString() },
    }),
    name: room.otherMember.name,
    image: room.otherMember.image,
    message: room.latestMessage?.text,
    isOnline: room.otherMember.online,
    sentAt: room.latestMessage?.updatedAt || room.otherMember.lastSeen,
    read: room.unreadMessagesCount === 0,
  }));
}

export const ChatSummary: React.FC = () => {
  const { user } = useUserContext();
  const rooms = useFindUserRooms(user?.id, { size: 4 });
  const organizedRooms = useMemo(() => asRooms(rooms.list), [rooms.list]);

  return (
    <div className="md:col-span-1 [&>*]:h-full">
      <Summary
        loading={rooms.query.isPending}
        error={rooms.query.isError}
        retry={rooms.query.refetch}
        chatsUrl={Web.Chat}
        rooms={organizedRooms}
      />
    </div>
  );
};
