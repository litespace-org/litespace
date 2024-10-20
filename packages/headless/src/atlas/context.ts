import { Atlas, GetToken, sockets as socketUrls } from "@litespace/atlas";
import { Backend, Wss } from "@litespace/types";
import React, { useContext, useMemo } from "react";
import { io, Socket } from "socket.io-client";

type Context = {
  backend: Backend;
  getToken: GetToken;
};

type Sockets = {
  api: Socket<Wss.ServerEventsMap, Wss.ClientEventsMap>;
  recorder: Socket;
};

export const BackendContext = React.createContext<Context | null>(null);

export function useBackend(): Context {
  const context = useContext(BackendContext);
  if (!context)
    throw new Error("Invalid context. Using outside the provider?!");
  return context;
}

export function useAtlas() {
  const { backend, getToken } = useBackend();
  const atlas = useMemo(() => {
    return new Atlas(backend, getToken);
  }, [backend, getToken]);
  return atlas;
}

export function useSockets(): Sockets | null {
  const { backend, getToken } = useBackend();

  return useMemo(() => {
    const token = getToken();
    if (!token) return null;

    const options = {
      extraHeaders: {
        Authorization: `Bearer ${token}`,
      },
    } as const;

    return {
      api: io(socketUrls.main[backend], options),
      recorder: io(socketUrls.recorder[backend], options),
    };
  }, [backend, getToken]);
}
