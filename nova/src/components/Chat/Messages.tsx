import { IMessage } from "@litespace/types";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import MessageBox from "@/components/Chat/MessageBox";
import cn from "classnames";
import Message from "./Message";
import { OnMessage } from "@/hooks/chat";
import { atlas } from "@/lib/atlas";
import { usePaginationQuery } from "@/hooks/common";
import { concat, orderBy, reverse } from "lodash";
import { Loading, useInfinteScroll, useMessages } from "@litespace/luna";
import NoSelection from "@/components/Chat/NoSelection";
import { useQueryClient } from "@tanstack/react-query";
import dayjs from "@/lib/dayjs";

const Messages: React.FC<{
  room: number | null;
  userId?: number;
}> = ({ room, userId }) => {
  const messagesRef = useRef<HTMLDivElement>(null);
  const [freshMessages, setFreshMessages] = useState<IMessage.Self[]>([]);
  const [userScrolled, setUserScolled] = useState<boolean>(false);
  const queryClient = useQueryClient();

  const findRoomMessages = useCallback(
    async ({ pageParam }: { pageParam: number }) => {
      if (!room) return { list: [], total: 0 };
      return await atlas.chat.findRoomMessages(room, { page: pageParam });
    },
    [room]
  );

  const { list, query, more } = usePaginationQuery(findRoomMessages, [
    "find-room-messages",
    room,
  ]);

  const messages = useMemo(() => {
    if (!list) return freshMessages;
    return orderBy(
      concat(list, freshMessages),
      (message) => dayjs(message.createdAt).unix(),
      "asc"
    );
  }, [freshMessages, list]);

  const onMessage: OnMessage = useCallback((message) => {
    setFreshMessages((prev) => [...prev, message]);
    if (messagesRef.current)
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
  }, []);

  const { target } = useInfinteScroll<HTMLDivElement>(more);

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

  // reset
  useEffect(() => {
    return () => {
      if (!room) return;
      resetScroll();
      setFreshMessages([]);
      queryClient.invalidateQueries({ queryKey: ["find-room-messages", room] });
    };
  }, [queryClient, resetScroll, room]);

  return (
    <div
      className={cn(
        "flex-1 border-r border-border-strong h-full",
        "flex flex-col"
      )}
    >
      <Loading show={query.isLoading} className="h-full" />

      {room === null ? <NoSelection /> : null}

      {room ? (
        <>
          <div
            className="h-full overflow-auto main-scrollbar px-4 pt-4 pb-6"
            ref={messagesRef}
            onScroll={onScroll}
          >
            <div ref={target} />
            {messages ? (
              <ul>
                {messages.map((message, idx) => {
                  const prevMessage: IMessage.Self | undefined =
                    messages[idx - 1];
                  const nextMessage: IMessage.Self | undefined =
                    messages[idx + 1];
                  const owner = message.userId === userId;
                  const ownPrev = prevMessage?.userId === message.userId;
                  const ownNext = nextMessage?.userId === message.userId;
                  return (
                    <Message
                      key={message.id}
                      message={message}
                      owner={owner}
                      ownPrev={ownPrev}
                      ownNext={ownNext}
                    />
                  );
                })}
              </ul>
            ) : null}
          </div>
          <div className="pb-6 px-4 pt-2">
            <MessageBox room={room} onMessage={onMessage} />
          </div>
        </>
      ) : null}
    </div>
  );
};

export default Messages;
