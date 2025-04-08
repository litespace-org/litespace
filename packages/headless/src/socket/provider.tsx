import React, { useCallback, useEffect, useMemo, useState } from "react";
import { SocketContext } from "@/socket/context";
import { useServer } from "@/server";
import { io, Socket } from "socket.io-client";
import { sockets } from "@litespace/atlas";
import { encodeToken } from "@litespace/atlas";
import { Wss } from "@litespace/types";

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { server, token } = useServer();
  const [connected, setConnected] = useState<boolean>(false);

  const socket: Socket<Wss.ServerEventsMap, Wss.ClientEventsMap> | null =
    useMemo(() => {
      if (!token) return null;

      const options = {
        extraHeaders: { Authorization: encodeToken(token) },
        reconnection: true,
        autoConnect: true,
      } as const;

      return io(sockets.main[server], options);
    }, [server, token]);

  const onConnect = useCallback(() => {
    setConnected(true);
  }, []);

  const onDisconnect = useCallback(() => {
    setConnected(false);
  }, []);

  const onConnectionError = useCallback((error: Error) => {
    console.log(`Socket connection error: ${error.message}`);
  }, []);

  useEffect(() => {
    socket?.on("connect", onConnect);
    socket?.on("disconnect", onDisconnect);
    socket?.on("connect_error", onConnectionError);

    return () => {
      socket?.off("connect", onConnect);
      socket?.off("disconnect", onDisconnect);
      socket?.off("connect_error", onConnectionError);
    };
  }, [onConnect, onConnectionError, onDisconnect, socket]);

  console.log(`Socket connected: ${connected}`);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};
