import { isDev } from "@/constants";
import { User, users } from "@/models";
import { Socket } from "socket.io";
import "colors";

export class WssHandler {
  socket: Socket;
  user: User.Self;

  constructor(socket: Socket) {
    this.socket = socket;
    this.user = socket.request.user;
    this.initialize();
  }

  async initialize() {
    await users.update({ id: this.user.id, active: true });

    this.socket.on("disconnect", async () => {
      if (isDev) console.log(`${this.user.name} is disconnected`.yellow);
      await users.update({ id: this.user.id, active: false });
    });
  }
}

export function wssHandler(socket: Socket) {
  return new WssHandler(socket);
}
