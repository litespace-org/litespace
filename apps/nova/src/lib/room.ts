import { RoomsMap } from "@litespace/headless/chat";
import { IRoom, IUser, ITutor, IMessage } from "@litespace/types";
import { asFullAssetUrl } from "@litespace/luna/backend";
import { SelectRoom } from "@litespace/luna/hooks/chat";
import { LocalMap } from "@litespace/luna/locales";
import { orUndefined } from "@litespace/sol/utils";
import dayjs from "dayjs";
import { PrimitiveType } from "react-intl";

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

export function isOnline({
  map,
  roomId,
  otherMemberId,
  otherMemberStatus,
}: {
  map: RoomsMap | undefined;
  roomId: number | "temporary" | null;
  otherMemberStatus: boolean | undefined;
  otherMemberId: number;
}): boolean | undefined {
  if (!roomId || roomId === "temporary" || !map) return !!otherMemberStatus;
  if (!map[roomId]) return otherMemberStatus;
  return map[roomId]?.[otherMemberId];
}

export function isTyping({
  map,
  roomId,
  otherMemberId,
}: {
  map: RoomsMap | undefined;
  roomId: number | "temporary" | null;
  otherMemberId: number;
}): boolean {
  if (!roomId || roomId === "temporary" || !map) return false;
  return !!map[roomId]?.[otherMemberId];
}

export function asChatRoomProps({
  rooms,
  roomId,
  currentUserId,
  toggleMute,
  togglePin,
  select,
  selectUncontacted,
  intl,
}: {
  rooms:
    | IRoom.FindUserRoomsApiRecord[]
    | ITutor.FullUncontactedTutorInfo[]
    | null;
  roomId: number | "temporary" | null;
  currentUserId?: number;
  togglePin?: ({ roomId, pinned }: { roomId: number; pinned: boolean }) => void;
  toggleMute?: ({ roomId, muted }: { roomId: number; muted: boolean }) => void;
  selectUncontacted?: (tutor: ITutor.FullUncontactedTutorInfo) => void;
  select?: SelectRoom;
  intl: (id: keyof LocalMap, values?: Record<string, PrimitiveType>) => string;
}) {
  if (!rooms) return [];
  return rooms?.map((room) => {
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
        image: room.otherMember.image
          ? asFullAssetUrl(room.otherMember.image)
          : undefined,

        name: room.otherMember.name!,
        // TODO: replace otherMember.name with member.bio
        message:
          room.latestMessage?.text ||
          (room.otherMember.online
            ? intl("chat.online")
            : intl("chat.offline", {
                time: dayjs(room.otherMember.lastSeen).fromNow(),
              })),
        online: room.otherMember.online,
        unreadCount: room.unreadMessagesCount,
        select: () =>
          select &&
          select({
            room: room.roomId,
            otherMember: room.otherMember,
          }),
        roomId: room.roomId,
        messageState: room.latestMessage?.read
          ? "seen"
          : ("sent" as IMessage.MessageState),
      };
    // in case the component was given uncontacted tutors
    else
      return {
        key: room.id,
        optionsEnabled: false,
        userId: room.id,
        image: orUndefined(asFullAssetUrl(room.image || "")),
        message: room.bio || "",
        name: room.name || "",
        online: room.online,
        role: room.role,
        unreadCount: 0,
        roomId: null,
        select: () => selectUncontacted && selectUncontacted(room),
        toggleMute: () => {},
        togglePin: () => {},
      };
  });
}
