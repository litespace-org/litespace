import { Wss } from "@litespace/types";
import { createContext, useContext } from "react";
import { Socket } from "socket.io-client";

type Context = Socket<Wss.ServerEventsMap, Wss.ClientEventsMap>;

export const SocketContext = createContext<Context | null>(null);

export function useSocket() {
  return useContext(SocketContext);
}
