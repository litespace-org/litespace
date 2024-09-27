import socket from "@/lib/wss";
import { MessageStream, MessageStreamAction } from "@litespace/luna";
import { Events, IMessage } from "@litespace/types";
import { useCallback, useEffect } from "react";

export type OnMessage = (action: MessageStreamAction) => void;

export function useChat(onMessage?: OnMessage) {
  const sendMessage = useCallback(
    ({ roomId, text }: { roomId: number; text: string }) => {
      socket.emit(Events.Client.SendMessage, { roomId, text });
    },
    []
  );

  const updateMessage = useCallback(
    ({ id, text }: { id: number; text: string }) => {
      socket.emit(Events.Client.UpdateMessage, { id, text });
    },
    []
  );

  const deleteMessage = useCallback((id: number) => {
    socket.emit(Events.Client.DeleteMessage, { id });
  }, []);

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
    if (!onMessage) return;
    socket.on(Events.Server.RoomMessage, onRoomMessage);
    socket.on(Events.Server.RoomMessageUpdated, onUpdateMessage);
    socket.on(Events.Server.RoomMessageDeleted, onDeleteMessage);
    return () => {
      socket.off(Events.Server.RoomMessage, onRoomMessage);
      socket.off(Events.Server.RoomMessageUpdated, onUpdateMessage);
      socket.off(Events.Server.RoomMessageDeleted, onDeleteMessage);
    };
  }, [onDeleteMessage, onMessage, onRoomMessage, onUpdateMessage]);

  return {
    sendMessage,
    deleteMessage,
    updateMessage,
  };
}
