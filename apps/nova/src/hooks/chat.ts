import { MessageStream, MessageStreamAction } from "@litespace/luna";
import { Wss, IMessage } from "@litespace/types";
import { useCallback, useEffect } from "react";
import { useSocket } from "@litespace/headless/socket";

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
