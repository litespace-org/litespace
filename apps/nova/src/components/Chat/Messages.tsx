import { IFilter, IRoom } from "@litespace/types";
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
} from "@litespace/luna/Chat";
import { ConfirmationDialog } from "@litespace/luna/ConfirmationDialog";
import { OnMessage, useChat } from "@/hooks/chat";
import { asMessageGroups } from "@litespace/luna/chat";
import { useMessages } from "@litespace/luna/hooks/chat";
import { useFormatMessage } from "@litespace/luna/hooks/intl";
import { Loader, LoadingError } from "@litespace/luna/Loading";
import NoSelection from "@/components/Chat/NoSelection";
import dayjs from "dayjs";
import { entries, groupBy } from "lodash";
import { Typography } from "@litespace/luna/Typography";
import Trash from "@litespace/assets/Trash";
import { useAtlas } from "@litespace/headless/atlas";
import { useUser } from "@litespace/headless/context/user";
import StartNewMessage from "@litespace/assets/StartNewMessage";
import { InView } from "react-intersection-observer";

const Messages: React.FC<{
  room: number | null;
  otherMember: IRoom.FindUserRoomsApiRecord["otherMember"];
}> = ({ room, otherMember }) => {
  const { user } = useUser();
  const intl = useFormatMessage();
  const messagesRef = useRef<HTMLDivElement>(null);
  const [userScrolled, setUserScolled] = useState<boolean>(false);
  const [updatableMessage, setUpdatableMessage] = useState<{
    text: string;
    id: number;
  } | null>(null);
  const [deletableMessage, setDeletableMessage] = useState<number | null>(null);
  const atlas = useAtlas();

  // TODO: retrieve user online status from the server cache
  const [onlineStatus, _] = useState(false);

  const findRoomMessages = useCallback(
    async (id: number, pagination?: IFilter.Pagination) => {
      return await atlas.chat.findRoomMessages(id, pagination);
    },
    [atlas.chat]
  );

  const {
    messages,
    loading,
    fetching,
    onMessage: onMessages,
    refetch,
    error,
  } = useMessages(findRoomMessages, room);

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

  const { sendMessage, updateMessage, deleteMessage } = useChat(onMessage);

  const submit = useCallback(
    (text: string) => {
      if (!room) return;
      return sendMessage({ roomId: room, text });
    },
    [room, sendMessage]
  );

  const onUpdateMessage = useCallback(
    (text: string) => {
      if (!updatableMessage) return;
      setUpdatableMessage(null);
      updateMessage({ id: updatableMessage.id, text });
    },
    [updatableMessage, updateMessage]
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
    if (!deletableMessage) return;
    deleteMessage(deletableMessage);
    setDeletableMessage(null);
  }, [deletableMessage, deleteMessage]);

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
      style={{ height: "calc(100vh - 106px)" }}
      className={cn("flex-1 border-r border-border-strong", "flex flex-col")}
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
          online={onlineStatus}
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
            {loading ? (
              <Loader variant="small" text={intl("chat.message.loading")} />
            ) : (
              <ul className="flex flex-col gap-4 overflow-auto grow">
                {error && !fetching ? (
                  <div className="max-w-[192px] mx-auto">
                    <LoadingError
                      variant="small"
                      error={intl("chat.message.error")}
                      retry={refetch}
                    />
                  </div>
                ) : null}
                {fetching ? (
                  <div className="w-full my-4">
                    <Loader variant="small" />
                  </div>
                ) : null}
                <InView as="div" onChange={refetch} />
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

                        {groups.map((group) => (
                          <div className="mb-6" key={group.id}>
                            <ChatMessageGroup
                              {...group}
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
                  <div className="w-full h-full flex flex-col">
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
                  </div>
                )}
              </ul>
            )}
          </div>

          <div className="px-4 pt-2 pb-6">
            <SendInput onSubmit={submit} />
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
          confirm: "chat.message.delete.confirm",
          cancel: "chat.message.delete.cancel",
        }}
        type="error"
        title={intl("chat.message.delete")}
        description={intl("chat.message.delete.description")}
        open={!!deletableMessage}
        confirm={confirmDelete}
        close={discardDelete}
        icon={<Trash />}
      />
    </div>
  );
};

export default Messages;
