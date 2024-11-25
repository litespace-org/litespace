import { messages } from "@litespace/models";
import { IMessage, IRoom } from "@litespace/types";

export async function asFindUserRoomsApiRecord({
  roomId,
  userId,
  latestMessage,
  members,
}: {
  roomId: number;
  userId: number;
  latestMessage: IMessage.Self | null;
  members: IRoom.PopulatedMember[];
}): Promise<IRoom.FindUserRoomsApiRecord> {
  const currentMember = members.find((member) => member.id === userId);
  const otherMember = members.find((member) => member.id !== userId);
  const unreadMessagesCount = await messages.findUnreadCount({
    user: userId,
    room: roomId,
  });

  if (!currentMember)
    throw Error(
      "User is not part of the room (or room is empty); should never happen"
    );

  if (!otherMember)
    throw Error("No other members in the room; should never happen");

  return {
    roomId,
    settings: {
      pinned: currentMember.pinned,
      muted: currentMember.muted,
    },
    unreadMessagesCount,
    latestMessage,
    otherMember: {
      id: otherMember.id,
      name: otherMember.name,
      image: otherMember.image,
      online: otherMember.online,
      role: otherMember.role,
      lastSeen: otherMember.updatedAt,
    },
  };
}
