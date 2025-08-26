import { asOtherMember, isOnline, isTyping } from "@/lib/room";
import {
  useChatStatus,
  useFindRoomByMembers,
  useFindRoomMembers,
} from "@litespace/headless/chat";
import React, { useMemo } from "react";
import cn from "classnames";
import Messages from "@/components/Chat/Messages";
import { Void } from "@litespace/types";

export const SessionChat: React.FC<{
  selfId: number;
  memberId: number;
  enabled: boolean;
  close: Void;
  onNewMessage: Void;
}> = ({ memberId, selfId, enabled, close, onNewMessage }) => {
  const roomQuery = useFindRoomByMembers([memberId, selfId]);

  const roomId = roomQuery.query.data?.room || null;
  const roomMembers = useFindRoomMembers(roomId || null);
  const otherMember = asOtherMember({
    currentUserId: selfId,
    roomMembers: roomMembers.query.data,
  });

  const { typingMap, onlineUsersMap } = useChatStatus();

  const isCurrentRoomTyping = useMemo(() => {
    return otherMember
      ? isTyping({
          map: typingMap,
          roomId,
          otherMemberId: otherMember.id,
        })
      : false;
  }, [roomId, otherMember, typingMap]);

  const isOtherMemberOnline = useMemo(() => {
    return otherMember
      ? isOnline({
          map: onlineUsersMap,
          roomId: roomId,
          otherMemberStatus: otherMember.online,
          otherMemberId: otherMember.id,
        })
      : false;
  }, [roomId, otherMember, onlineUsersMap]);

  return (
    <div
      className={cn(
        "lg:border border-natural-100 overflow-hidden lg:rounded-2xl",
        "h-full lg:max-h-full absolute grow-1 top-0 left-0 w-full lg:w-[344px] lg:static z-stream-chat",
        { block: enabled, hidden: !enabled }
      )}
    >
      <Messages
        room={roomId}
        inSession
        isOnline={isOtherMemberOnline}
        isTyping={isCurrentRoomTyping}
        otherMember={otherMember}
        close={close}
        onNewMessage={onNewMessage}
      />
    </div>
  );
};
