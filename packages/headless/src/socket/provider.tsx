import React, { useMemo } from "react";
import { SocketContext } from "@/socket/context";
import { useServer } from "@/server";
import { io } from "socket.io-client";
import { sockets } from "@litespace/atlas";

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { server, token } = useServer();

  const socket = useMemo(() => {
    if (!token) return null;

    const options = {
      extraHeaders: { Authorization: `${token.type} ${token.value}` },
    } as const;

    console.debug("SocketProvider: socket updated!");
    return io(sockets.main[server], options);
  }, []);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};
