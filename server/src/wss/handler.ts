import { isDev } from "@/constants";
import { messages, rooms, users } from "@/models";
import { IUser } from "@litespace/types";
import { Socket } from "socket.io";
import { Events } from "@litespace/types";
import wss from "@/validation/wss";
import "colors";

export class WssHandler {
  socket: Socket;
  user: IUser.Self;

  constructor(socket: Socket) {
    this.socket = socket;
    this.user = socket.request.user;
    this.initialize();
  }

  async initialize() {
    await Promise.all([this.setUserStatus(true), this.joinRooms()]);
    this.socket.on(Events.Client.SendMessage, this.sendMessage.bind(this));
    // this.socket.on(Events.Client.MarkAsRead, this.markMessageAsRead.bind(this));
    // this.socket.on(Events.Client.CallHost, this.callHost.bind(this));

    this.socket.on("disconnect", async () => {
      if (isDev) console.log(`${this.user.name.en} is disconnected`.yellow);
      await this.setUserStatus(false);
    });
  }

  async joinRooms() {
    const list = await rooms.findMemberRooms(this.user.id);
    const ids = list.map((room) => room.toString());
    this.socket.join(ids);
    // private channel
    this.socket.join(this.user.id.toString());

    this.socket.on("peerOpened", (ids: { peer: string; call: string }) => {
      this.socket.join(ids.call);
      this.socket.to(ids.call).emit("user-joined", ids.peer);
    });
  }

  async sendMessage(data: unknown) {
    try {
      const { roomId, text } = wss.message.send.parse(data);
      const userId = this.user.id;

      console.log(
        `New message from ${this.user.name.en} (${roomId}): ${text}`.yellow
      );

      const members = await rooms.findRoomMembers([roomId]);
      if (!members) throw Error("Room not found");

      const member = members.map((member) => member.id).includes(userId);
      if (!member) throw new Error("Unauthorized");

      const message = await messages.create({ userId, roomId, text });

      this.socket.broadcast
        .to(roomId.toString())
        .emit(Events.Server.RoomMessage, message);
    } catch (error) {
      console.log(error);
    }
  }

  async markMessageAsRead(data: unknown) {
    try {
      const messageId = wss.message.markMessageAsRead.parse(data).id;
      const message = await messages.findById(messageId);
      if (!message) throw new Error("Message not found");

      const userId = this.user.id;
      if (userId !== message.userId) throw new Error("Unauthorized");
      if (message.read)
        return console.log("Message is already marked as read".yellow);

      await messages.markAsRead(messageId);

      this.socket.broadcast
        .to(message.roomId.toString())
        .emit(Events.Server.MessageRead, messageId);
    } catch (error) {
      console.log(error);
    }
  }

  // async callHost(data: unknown) {
  //   try {
  //     const { offer, hostId } = schema.wss.call.callHost.parse(data);

  //     this.socket.to(hostId.toString()).emit(Events.Server.CallMade, {
  //       offer,
  //       userId: this.user.id,
  //     });
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }

  // async makeAnswer(data: {
  //   answer: RTCSessionDescriptionInit;
  //   hostId: number;
  // }) {
  //   this.socket.to(data.hostId.toString()).emit("answerMade", data);
  // }

  async setUserStatus(online: boolean) {
    await users.update(this.user.id, { online });
  }
}

export function wssHandler(socket: Socket) {
  return new WssHandler(socket);
}
