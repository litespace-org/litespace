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

  handlers.connection.connect();
  socket.on(Wss.ClientEvent.Disconnect, handlers.connection.disconnect.bind(handlers.connection));

  socket.on(Wss.ClientEvent.JoinCall, handlers.call.onJoinCall.bind(handlers.call));
  socket.on(Wss.ClientEvent.LeaveCall, handlers.call.onLeaveCall.bind(handlers.call));

  socket.on(Wss.ClientEvent.SendMessage, handlers.message.sendMessage.bind(handlers.message));
  socket.on(Wss.ClientEvent.UpdateMessage, handlers.message.updateMessage.bind(handlers.message));
  socket.on(Wss.ClientEvent.DeleteMessage, handlers.message.deleteMessage.bind(handlers.message));

  socket.on(Wss.ClientEvent.PeerOpened, handlers.peer.peerOpened.bind(handlers.peer));
  socket.on(Wss.ClientEvent.RegisterPeer, handlers.peer.registerPeer.bind(handlers.peer));

  socket.on(Wss.ClientEvent.ToggleCamera, handlers.inputDevices.toggleCamera.bind(handlers.inputDevices));
  socket.on(Wss.ClientEvent.ToggleMic, handlers.inputDevices.toggleMic.bind(handlers.inputDevices));
  socket.on(Wss.ClientEvent.UserTyping, handlers.inputDevices.userTyping.bind(handlers.inputDevices));
}
