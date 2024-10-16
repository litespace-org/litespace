import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { sockets as urls } from "@litespace/atlas";
import { backend } from "@/lib/atlas";

type Sockets = {
  api: Socket;
  recorder: Socket;
};

const SocketsContext = createContext<Sockets | null>(null);

export const SocketProvider: React.FC<{
  children?: React.ReactNode;
  token: string | null;
}> = ({ children, token }) => {
  const [sockets, setSockets] = useState<Sockets | null>(null);

  useEffect(() => {
    console.log({ token });
    if (!token) return;
    const api = io(urls.main[backend], {
      extraHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });

    const recorder = io(urls.recorder[backend], {
      extraHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });

    setSockets({
      api,
      recorder,
    });

    return () => {
      api.disconnect();
      recorder.disconnect();
    };
  }, [token]);

  return (
    <SocketsContext.Provider value={sockets}>
      {children}
    </SocketsContext.Provider>
  );
};

export function useSockets() {
  const sockets = useContext(SocketsContext);
  return sockets;
}
