import { IRoom, ITutor, IUser } from "@litespace/types";
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
} from "@litespace/ui/Chat";
import { ConfirmationDialog } from "@litespace/ui/ConfirmationDialog";
import {
  OnMessage,
  useChat,
  useCreateRoom,
  useMessages,
} from "@litespace/headless/chat";
import { asMessageGroups } from "@litespace/ui/chat";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Loader, LoadingError } from "@litespace/ui/Loading";
import NoSelection from "@/components/Chat/NoSelection";
import dayjs from "dayjs";
import { entries, groupBy, isEmpty } from "lodash";
import { Typography } from "@litespace/ui/Typography";
import Trash from "@litespace/assets/Trash";
import { useUserContext } from "@litespace/headless/context/user";
import { InView } from "react-intersection-observer";
import { orUndefined } from "@litespace/utils/utils";
import ManageLesson from "@/components/Lessons/ManageLesson";
import StartNewMessage from "@litespace/assets/StartNewMessage";
import { useToast } from "@litespace/ui/Toast";
import { SelectRoom, UncontactedTutorRoomId } from "@litespace/ui/hooks/chat";
import { useInvalidateQuery } from "@litespace/headless/query";
import { QueryKey } from "@litespace/headless/constants";
import { getErrorMessageId } from "@litespace/ui/errorMessage";
import { capture } from "@/lib/sentry";

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
  /**
   * Room id
   */
  room: number | UncontactedTutorRoomId | null;
  isTyping: boolean;
  isOnline: boolean | undefined;
  /**
   * other member data in the current room || temporary tutor data used until we
   * create a room between users this will be used if there is an actual room
   * between both users
   */
  otherMember:
    | IRoom.FindUserRoomsApiRecord["otherMember"]
    | ITutor.FullUncontactedTutorInfo
    | null;
  setTemporaryTutor?: (tutor: ITutor.FullUncontactedTutorInfo | null) => void;
  select?: SelectRoom;
  inSession?: boolean;
}> = ({
  room,
  otherMember,
  setTemporaryTutor,
  select,
  isTyping,
  isOnline,
  inSession,
}) => {
  const { user } = useUserContext();
  const intl = useFormatMessage();
  const messagesRef = useRef<HTMLUListElement>(null);
  const [userScrolled, setUserScolled] = useState<boolean>(false);
  const [updatableMessage, setUpdatableMessage] = useState<{
    text: string;
    id: number;
  } | null>(null);
  const [deletableMessage, setDeletableMessage] = useState<number | null>(null);
  const [open, setOpen] = useState<boolean>(false);

  const {
    messages,
    loading,
    fetching,
    messageErrors,
    onMessage: onMessages,
    more,
    error,
  } = useMessages(typeof room === "number" ? room : null);

  const roomErrors =
    room && typeof room === "number" ? messageErrors[room] : {};

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

  const {
    sendMessage,
    updateMessage,
    deleteMessage,
    ackUserTyping,
    readMessage,
  } = useChat(onMessage, orUndefined(user?.id));
  const invdalidate = useInvalidateQuery();
  const toast = useToast();

  const onSuccess = useCallback(
    (response: IRoom.CreateRoomApiResponse) => {
      if (!otherMember) return;
      if (select)
        select({
          room: response.roomId,
          otherMember: otherMember,
        });
      if (setTemporaryTutor) setTemporaryTutor(null);
      invdalidate([QueryKey.FindUserRooms]);
      invdalidate([QueryKey.FindUncontactedTutors]);
    },
    [otherMember, select, setTemporaryTutor, invdalidate]
  );

  const onError = useCallback(
    (error: unknown) => {
      capture(error);
      const errorMessage = getErrorMessageId(error);
      toast.error({
        title: intl("chat.create.room.error"),
        description: intl(errorMessage),
      });
    },
    [toast, intl]
  );

  const goBack = useCallback(() => {
    if (select)
      select({
        room: null,
        otherMember: null,
      });
    if (setTemporaryTutor) setTemporaryTutor(null);
  }, [select, setTemporaryTutor]);

  const createRoom = useCreateRoom({ onSuccess, onError });

  const retryFnMap: RetryFnMap = {
    send: (payload) =>
      typeof payload !== "number" &&
      "userId" in payload &&
      sendMessage(payload),
    update: (payload) =>
      typeof payload !== "number" && "id" in payload && updateMessage(payload),
    delete: (payload) =>
      typeof payload === "number" &&
      room &&
      typeof room === "number" &&
      deleteMessage(payload, room),
  };

  const typingMessage = useCallback(
    () => room && typeof room === "number" && ackUserTyping({ roomId: room }),
    [room, ackUserTyping]
  );

  const submit = useCallback(
    (text: string) => {
      if (!room || !otherMember) return;
      if (typeof room === "string")
        return createRoom.mutate({ id: otherMember.id, message: text });
      return sendMessage({ roomId: room, text, userId: user?.id || 0 });
    },
    [room, sendMessage, user, otherMember, createRoom]
  );

  const onUpdateMessage = useCallback(
    (text: string) => {
      if (!updatableMessage || !room || typeof room !== "number") return;
      setUpdatableMessage(null);
      updateMessage({
        id: updatableMessage.id,
        roomId: room,
        text,
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
    if (!deletableMessage || !room || typeof room === "string") return;
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

    const groups = otherMember
      ? asMessageGroups({
          currentUser: user,
          messages,
          otherMember,
        })
      : [];

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
      id="messages-container"
      className={cn("flex-1 flex flex-col bg-natural-50 h-full")}
    >
      {room === null ? <NoSelection /> : null}

      {otherMember ? (
        <ChatHeader
          id={otherMember.id}
          name={otherMember.name}
          image={otherMember.image}
          role={otherMember.role}
          online={isOnline}
          book={() => setOpen(true)}
          back={goBack}
          inSession={inSession}
          lastSeen={otherMember.lastSeen}
        />
      ) : null}

      {room ? (
        <div
          className={cn(
            "flex flex-col h-full gap-2",
            "max-h-[calc(100%-72px)] md:max-h-[calc(100%-88px)] lg:max-h-[calc(100%-106px)]"
          )}
        >
          <div
            id="messages-content"
            className={cn(
              "overflow-x-hidden px-4 h-full flex items-center justify-center"
            )}
          >
            {loading ? (
              <div className="w-full flex justify-center items-center">
                <Loader size="large" text={intl("chat.message.loading")} />
              </div>
            ) : (
              <ul
                className={cn(
                  "flex flex-col gap-4 h-full",
                  "overflow-auto grow scrollbar-thin h-full scrollbar-thumb-natural-200 scrollbar-track-natural-50"
                )}
                onScroll={onScroll}
                ref={messagesRef}
              >
                <InView onChange={more} />
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

                {typeof room === "number" && messageGroups.length > 0 ? (
                  messageGroups.map(({ date, groups }, index) => {
                    return (
                      <div
                        key={index}
                        className="w-full flex flex-col gap-4 lg:gap-[14px]"
                      >
                        <div className="bg-natural-50 rounded-2xl p-3 mx-auto w-fit shadow-chat-date">
                          <Typography
                            tag="span"
                            className="text-natural-950 text-caption"
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
                          .map((group, index) => (
                            <div key={index}>
                              <ChatMessageGroup
                                {...group}
                                readMessage={readMessage}
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
                    <div className="flex flex-col gap-2 justify-center items-center text-center">
                      <Typography
                        tag="span"
                        className="text-natural-950 text-subtitle-2 font-bold"
                      >
                        {intl("chat.message.no-message")}
                      </Typography>
                      <Typography
                        tag="span"
                        className="text-natural-500 text-body font-semibold"
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
          <div id="messages-footer" className="flex flex-col gap-2 mt-auto">
            {isTyping && otherMember ? (
              <div className="px-6 mt-6 lg:mt-9">
                <UserTyping
                  id={otherMember.id}
                  name={otherMember.name}
                  gender={otherMember.gender}
                  imageUrl={otherMember.image}
                />
              </div>
            ) : null}
            <div className={cn("px-4 mb-4 mt-auto")}>
              <SendInput typingMessage={typingMessage} onSubmit={submit} />
            </div>
          </div>
        </div>
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
        actions={{
          primary: {
            label: intl("chat.message.delete.confirm"),
            onClick: confirmDelete,
          },
          secondary: {
            label: intl("chat.message.delete.cancel"),
            onClick: close,
          },
        }}
        close={discardDelete}
        type="error"
        title={intl("chat.message.delete")}
        description={intl("chat.message.delete.description")}
        open={!!deletableMessage}
        icon={<Trash />}
      />
      {otherMember && otherMember.role !== IUser.Role.Student && open ? (
        <ManageLesson
          type="book"
          tutorId={otherMember.id}
          close={() => setOpen(false)}
        />
      ) : null}
    </div>
  );
};

export default Messages;
