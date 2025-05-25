import React, { useCallback, useEffect, useMemo, useState } from "react";
import { EchoSocketContext, Context } from "@/echo/context";
import { useServer } from "@/server";
import { ISession } from "@litespace/types";
import { useUser } from "@/user/index";
import { Socket } from "@/echo/socket";

export const EchoSocketProvider: React.FC<{
  children: React.ReactNode;
  sessionId: ISession.Id;
}> = ({ children, sessionId }) => {
  const { server } = useServer();
  const { user } = useUser();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connecting, setConnecting] = useState<boolean>(false);
  const [connected, setConnected] = useState<boolean>(false);

  // initialize webscoket connection
  useEffect(() => {
    if (!user?.id) return;
    setConnecting(true);
    setConnected(false);
    setSocket((prev) => {
      // ref: https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/close
      // ref: https://www.rfc-editor.org/rfc/rfc6455.html#section-7.4.1
      if (prev) prev.close(1000);
      return new Socket(server, sessionId, user.id);
    });
  }, [server, sessionId, user?.id]);

  const onOpen = useCallback(() => {
    setConnecting(false);
    setConnected(true);
  }, []);

  const onClose = useCallback(() => {
    setConnecting(false);
    setConnected(false);
  }, []);

  useEffect(() => {
    socket?.on("open", onOpen);
    socket?.on("close", onClose);

    return () => {
      socket?.off("open", onOpen);
      socket?.off("close", onClose);
    };
  }, [onClose, onOpen, socket]);

  // echo socket context
  const value = useMemo((): Context => {
    return { socket, connecting, connected };
  }, [connected, connecting, socket]);

  return (
    <EchoSocketContext.Provider value={value}>
      {children}
    </EchoSocketContext.Provider>
  );
};
