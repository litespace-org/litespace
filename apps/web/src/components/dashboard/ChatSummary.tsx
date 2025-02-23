import { useFindUserRooms } from "@litespace/headless/chat";
import { useUserContext } from "@litespace/headless/context/user";
import {
  ChatSummary as Summary,
  type ChatSummaryProps,
} from "@litespace/ui/Chat";
import { orUndefined } from "@litespace/utils/utils";
import { IRoom } from "@litespace/types";
import dayjs from "dayjs";
import { useMemo } from "react";
import { router } from "@/lib/routes";
import { Web } from "@litespace/utils/routes";

function asRooms(
  list: IRoom.FindUserRoomsApiRecord[] | null
): ChatSummaryProps["rooms"] {
  if (!list) return [];

  return list.map((room) => ({
    id: room.roomId,
    url: router.web({
      route: Web.Chat,
      query: { room: room.roomId.toString() },
    }),
    name: orUndefined(room.otherMember?.name),
    image: orUndefined(room.otherMember?.image),
    message: room.latestMessage?.text || "TODO",
    sentAt: room.latestMessage?.updatedAt || dayjs().toString(), // TODO
    read: room.unreadMessagesCount === 0,
  }));
}

export const ChatSummary = () => {
  const { user } = useUserContext();
  const rooms = useFindUserRooms(user?.id, { size: 4 });
  const organizedRooms = useMemo(() => asRooms(rooms.list), [rooms.list]);

  return (
    <Summary
      loading={rooms.query.isPending}
      error={rooms.query.isError}
      retry={rooms.query.refetch}
      chatsUrl={Web.Chat}
      rooms={organizedRooms}
    />
  );
};
