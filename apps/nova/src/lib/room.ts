import { RoomsMap } from "@litespace/headless/chat";
import { IRoom, IUser, ITutor } from "@litespace/types";

import { asFullAssetUrl } from "@litespace/luna/backend";
import { SelectRoom } from "@litespace/luna/hooks/chat";
import { orUndefined } from "@litespace/sol/utils";

type OtherMember = {
  id: number;
  name: string | null;
  image: string | null;
  role: IUser.Role;
  lastSeen: string;
  online: boolean;
  gender: IUser.Gender | null;
};

export function asOtherMember(
  currentUserId?: number,
  roomMembers?: IRoom.PopulatedMemberWithStatus[]
): OtherMember | null {
  if (!roomMembers) return null;
  const otherMember = roomMembers.find((member) => member.id !== currentUserId);
  if (!otherMember) return null;
  return {
    id: otherMember.id,
    name: otherMember.name || null,
    gender: otherMember.gender || null,
    image: otherMember.image || null,
    role: otherMember.role,
    lastSeen: otherMember.updatedAt,
    online: otherMember.online,
  };
}

export function isOnline(
  map: RoomsMap,
  roomId: number,
  otherMember: OtherMember
): boolean {
  return map[roomId]?.[otherMember.id] || otherMember.online;
}

export function isTyping(
  map: RoomsMap,
  roomId: number,
  otherMemberId: number
): boolean {
  return map[roomId]?.[otherMemberId] || false;
}

export function asChatRoomProps({
  rooms,
  roomId,
  currentUserId,
  toggleMute,
  togglePin,
  select,
  createRoom,
}: {
  rooms: IRoom.FindUserRoomsApiRecord[] | ITutor.UncontactedTutorInfo[] | null;
  roomId: number | null;
  currentUserId?: number;
  togglePin?: ({ roomId, pinned }: { roomId: number; pinned: boolean }) => void;
  toggleMute?: ({ roomId, muted }: { roomId: number; muted: boolean }) => void;
  createRoom?: (tutor: ITutor.UncontactedTutorInfo) => void;
  select?: SelectRoom;
}) {
  if (!rooms) return [];
  return rooms?.map((room, index) => {
    // in case the component was given chat rooms
    if ("roomId" in room)
      return {
        key: room.roomId,
        isActive: room.roomId === roomId,
        optionsEnabled: !!room.latestMessage,
        owner: room.latestMessage?.userId === currentUserId,

        isPinned: room.settings.pinned,
        isMuted: room.settings.muted,
        userId: room.otherMember.id,
        toggleMute: () =>
          toggleMute &&
          toggleMute({ roomId: room.roomId, muted: !room.settings.muted }),
        togglePin: () =>
          togglePin &&
          togglePin({ roomId: room.roomId, pinned: !room.settings.pinned }),
        image: orUndefined(asFullAssetUrl(room.otherMember.image || "")),

        name: room.otherMember.name!,
        // TODO: replace otherMember.name with member.bio
        message: room.latestMessage?.text || "TODO: Bio",
        unreadCount: room.unreadMessagesCount,
        isTyping: false,
        select: () =>
          select &&
          select({
            room: room.roomId,
            otherMember: room.otherMember,
          }),
      };
    // in case the component was given uncontacted tutors
    if ("id" in room)
      return {
        key: room.id,
        optionsEnabled: false,
        userId: room.id,
        image: orUndefined(asFullAssetUrl(room.image || "")),
        message: room.bio || "",
        name: room.name || "",
        unreadCount: 0,
        select: () => createRoom && createRoom(room),
        toggleMute: () => {},
        togglePin: () => {},
      };
    // default case: SHOULD NEVER HAPPEN
    return {
      key: index,
      optionsEnabled: false,
      userId: 0,
      image: "",
      message: "",
      name: "",
      unreadCount: 0,
      select: () => {},
      toggleMute: () => {},
      togglePin: () => {},
    };
  });
}
