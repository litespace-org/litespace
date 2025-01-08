import Messages from "@/components/Chat/Messages";
import RoomsContainer from "@/components/Chat/RoomsContainer";
import React, { useCallback, useMemo, useState } from "react";
import React, { useState } from "react";
import cn from "classnames";
import { useSelectedRoom } from "@litespace/luna/hooks/chat";
import { useChatStatus, useFindRoomMembers } from "@litespace/headless/chat";
import { asOtherMember } from "@/lib/room";
import { useUserContext } from "@litespace/headless/context/user";
import StartMessaging from "@litespace/assets/StartMessaging";
import { useFormatMessage } from "@litespace/luna/hooks/intl";
import { Typography } from "@litespace/luna/Typography";
import { Loader, LoadingError } from "@litespace/luna/Loading";
import { ITutor } from "@litespace/types";

const Chat: React.FC = () => {
  const { user } = useUserContext();
  const [temporaryTutor, setTemporaryTutor] =
    useState<ITutor.UncontactedTutorInfo | null>(null);

  const { select, selected } = useSelectedRoom();
  // TODO: read/unread function
  const roomMembers = useFindRoomMembers(selected.room);
  const otherMember = asOtherMember(user?.id, roomMembers.data);

  const { typingMap, usersOnlineMap } = useChatStatus();

  const isCurrentRoomTyping = useMemo(() => {
    if (!selected.room || !otherMember) return false;
    if (!typingMap) return false;
    return !!typingMap[selected.room]?.[otherMember.id];
  }, [selected.room, otherMember, typingMap]);

  const isOtherMemberOnline = useMemo(() => {
    if (!selected.room || !otherMember) return false;
    if (
      !usersOnlineMap[selected.room] ||
      !usersOnlineMap[selected.room]?.[otherMember.id]
    )
      return otherMember.online;
    return !!usersOnlineMap[selected.room]?.[otherMember.id];
  }, [selected.room, otherMember, usersOnlineMap]);

  const retry = useCallback(() => {
    roomMembers.refetch();
  }, [roomMembers]);

  if (roomMembers.isLoading && !selected.otherMember)
    return (
      <div className="w-full h-full overflow-hidden flex flex-col gap-[157px] p-6 max-w-screen-3xl mx-auto">
        <Typography
          weight="bold"
          element="subtitle-2"
          className=" text-natural-950 mb-6"
        >
          {intl("chat.title")}
        </Typography>
        <div>
          <Loader size="large" text={intl("chat.loading")} />
        </div>
      </div>
    );

  if (roomMembers.isError)
    return (
      <div className="w-full h-full overflow-hidden flex flex-col gap-[157px] p-6 max-w-screen-3xl mx-auto">
        <Typography
          weight="bold"
          element="subtitle-2"
          className="text-natural-950 mb-6"
        >
          {intl("chat.title")}
        </Typography>
        <div>
          <LoadingError size="large" error={intl("chat.error")} retry={retry} />
        </div>
      </div>
    );

  return (
    <div className={cn("flex flex-row min-h-screen overflow-hidden")}>
      <RoomsContainer
        usersOnlineMap={usersOnlineMap}
        typingMap={typingMap}
        setTemporaryTutor={setTemporaryTutor}
        selected={selected}
        select={select}
      />

      {!selected.room ? (
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
      ) : null}

      {otherMember || temporaryTutor ? (
        <Messages
          room={selected.room}
          otherMember={otherMember}
          temporaryTutor={temporaryTutor}
          isTyping={isCurrentRoomTyping}
          isOnline={isOtherMemberOnline}
        />
      ) : null}
    </div>
  );
};

export default Chat;
