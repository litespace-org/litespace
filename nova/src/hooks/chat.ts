import socket from "@/lib/wss";
import { Events, IMessage } from "@litespace/types";
import { useCallback, useEffect } from "react";

export type OnMessage = (message: IMessage.Self) => void;

export function useChat(onMessage?: OnMessage) {
  const sendMessage = useCallback(
    ({ roomId, message }: { roomId: number; message: string }) => {
      socket.emit(Events.Client.SendMessage, { roomId, text: message });
    },
    []
  );

  useEffect(() => {
    if (!onMessage) return;
    socket.on(Events.Server.RoomMessage, onMessage);
    return () => {
      socket.off(Events.Server.RoomMessage, onMessage);
    };
  }, [onMessage]);

  return {
    sendMessage,
  };
}
