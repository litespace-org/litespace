import React, { useMemo } from "react";
import { SocketContext } from "@/socket/context";
import { useBackend } from "@/backend";
import { io } from "socket.io-client";
import { sockets } from "@litespace/atlas";

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { backend, token } = useBackend();

  const socket = useMemo(() => {
    if (!token) return null;

    const options = {
      extraHeaders: { Authorization: `${token.type} ${token.value}` },
    } as const;

    return io(sockets.main[backend], options);
  }, [backend, token]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};
