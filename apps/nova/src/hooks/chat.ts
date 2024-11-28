import { MessageStream, MessageStreamAction } from "@litespace/luna/hooks/chat";
import { Wss, IMessage, IRoom } from "@litespace/types";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSocket } from "@litespace/headless/socket";
import { useAppSelector } from "@/redux/store";
import { profileSelectors } from "@/redux/user/profile";
import { useFindUserRooms, useUpdateRoom } from "@litespace/headless/chat";
import { UseInfinitePaginationQueryResult } from "@litespace/headless/query";
import { useInfinteScroll } from "@litespace/luna/hooks/common";
import { useToast } from "@litespace/luna/Toast";
import { useFormatMessage } from "@litespace/luna/hooks/intl";

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

export function useRoomManager() {
  const toast = useToast();
  const intl = useFormatMessage();
  const [keyword, setKeyword] = useState("");

  const profile = useAppSelector(profileSelectors.user);

  const pinnedRooms = useFindUserRooms(profile?.id, {
    pinned: true,
  });

  const allRooms = useFindUserRooms(profile?.id, {
    pinned: keyword ? true : false,
    keyword,
    size: 2,
  });

  const isEnabled = useCallback(
    (
      query: UseInfinitePaginationQueryResult<IRoom.FindUserRoomsApiRecord>["query"]
    ) => query.hasNextPage && !query.isLoading && !query.isFetching,
    []
  );

  const allRoomsEnabled = useMemo(
    () => isEnabled(allRooms.query),
    [allRooms.query, isEnabled]
  );

  const pinnedRoomsEnabled = useMemo(
    () => isEnabled(pinnedRooms.query),
    [pinnedRooms.query, isEnabled]
  );

  const { target: allRoomsTarget } = useInfinteScroll<HTMLDivElement>(
    () => allRooms.more,
    true
  );

  const { target: pinnedRoomsTarget } = useInfinteScroll<HTMLDivElement>(
    pinnedRooms.more,
    pinnedRoomsEnabled
  );

  const update = useUpdateRoom({
    onSuccess() {
      pinnedRooms.query.refetch();
      allRooms.query.refetch();
    },
    onError() {
      toast.error({ title: intl("chat.update-settings.error") });
    },
  });

  return {
    rooms: {
      all: {
        list: allRooms.list,
        query: allRooms.query,
        target: allRoomsTarget,
        enabled: allRoomsEnabled,
      },
      pinned: {
        query: pinnedRooms.query,
        list: pinnedRooms.list,
        target: pinnedRoomsTarget,
        enabled: pinnedRoomsEnabled,
      },
    },
    keyword: {
      value: keyword,
      set: setKeyword,
    },
    update: {
      toggleMute: ({ roomId, muted }: { roomId: number; muted: boolean }) =>
        update.mutate({ roomId, payload: { muted } }),
      togglePin: ({ roomId, pinned }: { roomId: number; pinned: boolean }) =>
        update.mutate({ roomId, payload: { pinned } }),
    },
  };
}
