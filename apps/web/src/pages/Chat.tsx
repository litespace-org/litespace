import Messages from "@/components/Chat/Messages";
import RoomsPanel from "@/components/Chat/RoomsPanel";
import React, { useCallback, useMemo, useState } from "react";
import cn from "classnames";
import { useSelectedRoom } from "@litespace/ui/hooks/chat";
import { useChatStatus, useFindRoomMembers } from "@litespace/headless/chat";
import { asOtherMember, isOnline, isTyping } from "@/lib/room";
import { useUserContext } from "@litespace/headless/context/user";
import StartMessaging from "@litespace/assets/StartMessaging";
import { Typography } from "@litespace/ui/Typography";
import { Loader, LoadingError } from "@litespace/ui/Loading";
import { ITutor, IUser } from "@litespace/types";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { useMediaQuery } from "@litespace/headless/mediaQuery";
import { useOnError } from "@/hooks/error";

const Chat: React.FC = () => {
  const [temporaryTutor, setTemporaryTutor] =
    useState<ITutor.FullUncontactedTutorInfo | null>(null);

  const mq = useMediaQuery();

  const { user } = useUserContext();
  const intl = useFormatMessage();
  const { select, selected } = useSelectedRoom();

  const { query: roomMembers, keys } = useFindRoomMembers(
    typeof selected.room === "number" ? selected.room : null
  );

  useOnError({
    type: "query",
    error: roomMembers.error,
    keys,
  });

  const otherMember = useMemo(
    () => asOtherMember(user?.id, roomMembers.data),
    [user?.id, roomMembers.data]
  );

  const { typingMap, onlineUsersMap } = useChatStatus();

  const isCurrentRoomTyping = useMemo(() => {
    return otherMember
      ? isTyping({
          map: typingMap,
          roomId: selected.room,
          otherMemberId: otherMember.id,
        })
      : false;
  }, [selected.room, otherMember, typingMap]);

  const isOtherMemberOnline = useMemo(() => {
    return otherMember
      ? isOnline({
          map: onlineUsersMap,
          roomId: selected.room,
          otherMemberStatus: otherMember.online,
          otherMemberId: otherMember.id,
        })
      : false;
  }, [selected.room, otherMember, onlineUsersMap]);

  const retry = useCallback(() => {
    roomMembers.refetch();
  }, [roomMembers]);

  if (roomMembers.isError || (roomMembers.isLoading && !selected.otherMember))
    return (
      <div className="w-full h-full overflow-hidden flex flex-col p-6">
        <Typography
          tag="h1"
          className=" text-natural-950 mb-6 text-subtitle-2 font-bold"
        >
          {intl("chat.title")}
        </Typography>
        <div className="mt-[15vh]">
          {roomMembers.isError ? (
            <LoadingError
              size="large"
              error={intl("chat.error")}
              retry={retry}
            />
          ) : (
            <Loader size="large" text={intl("chat.loading")} />
          )}
        </div>
      </div>
    );

  return (
    <div
      className={cn(
        "max-w-screen-3xl w-full mx-auto flex flex-row overflow-hidden grow",
        "max-h-chat-mobile md:max-h-chat-tablet lg:max-h-chat-desktop"
      )}
    >
      {(!temporaryTutor && !otherMember) || mq.lg ? (
        <RoomsPanel
          onlineUsersMap={onlineUsersMap}
          typingMap={typingMap}
          setTemporaryTutor={setTemporaryTutor}
          selectedRoom={selected.room}
          select={select}
        />
      ) : null}

      {!selected.room && mq.lg ? (
        <div className="h-full w-full flex items-center justify-center flex-col gap-8">
          <StartMessaging />
          <Typography
            tag="span"
            className="text-natural-950 max-w-[496px] text-center text-subtitle-2 font-bold"
          >
            {intl(
              user?.role === IUser.Role.Student
                ? "chat.start-message-student"
                : "chat.start-message-tutor"
            )}
          </Typography>
        </div>
      ) : null}

      {temporaryTutor || otherMember ? (
        <Messages
          isTyping={isCurrentRoomTyping}
          isOnline={isOtherMemberOnline}
          room={selected.room}
          otherMember={temporaryTutor || otherMember}
          setTemporaryTutor={setTemporaryTutor}
          select={select}
        />
      ) : null}
    </div>
  );
};

export default Chat;
