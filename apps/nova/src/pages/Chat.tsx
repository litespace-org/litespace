import Messages from "@/components/Chat/Messages";
import RoomsContainer from "@/components/Chat/RoomsContainer";
import React, { useCallback } from "react";
import cn from "classnames";
import { useSelectedRoom } from "@litespace/luna/hooks/chat";
import { useFindRoomMembers } from "@litespace/headless/chat";
import { asOtherMember } from "@/lib/room";
import { useUser } from "@litespace/headless/context/user";
import StartMessaging from "@litespace/assets/StartMessaging";
import { useFormatMessage } from "@litespace/luna/hooks/intl";
import { Typography } from "@litespace/luna/Typography";
import { useRoomManager } from "@/hooks/chat";
import { LoadingChat } from "@/components/Chat/LoadingChat";
import { LoadingChatError } from "@/components/Chat/LoadingChatError";

const Chat: React.FC = () => {
  const { user } = useUser();
  const intl = useFormatMessage();

  const { select, selected } = useSelectedRoom();
  // TODO: read/unread function
  const roomMembers = useFindRoomMembers(selected.room);
  const otherMember = asOtherMember(user?.id, roomMembers.data);
  const { rooms, keyword, update } = useRoomManager();

  const retry = useCallback(() => {
    roomMembers.refetch();
    rooms.all.query.refetch();
    rooms.pinned.query.refetch();
  }, [rooms.all, roomMembers, rooms.pinned]);

  if (
    roomMembers.isPending &&
    rooms.all.query.isPending &&
    rooms.pinned.query.isPending
  )
    return <LoadingChat />;

  if (
    roomMembers.isError &&
    rooms.all.query.isError &&
    rooms.pinned.query.isError
  )
    return <LoadingChatError retry={retry} />;

  return (
    <div className={cn("flex flex-row")}>
      <RoomsContainer
        rooms={rooms}
        keyword={keyword}
        update={update}
        selected={selected}
        select={select}
      />

      {otherMember ? (
        <Messages room={selected.room} otherMember={otherMember} />
      ) : (
        <div className="h-full w-full flex items-center justify-center flex-col gap-8">
          <StartMessaging />
          <Typography
            element="subtitle-2"
            weight="bold"
            className="text-natural-950 max-w-[496px] text-center"
          >
            {intl("chat.start-message")}
          </Typography>
        </div>
      )}
    </div>
  );
};

export default Chat;
