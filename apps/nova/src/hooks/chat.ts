import { MessageStream, MessageStreamAction } from "@litespace/luna/hooks/chat";
import { Wss, IMessage } from "@litespace/types";
import { useCallback, useEffect, useMemo } from "react";
import { useSocket } from "@litespace/headless/socket";
import { useAppSelector } from "@/redux/store";
import { profileSelectors } from "@/redux/user/profile";
import { useFindUserRooms } from "@litespace/headless/messageRooms";

export type OnMessage = (action: MessageStreamAction) => void;

export function useChat(onMessage?: OnMessage) {
  const socket = useSocket();

  const sendMessage = useCallback(
    ({ roomId, text }: { roomId: number; text: string }) => {
      socket?.emit(Wss.ClientEvent.SendMessage, { roomId, text });
    },
    [socket]
  );

  const updateMessage = useCallback(
    ({ id, text }: { id: number; text: string }) => {
      socket?.emit(Wss.ClientEvent.UpdateMessage, { id, text });
    },
    [socket]
  );

  const deleteMessage = useCallback(
    (id: number) => {
      socket?.emit(Wss.ClientEvent.DeleteMessage, { id });
    },
    [socket]
  );

  const onRoomMessage = useCallback(
    (message: IMessage.Self) => {
      if (!onMessage) return;
      return onMessage({
        type: MessageStream.Add,
        message,
      });
    },
    [onMessage]
  );

  const onUpdateMessage = useCallback(
    (message: IMessage.Self) => {
      if (!onMessage) return;
      return onMessage({
        type: MessageStream.Update,
        message,
      });
    },
    [onMessage]
  );

  const onDeleteMessage = useCallback(
    ({ roomId, messageId }: { roomId: number; messageId: number }) => {
      if (!onMessage) return;
      return onMessage({ type: MessageStream.Delete, roomId, messageId });
    },
    [onMessage]
  );

  useEffect(() => {
    if (!onMessage || !socket) return;
    socket.on(Wss.ServerEvent.RoomMessage, onRoomMessage);
    socket.on(Wss.ServerEvent.RoomMessageUpdated, onUpdateMessage);
    socket.on(Wss.ServerEvent.RoomMessageDeleted, onDeleteMessage);
    return () => {
      socket.off(Wss.ServerEvent.RoomMessage, onRoomMessage);
      socket.off(Wss.ServerEvent.RoomMessageUpdated, onUpdateMessage);
      socket.off(Wss.ServerEvent.RoomMessageDeleted, onDeleteMessage);
    };
  }, [onDeleteMessage, onMessage, onRoomMessage, onUpdateMessage, socket]);

  return {
    sendMessage,
    deleteMessage,
    updateMessage,
  };
}

export type UseRoomQueryParams = {
  keyword?: string;
  queryId: "all" | "pinned";
};

export function useRoomQuery({ keyword, queryId }: UseRoomQueryParams) {
  const profile = useAppSelector(profileSelectors.user);

  const isPinned = queryId === "pinned";

  const { list, query, more } = useFindUserRooms(profile, queryId, {
    keyword,
    pinned: isPinned,
  });

  const enabled = useMemo(
    () => query.hasNextPage && !query.isLoading && !query.isFetching,
    [query.hasNextPage, query.isFetching, query.isLoading]
  );

  return { list, query, more, enabled };
}
