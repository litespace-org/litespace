import { calls, messages, rooms, users } from "@litespace/models";
import { IUser } from "@litespace/types";
import { Socket } from "socket.io";
import { Wss } from "@litespace/types";
import wss from "@/validation/wss";
import zod from "zod";
import { boolean, id, string, withNamedId } from "@/validation/utils";
import { isEmpty, map } from "lodash";
import { logger, safe, sanitizeMessage } from "@litespace/sol";
import "colors";

const peerPayload = zod.object({ callId: id, peerId: string });
const updateMessagePayload = zod.object({ text: string, id });
const toggleCameraPayload = zod.object({ call: id, camera: boolean });
const toggleMicPayload = zod.object({ call: id, mic: boolean });
const stdout = logger("wss");

export class WssHandler {
  socket: Socket<Wss.ClientEventsMap, Wss.ServerEventsMap>;
  user: IUser.Self;

  constructor(socket: Socket, user: IUser.Self) {
    this.socket = socket;
    this.user = user;
    this.initialize();
  }

  async initialize() {
    this.connect();
    this.socket.on(Wss.ClientEvent.SendMessage, this.sendMessage.bind(this));
    this.socket.on(
      Wss.ClientEvent.UpdateMessage,
      this.updateMessage.bind(this)
    );
    this.socket.on(
      Wss.ClientEvent.DeleteMessage,
      this.deleteMessage.bind(this)
    );
    this.socket.on(Wss.ClientEvent.PeerOpened, this.peerOpened.bind(this));
    this.socket.on(Wss.ClientEvent.Disconnect, this.disconnect.bind(this));
    this.socket.on(Wss.ClientEvent.ToggleCamera, this.toggleCamera.bind(this));
    this.socket.on(Wss.ClientEvent.ToggleMic, this.toggleMic.bind(this));
  }

  async joinRooms() {
    const error = await safe(async () => {
      const { list } = await rooms.findMemberRooms({ userId: this.user.id });
      const ids = list.map((room) => room.toString());
      this.socket.join(ids);
      // private channel
      this.socket.join(this.user.id.toString());

      const student = this.user.role === IUser.Role.Student;
      if (student) this.socket.join(Wss.Room.TutorsCache);
    });

    if (error instanceof Error) stdout.error(error.message);
  }

  async peerOpened(ids: unknown) {
    const error = await safe(async () => {
      const { callId, peerId } = peerPayload.parse(ids);

      const members = await calls.findCallMembers([callId]);
      if (isEmpty(members)) return;

      const isMember = map(members, "userId").includes(this.user.id);
      if (!isMember) return;

      this.socket.join(callId.toString());
      this.socket
        .to(callId.toString())
        .emit(Wss.ServerEvent.UserJoinedCall, { peerId });
    });
    if (error instanceof Error) stdout.error(error.message);
  }

  async sendMessage(data: unknown) {
    const error = safe(async () => {
      const { roomId, text } = wss.message.send.parse(data);
      const userId = this.user.id;

      console.log(`u:${userId} is send a message to r:${roomId}`);

      const members = await rooms.findRoomMembers({ roomIds: [roomId] });
      if (!members) throw Error("Room not found");

      const member = members.map((member) => member.id).includes(userId);
      if (!member) throw new Error("Unauthorized");

      const sanitized = sanitizeMessage(text);
      if (!sanitized) return; // empty message
      const message = await messages.create({
        text: sanitized,
        userId,
        roomId,
      });

      this.boradcast(Wss.ServerEvent.RoomMessage, roomId.toString(), message);
    });

    if (error instanceof Error) stdout.error(error);
  }

  async updateMessage(data: unknown) {
    const error = await safe(async () => {
      const { id, text } = updateMessagePayload.parse(data);
      const message = await messages.findById(id);
      if (!message || message.deleted) throw new Error("Message not found");

      const owner = message.userId === this.user.id;
      if (!owner) throw new Error("Forbidden");

      const sanitized = sanitizeMessage(text);
      if (!sanitized) throw new Error("Invalid message");

      const updated = await messages.update(id, { text: sanitized });
      if (!updated) throw new Error("Mesasge not update; should never happen.");

      this.boradcast(
        Wss.ServerEvent.RoomMessageUpdated,
        message.roomId.toString(),
        updated
      );
    });

    if (error instanceof Error) stdout.error(error.message);
  }

  async deleteMessage(data: unknown) {
    const error = safe(async () => {
      const { id }: { id: number } = withNamedId("id").parse(data);

      const message = await messages.findById(id);
      if (!message || message.deleted) throw new Error("Message not found");

      const owner = message.userId === this.user.id;
      if (!owner) throw new Error("Forbidden");

      await messages.markAsDeleted(id);

      this.boradcast(
        Wss.ServerEvent.RoomMessageDeleted,
        message.roomId.toString(),
        {
          roomId: message.roomId,
          messageId: message.id,
        }
      );
    });

    if (error instanceof Error) stdout.error(error.message);
  }

  async toggleCamera(data: unknown) {
    const error = safe(async () => {
      const { call, camera } = toggleCameraPayload.parse(data);
      // todo: add validation
      this.boradcast(Wss.ServerEvent.CameraToggled, call.toString(), {
        user: this.user.id,
        camera,
      });
    });

    if (error instanceof Error) stdout.error(error.message);
  }

  async toggleMic(data: unknown) {
    const error = safe(async () => {
      const { call, mic } = toggleMicPayload.parse(data);
      // todo: add validation
      this.boradcast(Wss.ServerEvent.MicToggled, call.toString(), {
        user: this.user.id,
        mic,
      });
    });

    if (error instanceof Error) stdout.error(error.message);
  }

  async boradcast<T extends keyof Wss.ServerEventsMap>(
    event: T,
    room: string,
    ...data: Parameters<Wss.ServerEventsMap[T]>
  ) {
    this.socket.emit(event, ...data);
    this.socket.broadcast.to(room).emit(event, ...data);
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
        .emit(Wss.ServerEvent.MessageRead, { messageId });
    } catch (error) {
      console.log(error);
    }
  }

  async connect() {
    const error = safe(async () => {
      await this.online();
      await this.joinRooms();
    });
    if (error instanceof Error) stdout.error(error.message);
  }

  async disconnect() {
    const error = safe(async () => {
      await this.offline();
    });
    if (error instanceof Error) stdout.error(error.message);
  }

  async online() {
    const user = await users.update(this.user.id, { online: true });
    this.announceStatus(user);
  }

  async offline() {
    const user = await users.update(this.user.id, { online: false });
    this.announceStatus(user);
  }

  async announceStatus(user: IUser.Self) {
    const userRooms = await rooms.findMemberFullRoomIds(user.id);

    for (const room of userRooms) {
      this.boradcast(Wss.ServerEvent.UserStatusChanged, room.toString(), {
        online: user.online,
      });
    }
  }
}

export function wssHandler(socket: Socket) {
  const user = socket.request.user;
  if (!user) return;
  return new WssHandler(socket, user);
}
