import { isDev } from "@/constants";
import { User, rooms, users } from "@/models";
import { Socket } from "socket.io";
import "colors";
import { Events } from "@/wss/events";

export class WssHandler {
  socket: Socket;
  user: User.Self;

  constructor(socket: Socket) {
    this.socket = socket;
    this.user = socket.request.user;
    this.initialize();
  }

  async initialize() {
    await this.markUserAsActive();
    await this.joinRooms();

    this.socket.on(Events.Client.Disconnect, async () => {
      if (isDev) console.log(`${this.user.name} is disconnected`.yellow);
      await this.markUserAsInActive();
    });
  }

  async joinRooms() {
    const list = await rooms.findMemberRooms({
      userId: this.user.id,
      type: this.user.type,
    });

    this.socket.join(list.map((room) => room.id.toString()));
  }

  async markUserAsActive() {
    await users.update({ id: this.user.id, active: true });
  }

  async markUserAsInActive() {
    await users.update({ id: this.user.id, active: false });
  }
}

export function wssHandler(socket: Socket) {
  return new WssHandler(socket);
}
