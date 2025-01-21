import { RoomsMap } from "@litespace/headless/chat";
import { UncontactedTutorRoomId } from "@litespace/luna/hooks/chat";
import { IRoom, IUser } from "@litespace/types";

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
  map?: RoomsMap;
  roomId: number | UncontactedTutorRoomId | null;
  otherMemberStatus?: boolean;
  otherMemberId: number;
}): boolean | undefined {
  if (!roomId || typeof roomId !== "number" || !map) return !!otherMemberStatus;
  if (!map[roomId]) return otherMemberStatus;
  return map[roomId]?.[otherMemberId];
}

export function isTyping({
  map,
  roomId,
  otherMemberId,
}: {
  map: RoomsMap | undefined;
  roomId: number | UncontactedTutorRoomId | null;
  otherMemberId: number;
}): boolean {
  if (!roomId || typeof roomId !== "number" || !map) return false;
  return !!map[roomId]?.[otherMemberId];
}
