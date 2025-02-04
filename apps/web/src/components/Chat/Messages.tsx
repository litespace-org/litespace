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
import BookLesson from "@/components/Lessons/BookLesson";
import StartNewMessage from "@litespace/assets/StartNewMessage";
import { HEADER_HEIGHT } from "@/constants/ui";
import { useToast } from "@litespace/ui/Toast";
import { SelectRoom, UncontactedTutorRoomId } from "@litespace/ui/hooks/chat";
import { useInvalidateQuery } from "@litespace/headless/query";
import { QueryKey } from "@litespace/headless/constants";
import { ResponseError } from "@litespace/utils";
import { getErrorMessageId } from "@litespace/ui/errorMessage";

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
  inCall?: boolean;
}> = ({
  room,
  otherMember,
  setTemporaryTutor,
  select,
  isTyping,
  isOnline,
  inCall,
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
    (error: ResponseError) => {
      const errorMessage = getErrorMessageId(error);
      toast.error({
        title: intl("chat.create.room.error"),
        description: intl(errorMessage),
      });
    },
    [toast, intl]
  );

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

  const chatHeaderProps: React.ComponentProps<typeof ChatHeader> | null =
    useMemo(() => {
      if (!otherMember) return null;

      return {
        id: otherMember.id,
        name: otherMember.name,
        image: otherMember.image,
        role: otherMember.role,
        online: isOnline,
        lastSeen: dayjs(otherMember.lastSeen).fromNow(),
        openDialog: openDialog,
      };
    }, [otherMember, openDialog, isOnline]);

  return (
    <div
      style={{
        height: !inCall ? `calc(100vh - ${HEADER_HEIGHT}px)` : "",
      }}
      className="flex-1 flex flex-col h-full bg-natural-50"
    >
      {room === null ? <NoSelection /> : null}

      {chatHeaderProps ? (
        <ChatHeader
          {...chatHeaderProps}
          openDialog={openDialog}
          inCall={inCall}
        />
      ) : null}

      {room ? (
        <>
          <div
            className={cn(
              "grow overflow-x-hidden overflow-y-auto px-4 pt-2 mt-2 ml-4 pb-6",
              "scrollbar-thin scrollbar-thumb-natural-200 scrollbar-track-natural-50"
            )}
          >
            {loading ? (
              <div className="w-full h-full flex justify-center items-center">
                <Loader size="large" text={intl("chat.message.loading")} />
              </div>
            ) : (
              <ul
                className={cn(
                  "flex flex-col gap-4 overflow-auto grow",
                  inCall ? "h-[380px]" : "h-full"
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
                      <div key={index} className="w-full">
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
                          .map((group, index) => (
                            <div className="mb-6" key={index}>
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
          {isTyping && otherMember ? (
            <div className="px-6">
              <UserTyping
                id={otherMember.id}
                name={otherMember.name}
                gender={otherMember.gender}
                imageUrl={otherMember.image}
              />
            </div>
          ) : null}
          <div className={cn("px-4 pt-2 pb-6 mt-3", inCall && "-mt-6")}>
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
      {otherMember && otherMember.role !== IUser.Role.Student && open ? (
        <BookLesson tutorId={otherMember.id} close={closeDialog} />
      ) : null}
    </div>
  );
};

export default Messages;
