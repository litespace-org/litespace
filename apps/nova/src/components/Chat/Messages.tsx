import { IFilter, IMessage, IRoom } from "@litespace/types";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import MessageBox from "@/components/Chat/MessageBox";
import cn from "classnames";
import MessageGroup from "@/components/Chat/MessageGroup";
import { OnMessage, useChat } from "@/hooks/chat";
import { atlas } from "@litespace/luna/backend";
import { asMessageGroups } from "@litespace/luna/chat";
import { useMessages } from "@litespace/luna/hooks/chat";
import { Loading } from "@litespace/luna/Loading";
import NoSelection from "@/components/Chat/NoSelection";
import { useUser } from "@litespace/headless/user-ctx";

const Messages: React.FC<{
  room: number | null;
  members: IRoom.PopulatedMember[];
}> = ({ room, members }) => {
  const { user } = useUser();
  const messagesRef = useRef<HTMLDivElement>(null);
  const [userScrolled, setUserScolled] = useState<boolean>(false);
  const [updatableMessage, setUpdatableMessage] =
    useState<IMessage.Self | null>(null);

  const findRoomMessages = useCallback(
    async (id: number, pagination?: IFilter.Pagination) => {
      return await atlas.chat.findRoomMessages(id, pagination);
    },
    []
  );
  const {
    messages,
    loading,
    fetching,
    target,
    onMessage: onMessages,
  } = useMessages<HTMLDivElement>(findRoomMessages, room);

  const scrollDown = useCallback(() => {
    if (messagesRef.current)
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
  }, []);

  const onMessage: OnMessage = useCallback(
    (action) => {
      scrollDown();
      onMessages(action);
    },
    [onMessages, scrollDown]
  );

  const { sendMessage, updateMessage, deleteMessage } = useChat(onMessage);
  const discard = useCallback(() => setUpdatableMessage(null), []);

  const submit = useCallback(
    (text: string) => {
      if (!room) return;
      if (updatableMessage) {
        setUpdatableMessage(null);
        return updateMessage({ id: updatableMessage.id, text });
      }
      return sendMessage({ roomId: room, text });
    },
    [room, sendMessage, updatableMessage, updateMessage]
  );
  const onUpdateMessage = useCallback(
    (message: IMessage.Self) => setUpdatableMessage(message),
    []
  );

  const onDeleteMessage = useCallback(
    (message: IMessage.Self) => {
      return deleteMessage(message.id);
    },
    [deleteMessage]
  );

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

  useEffect(() => {
    if (!userScrolled) resetScroll();
  }, [messages, resetScroll, userScrolled]);

  const messageGroups = useMemo(() => {
    if (!user) return [];
    return asMessageGroups({
      currentUser: user,
      messages,
      members,
    });
  }, [members, messages, user]);

  return (
    <div
      className={cn(
        "flex-1 border-r border-border-strong h-full",
        "flex flex-col"
      )}
    >
      {room === null ? <NoSelection /> : null}

      {room ? (
        <>
          <div
            className={cn(
              "h-full overflow-x-hidden overflow-y-auto px-4 pt-2 mt-2 ml-4 pb-6",
              "scrollbar-thin scrollbar-thumb-border-stronger scrollbar-track-surface-300"
            )}
            ref={messagesRef}
            onScroll={onScroll}
          >
            <div ref={target} />

            <Loading
              show={loading || fetching}
              className={cn(
                loading ? "h-full" : fetching ? "h-12 shrink-0" : ""
              )}
            />

            {!loading ? (
              <ul className="flex flex-col gap-4">
                {messageGroups.map((group) => (
                  <MessageGroup
                    key={group.id}
                    group={group}
                    onUpdateMessage={onUpdateMessage}
                    onDeleteMessage={onDeleteMessage}
                  />
                ))}
              </ul>
            ) : null}
          </div>

          <div className="px-4 pt-2 pb-6">
            <MessageBox
              discard={discard}
              submit={submit}
              defaultMessage={updatableMessage ? updatableMessage.text : ""}
              update={updatableMessage !== null}
            />
          </div>
        </>
      ) : null}
    </div>
  );
};

export default Messages;
