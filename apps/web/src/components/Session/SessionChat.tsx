import { asOtherMember, isOnline, isTyping } from "@/lib/room";
import {
  useChatStatus,
  useFindRoomByMembers,
  useFindRoomMembers,
} from "@litespace/headless/chat";
import { AnimateWidth } from "@litespace/ui/Animate";
import { AnimatePresence } from "framer-motion";
import React, { useMemo } from "react";
import cn from "classnames";
import Messages from "@/components/Chat/Messages";
import { Void } from "@litespace/types";

export const SessionChat: React.FC<{
  selfId: number;
  memberId: number;
  enabled: boolean;
  close: Void;
}> = ({ memberId, selfId, enabled, close }) => {
  const roomQuery = useFindRoomByMembers([memberId, selfId]);

  const roomId = roomQuery.query.data?.room || null;
  const roomMembers = useFindRoomMembers(roomId || null);
  const otherMember = asOtherMember(selfId, roomMembers.query.data);

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
    <AnimatePresence mode="wait">
      (
      <AnimateWidth
        className={cn(
          "h-full absolute top-0 left-0 lg:!w-[344px] !w-full lg:static z-stream-chat",
          enabled ? "block" : "hidden"
        )}
      >
        <div
          className={cn(
            " h-full lg:max-h-[calc(100vh-96px)] lg:h-[calc(100vh-96px)] lg:border border-natural-100 overflow-hidden lg:rounded-2xl"
          )}
        >
          <Messages
            room={roomId}
            inSession
            isOnline={isOtherMemberOnline}
            isTyping={isCurrentRoomTyping}
            otherMember={otherMember}
            close={close}
          />
        </div>
      </AnimateWidth>
      )
    </AnimatePresence>
  );
};
