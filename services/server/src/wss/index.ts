import { Socket } from "socket.io";
import { WssHandlers } from "@/wss/handlers";
import { logger } from "@litespace/utils";

const stdout = logger("wss");

export function wssHandler(socket: Socket) {
  const user = socket.request.user;
  if (!user)
    return stdout.warning(
      "wssHandler: No user has been found in the request obj!"
    );
  return new WssHandlers(socket, user);
}
