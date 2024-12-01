import { IRoom } from "@litespace/types";

export function asOtherMember(
  currentUserId?: number,
  roomMembers?: IRoom.PopulatedMember[]
) {
  if (!roomMembers) return null;
  const otherMember = roomMembers.find((member) => member.id !== currentUserId);
  if (!otherMember) return null;
  return {
    id: otherMember.id,
    name: otherMember.name || null,
    image: otherMember.image || null,
    online: otherMember.online,
    role: otherMember.role,
    lastSeen: otherMember.updatedAt,
  };
}
