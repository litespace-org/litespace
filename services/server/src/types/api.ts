import { Wss } from "@litespace/types";
import { Server } from "socket.io";

export type ApiContext = {
  io: Server<Wss.ClientEventsMap, Wss.ServerEventsMap>;
};
