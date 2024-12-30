import { IRoom } from "@litespace/types";

export function asOtherMember(
  currentUserId?: number,
  roomMembers?: IRoom.PopulatedMemberWithStatus[]
) {
  if (!roomMembers) return null;
  const otherMember = roomMembers.find((member) => member.id !== currentUserId);
  if (!otherMember) return null;
  return {
    id: otherMember.id,
    name: otherMember.name || null,
    image: otherMember.image || null,
    role: otherMember.role,
    lastSeen: otherMember.updatedAt,
    online: otherMember.online,
  };
}
