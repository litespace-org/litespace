import { IMessage, IRoom } from "@litespace/types";

export function asFindUserRoomsApiRecord({
  roomId,
  latestMessage,
  unreadMessagesCount,
  currentMember,
  otherMember,
  otherMemberOnlineStatus,
}: {
  roomId: number;
  latestMessage: IMessage.Self | null;
  unreadMessagesCount: number;
  currentMember: IRoom.PopulatedMember;
  otherMember: IRoom.PopulatedMember;
  otherMemberOnlineStatus: boolean;
}): IRoom.FindUserRoomsApiRecord {
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
      role: otherMember.role,
      lastSeen: otherMember.updatedAt,
      online: otherMemberOnlineStatus,
      gender: otherMember.gender,
    },
  };
}
