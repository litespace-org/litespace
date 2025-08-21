import React, { useCallback, useEffect, useState } from "react";
import { SocketContext } from "@/socket/context";
import { useServer } from "@/server";
import { io, ManagerOptions, Socket, SocketOptions } from "socket.io-client";
import { AuthToken, sockets } from "@litespace/atlas";
import { encodeToken } from "@litespace/atlas";
import { Env, Wss } from "@litespace/types";

const createSocket = (server: Env.Server, token: AuthToken) => {
  const options: Partial<ManagerOptions & SocketOptions> = {
    extraHeaders: { Authorization: encodeToken(token) },
    reconnection: true,
    autoConnect: true,
  } as const;
  return io(sockets.main[server], options);
};

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { server, token } = useServer();
  const [socket, setSocket] = useState<Socket<
    Wss.ServerEventsMap,
    Wss.ClientEventsMap
  > | null>(null);
  const [connected, setConnected] = useState(false);

  const reconnect = useCallback(() => {
    if (socket !== null) {
      socket.connect();
      return;
    }
    if (!token) return;
    setSocket((prev) => {
      if (prev) prev.disconnect();
      return createSocket(server, token);
    });
  }, [server, token, socket]);

  const disconnect = useCallback(() => {
    if (socket !== null) socket.disconnect();
  }, [socket]);

  useEffect(() => reconnect(), [reconnect]);

  const onConnect = useCallback(() => {
    console.log("Socket connected.");
    setConnected(true);
  }, []);

  const onDisconnect = useCallback(() => {
    console.log("Socket disconnected!");
    setConnected(false);
  }, []);

  const onConnectionError = useCallback((error: Error) => {
    console.log(`Socket connection error: ${error.message}`);
    setConnected(false);
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

  return (
    <SocketContext.Provider
      value={{
        socket,
        reconnect,
        disconnect,
        connected,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
