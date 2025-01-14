import { IRoom, IUser } from "@litespace/types";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import cn from "classnames";
import {
  ChatMessageGroup,
  ChatHeader,
  SendInput,
  EditMessage,
  UserTyping,
} from "@litespace/luna/Chat";
import { ConfirmationDialog } from "@litespace/luna/ConfirmationDialog";
import { OnMessage, useChat, useMessages } from "@litespace/headless/chat";
import { asMessageGroups } from "@litespace/luna/chat";
import { useFormatMessage } from "@litespace/luna/hooks/intl";
import { Loader, LoadingError } from "@litespace/luna/Loading";
import NoSelection from "@/components/Chat/NoSelection";
import dayjs from "dayjs";
import { entries, groupBy, isEmpty } from "lodash";
import { Typography } from "@litespace/luna/Typography";
import Trash from "@litespace/assets/Trash";
import { useUserContext } from "@litespace/headless/context/user";
import { InView } from "react-intersection-observer";
import { orUndefined } from "@litespace/sol/utils";
import BookLesson from "@/components/Lessons/BookLesson";
import StartNewMessage from "@litespace/assets/StartNewMessage";
import { HEADER_HEIGHT } from "@/constants/ui";
import { asFullAssetUrl } from "@litespace/luna/backend";

type RetryFnMap = Record<
  "send" | "update" | "delete",
  (
    payload:
      | { roomId: number; text: string; userId: number }
      | {
          id: number;
          text: string;
          roomId: number;
        }
      | number
  ) => void
>;

const Messages: React.FC<{
  room: number;
  otherMember: IRoom.FindUserRoomsApiRecord["otherMember"];
  isTyping: boolean;
  isOnline: boolean;
}> = ({ room, otherMember, isTyping, isOnline }) => {
  const { user } = useUserContext();
  const intl = useFormatMessage();
  const messagesRef = useRef<HTMLDivElement>(null);
  const [userScrolled, setUserScolled] = useState<boolean>(false);
  const [updatableMessage, setUpdatableMessage] = useState<{
    text: string;
    id: number;
  } | null>(null);
  const [deletableMessage, setDeletableMessage] = useState<number | null>(null);

  const [open, setOpen] = useState<boolean>(false);
  const closeDialog = useCallback(() => setOpen(false), []);
  const openDialog = useCallback(() => setOpen(true), []);

  const {
    messages,
    loading,
    fetching,
    messageErrors,
    onMessage: onMessages,
    more,
    error,
  } = useMessages(room);

  const roomErrors = messageErrors[room];

  const onScroll = useCallback(() => {
    const el = messagesRef.current;
    if (!el) return;
    const scrollTop = el.scrollTop + 100;
    const diff = el.scrollHeight - el.offsetHeight;
    const scrolled = scrollTop < diff;
    setUserScolled(scrolled);
  }, []);

  const resetScroll = useCallback(() => {
    if (messagesRef.current)
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
  }, []);

  const onMessage: OnMessage = useCallback(
    (action) => {
      resetScroll();
      onMessages(action);
    },
    [onMessages, resetScroll]
  );

  const { sendMessage, updateMessage, deleteMessage, ackUserTyping } = useChat(
    onMessage,
    orUndefined(user?.id)
  );

  const retryFnMap: RetryFnMap = {
    send: (payload) =>
      typeof payload !== "number" &&
      "userId" in payload &&
      sendMessage(payload),
    update: (payload) =>
      typeof payload !== "number" && "id" in payload && updateMessage(payload),
    delete: (payload) =>
      typeof payload === "number" && deleteMessage(payload, room),
  };
  const typingMessage = useCallback(
    () => ackUserTyping({ roomId: room }),
    [room, ackUserTyping]
  );

  const submit = useCallback(
    (text: string) => {
      if (!room) return;
      return sendMessage({ roomId: room, text, userId: user?.id || 0 });
    },
    [room, sendMessage, user]
  );

  const onUpdateMessage = useCallback(
    (text: string) => {
      if (!updatableMessage || !room) return;
      setUpdatableMessage(null);
      updateMessage({
        id: updatableMessage.id,
        text,
        roomId: room,
      });
    },
    [updatableMessage, updateMessage, room]
  );

  const onUpdate = useCallback(
    (message: { text: string; id: number }) => setUpdatableMessage(message),
    []
  );

  const discardUpdate = useCallback(() => setUpdatableMessage(null), []);

  const onDelete = useCallback(
    (messageId: number) => setDeletableMessage(messageId),
    []
  );

  const confirmDelete = useCallback(() => {
    if (!deletableMessage || !room) return;
    deleteMessage(deletableMessage, room);
    setDeletableMessage(null);
  }, [deletableMessage, deleteMessage, room]);

  const discardDelete = useCallback(() => {
    setDeletableMessage(null);
  }, []);

  useEffect(() => {
    if (!userScrolled) resetScroll();
  }, [messages, resetScroll, userScrolled]);

  const messageGroups = useMemo(() => {
    if (!user) return [];

    const groups = asMessageGroups({
      currentUser: user,
      messages,
      otherMember,
    });

    const map = groupBy(groups, (group) =>
      dayjs(group.sentAt).format("YYYY-MM-DD")
    );

    return entries(map).map(([date, groups]) => ({ date, groups }));
  }, [user, messages, otherMember]);

  const asDisplayDate = useCallback(
    (date: string) => {
      const day = dayjs(date);
      if (day.isSame(dayjs(), "days")) return intl("chat.date.today");
      if (day.isSame(dayjs().subtract(1, "day"), "days"))
        return intl("chat.date.yesterday");
      if (day.isSame(dayjs(), "year")) return day.format("D MMMM ");
      return day.format("D MMMM YYYY");
    },
    [intl]
  );

  useEffect(() => {
    if (!messagesRef.current) return;
    resetScroll();
  }, [resetScroll]);

  useEffect(() => {
    const el = messagesRef.current;
    if (!el) return;
    el.scrollTop += 100;
  }, [messageGroups]);

  return (
    <div
      style={{ height: `calc(100vh - ${HEADER_HEIGHT}px)` }}
      className="flex-1 border-r border-border-strong flex flex-col"
    >
      {room === null ? <NoSelection /> : null}

      <div
        className="tw-px-6 tw-pt-8 bg-natural-50"
        style={{
          boxShadow: "0px 4px 20px 0px rgba(0, 0, 0, 0.08)",
        }}
      >
        <ChatHeader
          {...otherMember}
          image={otherMember.image ? asFullAssetUrl(otherMember.image) : null}
          openDialog={openDialog}
          online={isOnline}
          lastSeen={dayjs(otherMember.lastSeen).fromNow()}
        />
      </div>

      {room ? (
        <>
          <div
            className={cn(
              "h-full overflow-x-hidden overflow-y-auto px-4 pt-2 mt-2 ml-4 pb-6",
              "scrollbar-thin scrollbar-thumb-natural-200 scrollbar-track-natural-50"
            )}
            ref={messagesRef}
            onScroll={onScroll}
          >
            <InView as="div" onChange={more} />
            {loading ? (
              <div className="w-full h-full flex justify-center items-center">
                <Loader size="large" text={intl("chat.message.loading")} />
              </div>
            ) : (
              <ul className="h-full flex flex-col gap-4 overflow-auto grow">
                {error && !fetching ? (
                  <div className="max-w-[192px] mx-auto">
                    <LoadingError
                      size="small"
                      error={intl("chat.message.error")}
                      retry={more}
                    />
                  </div>
                ) : null}
                {fetching ? (
                  <div className="w-full my-4">
                    <Loader size="small" />
                  </div>
                ) : null}

                {messageGroups.length > 0 ? (
                  messageGroups.map(({ date, groups }) => {
                    return (
                      <div key={date} className="w-full">
                        <div className="bg-natural-50 rounded-[40px] p-3 mx-auto w-fit shadow-chat-date">
                          <Typography
                            element="caption"
                            className="text-natural-950"
                          >
                            {asDisplayDate(date)}
                          </Typography>
                        </div>

                        {groups
                          .filter(
                            (group) =>
                              !isEmpty(
                                group.messages.filter((msg) => !msg.deleted)
                              )
                          )
                          .map((group) => (
                            <div className="mb-6" key={group.id}>
                              <ChatMessageGroup
                                {...group}
                                roomErrors={roomErrors}
                                retryFnMap={retryFnMap}
                                roomId={room}
                                deleteMessage={onDelete}
                                editMessage={onUpdate}
                                owner={group.sender.userId === user?.id}
                              />
                            </div>
                          ))}
                      </div>
                    );
                  })
                ) : (
                  <div className="w-full h-full flex flex-col justify-center items-center gap-10">
                    <div className="flex flex-col gap-2 justify-center items-center">
                      <Typography
                        element="subtitle-2"
                        weight="bold"
                        className="text-natural-950"
                      >
                        {intl("chat.message.no-message")}
                      </Typography>
                      <Typography
                        element="body"
                        weight="semibold"
                        className="text-natural-500"
                      >
                        {intl("chat.message.start-chat")}
                      </Typography>
                    </div>
                    <StartNewMessage />
                  </div>
                )}
              </ul>
            )}
          </div>
          {isTyping ? (
            <div className="px-6">
              <UserTyping
                id={otherMember.id}
                name={otherMember.name}
                gender={otherMember.gender}
                imageUrl={otherMember.image}
              />
            </div>
          ) : null}
          <div className="px-4 pt-2 pb-6 mt-3">
            <SendInput typingMessage={typingMessage} onSubmit={submit} />
          </div>
        </>
      ) : null}

      {updatableMessage ? (
        <EditMessage
          message={updatableMessage}
          close={discardUpdate}
          onUpdateMessage={onUpdateMessage}
          open={!!updatableMessage}
        />
      ) : null}

      <ConfirmationDialog
        labels={{
          confirm: intl("chat.message.delete.confirm"),
          cancel: intl("chat.message.delete.cancel"),
        }}
        type="error"
        title={intl("chat.message.delete")}
        description={intl("chat.message.delete.description")}
        open={!!deletableMessage}
        confirm={confirmDelete}
        close={discardDelete}
        icon={<Trash />}
      />
      {otherMember.role !== IUser.Role.Student ? (
        <BookLesson tutorId={otherMember.id} close={closeDialog} open={open} />
      ) : null}
    </div>
  );
};

export default Messages;
