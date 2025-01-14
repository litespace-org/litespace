import { RoomsMap } from "@litespace/headless/chat";
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
