import { Void, Wss } from "@litespace/types";
import { createContext, useContext } from "react";
import { Socket } from "socket.io-client";

type Context = {
  reconnect: Void;
  socket: Socket<Wss.ServerEventsMap, Wss.ClientEventsMap> | null;
};

export const SocketContext = createContext<Context>({
  socket: null,
  reconnect: () => {},
});

export function useSocket() {
  return useContext(SocketContext);
}
