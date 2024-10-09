import {
  MessageStream,
  MessageStreamAction,
  useSockets,
} from "@litespace/luna";
import { Events, IMessage } from "@litespace/types";
import { useCallback, useEffect } from "react";

export type OnMessage = (action: MessageStreamAction) => void;

export function useChat(onMessage?: OnMessage) {
  const sockets = useSockets();
  const sendMessage = useCallback(
    ({ roomId, text }: { roomId: number; text: string }) => {
      sockets?.api.emit(Events.Client.SendMessage, { roomId, text });
    },
    [sockets?.api]
  );

  const updateMessage = useCallback(
    ({ id, text }: { id: number; text: string }) => {
      sockets?.api.emit(Events.Client.UpdateMessage, { id, text });
    },
    [sockets?.api]
  );

  const deleteMessage = useCallback(
    (id: number) => {
      sockets?.api.emit(Events.Client.DeleteMessage, { id });
    },
    [sockets?.api]
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
    if (!onMessage || !sockets?.api) return;
    sockets.api.on(Events.Server.RoomMessage, onRoomMessage);
    sockets.api.on(Events.Server.RoomMessageUpdated, onUpdateMessage);
    sockets.api.on(Events.Server.RoomMessageDeleted, onDeleteMessage);
    return () => {
      sockets.api.off(Events.Server.RoomMessage, onRoomMessage);
      sockets.api.off(Events.Server.RoomMessageUpdated, onUpdateMessage);
      sockets.api.off(Events.Server.RoomMessageDeleted, onDeleteMessage);
    };
  }, [
    onDeleteMessage,
    onMessage,
    onRoomMessage,
    onUpdateMessage,
    sockets?.api,
  ]);

  return {
    sendMessage,
    deleteMessage,
    updateMessage,
  };
}
