import { messages } from "@litespace/models";
import { IMessage, IRoom, IUser } from "@litespace/types";

export async function fetchLatestMessage(roomId: number): Promise<IMessage.Self | null> {
    const latestMessageData = await messages.findRoomMessages({
        room: roomId,
        lastMessageOnly: true,
    });
    return latestMessageData.list[0] || null;
}

export async function buildRoomObject(
    roomId: number,
    userId: number,
    latestMessage: IMessage.Self | null,
    roomMembers: Array<{
        id: number;
        pinned: boolean;
        muted: boolean;
        image: string | null;
        updatedAt: string;
        name: string | null;
        online: boolean;
        role: IUser.Role;
    }>
): Promise<IRoom.FindUserRoomsApiResponse["list"][number]> {
    const currentMember = roomMembers.find((member) => member.id === userId);
    const otherMember = roomMembers.find((member) => member.id !== userId);
    const unReadMessagesCount = otherMember
        ? await messages.findUnreadCount({ user: otherMember.id, room: roomId })
        : 0;

    return {
        roomId,
        roomSettings: currentMember
            ? {
                pinned: currentMember.pinned,
                muted: currentMember.muted,
            }
            : { pinned: false, muted: false },
        unReadMessagesCount,
        latestMessage,
        otherMember:
        {
            id: otherMember!.id,
            name: otherMember!.name,
            image: otherMember!.image,
            online: otherMember!.online,
            role: otherMember!.role,
            lastSeen: otherMember!.updatedAt,
        }
        ,
    };
}