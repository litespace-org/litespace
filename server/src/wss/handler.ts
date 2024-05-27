import { isDev } from "@/constants";
import { User, messages, rooms, users } from "@/models";
import { Socket } from "socket.io";
import "colors";
import { Events } from "@/wss/events";
import { schema } from "@/validation";

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

    this.socket.on(Events.Client.SendMessage, this.sendMessage.bind(this));

    this.socket.on("disconnect", async () => {
      if (isDev) console.log(`${this.user.name} is disconnected`.yellow);
      await this.markUserAsInActive();
    });
  }

  async joinRooms() {
    const list = await rooms.findMemberRooms({
      userId: this.user.id,
      type: this.user.type,
    });

    const ids = list.map((room) => room.id.toString());
    this.socket.join(ids);
    this.socket.emit(Events.Server.JoinedRooms, ids);
  }

  async sendMessage(data: unknown) {
    try {
      const { roomId, body } = schema.wss.message.send.parse(data);
      const userId = this.user.id;

      const room = await rooms.findById(roomId);
      if (!room) throw Error("room not found");

      const member = [room.studentId, room.tutorId].includes(userId);
      if (!member) throw new Error("unauthorized");

      const msg = await messages.create({
        userId,
        roomId,
        body,
        replyId: null,
        isRead: false,
      });

      this.socket.broadcast
        .to(roomId.toString())
        .emit(Events.Server.RoomMessage, msg);
    } catch (error) {
      console.log(error);
    }
  }

  async markUserAsActive() {
    await users.update({ id: this.user.id, active: true });
  }

  async markUserAsInActive() {
    await users.update({ id: this.user.id, active: false });
  }

  safe() {}
}

export function wssHandler(socket: Socket) {
  return new WssHandler(socket);
}
