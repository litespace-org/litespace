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
import { OnMessage } from "@/hooks/chat";
import { atlas } from "@/lib/atlas";
import { asMessageGroups, Loading, useMessages } from "@litespace/luna";
import NoSelection from "@/components/Chat/NoSelection";
import { useAppSelector } from "@/redux/store";
import { profileSelector } from "@/redux/user/me";

const Messages: React.FC<{
  room: number | null;
  members: IRoom.PopulatedMember[];
}> = ({ room, members }) => {
  const profile = useAppSelector(profileSelector);
  const messagesRef = useRef<HTMLDivElement>(null);
  const [userScrolled, setUserScolled] = useState<boolean>(false);
  const [edit, setEdit] = useState<IMessage.Self | null>(null);

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
    if (!profile) return [];
    return asMessageGroups({
      currentUser: profile,
      messages,
      members,
    });
  }, [members, messages, profile]);

  const editMessage = useCallback((message: IMessage.Self) => {
    setEdit(message);
  }, []);

  const cancel = useCallback(() => {
    setEdit(null);
  }, []);

  const deleteMessage = useCallback((message: IMessage.Self) => {
    console.log(message);
  }, []);

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
            className="h-full overflow-x-hidden overflow-y-auto main-scrollbar px-4 pt-4 pb-6"
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
                    editMessage={editMessage}
                    deleteMessage={deleteMessage}
                  />
                ))}
              </ul>
            ) : null}
          </div>

          <div className="pb-6 px-4 pt-2">
            <MessageBox
              edit={edit}
              room={room}
              cancel={cancel}
              onMessage={onMessage}
            />
          </div>
        </>
      ) : null}
    </div>
  );
};

export default Messages;
