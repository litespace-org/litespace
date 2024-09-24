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
import Message, { Sender, MessageGroup } from "@/components/Chat/Message";
import { OnMessage } from "@/hooks/chat";
import { atlas } from "@/lib/atlas";
import { usePaginationQuery } from "@/hooks/common";
import { concat, isEmpty, maxBy, orderBy } from "lodash";
import { Loading, useInfinteScroll, useMessages } from "@litespace/luna";
import NoSelection from "@/components/Chat/NoSelection";
import { useQueryClient } from "@tanstack/react-query";
import dayjs from "@/lib/dayjs";
import { useAppSelector } from "@/redux/store";
import { profileSelector } from "@/redux/user/me";

const Messages: React.FC<{
  room: number | null;
  members: IRoom.PopulatedMember[];
}> = ({ room, members }) => {
  const profile = useAppSelector(profileSelector);
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

  const { target } = useInfinteScroll<HTMLDivElement>(more, true);

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

  const asSender = useCallback(
    (user: number | null): Sender | null => {
      if (!user || !profile) return null;
      if (user === profile.id)
        return {
          id: profile.id,
          name: profile.name.ar,
          photo: profile.photo,
        };

      const member = members.find((member) => member.id === user);
      if (!member) return null;
      return {
        id: member.id,
        name: member.name,
        photo: member.photo,
      };
    },
    [members, profile]
  );

  const assignGroup = useCallback(
    (user: number | null, messages: IMessage.Self[]): MessageGroup | null => {
      if (isEmpty(messages)) return null;
      const sender = asSender(user);
      if (!sender) return null;

      const latest = maxBy(messages, (message) =>
        dayjs(message.updatedAt).unix()
      );
      if (!latest) return null;

      const id = messages.map((message) => message.id).join("-");
      return { id, sender, messages, date: latest.updatedAt };
    },
    [asSender]
  );

  // reset
  useEffect(() => {
    return () => {
      if (!room) return;
      resetScroll();
      setFreshMessages([]);
      queryClient.invalidateQueries({ queryKey: ["find-room-messages", room] });
    };
  }, [queryClient, resetScroll, room]);

  const messageGroups = useMemo(() => {
    const groups: MessageGroup[] = [];

    let user: number | null = null;
    let group: IMessage.Self[] = [];
    for (const message of messages) {
      if (!user && isEmpty(group)) user = message.userId;

      // message from the same user, push to the same group
      if (message.userId === user) {
        group.push(message);
      } else {
        const assignedGroup = assignGroup(user, group);
        if (!assignedGroup) continue;
        // append previous group
        groups.push(assignedGroup);
        // create new group
        group = [message];
        user = message.userId;
      }
    }

    const lastGroup = assignGroup(user, group);
    if (lastGroup) groups.push(lastGroup);
    return groups;
  }, [assignGroup, messages]);

  const findRoomMessages_ = useCallback(
    async (id: number, pagination?: IFilter.Pagination) => {
      return await atlas.chat.findRoomMessages(id, pagination);
    },
    []
  );
  const { messages: msgs } = useMessages(findRoomMessages_, room);
  console.log(msgs);

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
            <ul className="flex flex-col gap-4">
              {messageGroups.map((group) => (
                <Message key={group.id} group={group} />
              ))}
            </ul>
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
