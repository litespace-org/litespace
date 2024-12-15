import { Socket } from "socket.io";
import { WSSHandlers } from "./handlers";
import { logger } from "@litespace/sol";
import { Wss } from "@litespace/types";


const stdout = logger("wss");

export function wssConnectionHandler(socket: Socket) {
  const user = socket.request.user;
  if (!user) {
    stdout.warning("(function) wssHandler: No user has been found in the request obj!");
    return;
  }
  const handlers = new WSSHandlers(socket, user);
  socket.on(Wss.ClientEvent.JoinCall, handlers.call.onJoinCall);
  socket.on(Wss.ClientEvent.LeaveCall, handlers.call.onLeaveCall);
}
