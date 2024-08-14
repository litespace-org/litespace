import socket from "@/lib/wss";
import { Events, IMessage } from "@litespace/types";
import { useCallback, useEffect } from "react";

export function useChat(onMessage: (message: IMessage.Self) => void) {
  const sendMessage = useCallback(
    ({ roomId, message }: { roomId: number; message: string }) => {
      socket.emit(Events.Client.SendMessage, { roomId, text: message });
    },
    []
  );

  useEffect(() => {
    socket.on(Events.Server.RoomMessage, onMessage);
    return () => {
      socket.off(Events.Server.RoomMessage, onMessage);
    };
  }, [onMessage]);

  return {
    sendMessage,
  };
}
