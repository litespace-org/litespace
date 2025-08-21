import { Void, Wss } from "@litespace/types";
import { createContext, useContext } from "react";
import { Socket } from "socket.io-client";

type Context = {
  socket: Socket<Wss.ServerEventsMap, Wss.ClientEventsMap> | null;
  reconnect: Void;
  disconnect: Void;
  connected: boolean;
};

export const SocketContext = createContext<Context>({
  socket: null,
  reconnect: () => {},
  disconnect: () => {},
  connected: false,
});

export function useSocket() {
  return useContext(SocketContext);
}
