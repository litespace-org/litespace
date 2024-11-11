import React, { useMemo } from "react";
import { SocketContext } from "@/socket/context";
import { useBackend } from "@/backend";
import { io } from "socket.io-client";
import { sockets } from "@litespace/atlas";

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { backend, getToken } = useBackend();

  const socket = useMemo(() => {
    const token = getToken();
    if (!token) return null;

    const options = {
      extraHeaders: { Authorization: `${token.type} ${token.value}` },
    } as const;

    return io(sockets.main[backend], options);
  }, [backend, getToken]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};
