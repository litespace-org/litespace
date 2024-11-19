import { calls, messages, rooms, users } from "@litespace/models";
import { IUser } from "@litespace/types";
import { Socket } from "socket.io";
import { Wss } from "@litespace/types";
import wss from "@/validation/wss";
import zod from "zod";
import { boolean, id, string, withNamedId } from "@/validation/utils";
import { isEmpty, map } from "lodash";
import { logger } from "@litespace/sol/log";
import { safe } from "@litespace/sol/error";
import { sanitizeMessage } from "@litespace/sol/chat";
import "colors";
import {
  isAdmin,
  isGhost,
  isInterviewer,
  isStudent,
  isTutor,
  isUser,
} from "@litespace/auth";
import { background } from "@/workers";
import { PartentPortMessage, PartentPortMessageType } from "@/workers/messages";
import { cache } from "@/lib/cache";
import { getGhostCall } from "@litespace/sol/ghost";

const peerPayload = zod.object({ callId: id, peerId: string });
const updateMessagePayload = zod.object({ text: string, id });
const toggleCameraPayload = zod.object({ call: id, camera: boolean });
const toggleMicPayload = zod.object({ call: id, mic: boolean });
const registerPeerPayload = zod.object({ peer: zod.string() });
const stdout = logger("wss");

export class WssHandler {
  socket: Socket<Wss.ClientEventsMap, Wss.ServerEventsMap>;
  user: IUser.Self | IUser.Ghost;

  constructor(socket: Socket, user: IUser.Self | IUser.Ghost) {
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
    this.socket.on(Wss.ClientEvent.RegisterPeer, this.registerPeer.bind(this));
    this.socket.on(Wss.ClientEvent.Disconnect, this.disconnect.bind(this));
    this.socket.on(Wss.ClientEvent.ToggleCamera, this.toggleCamera.bind(this));
    this.socket.on(Wss.ClientEvent.ToggleMic, this.toggleMic.bind(this));
  }

  async joinRooms() {
    const error = await safe(async () => {
      if (isGhost(this.user)) return;
      const { list } = await rooms.findMemberRooms({ userId: this.user.id });
      const ids = list.map((room) => room.toString());
      this.socket.join(ids);
      // private channel
      this.socket.join(this.user.id.toString());

      if (isStudent(this.user)) this.socket.join(Wss.Room.TutorsCache);
      if (isAdmin(this.user)) this.socket.join(Wss.Room.ServerStats);
    });

    if (error instanceof Error) stdout.error(error.message);
  }

  /**
   * @deprecated should be removed in favor of the new arch.
   */
  async peerOpened(ids: unknown) {
    const error = await safe(async () => {
      const { callId, peerId } = peerPayload.parse(ids);

      console.log({
        call: callId,
        peer: peerId,
        user: isUser(this.user) ? this.user.email : this.user,
      });

      const members = await calls.findCallMembers([callId]);
      if (isEmpty(members)) return;

      const memberIds = members.map((member) => member.userId);
      const isMember = isUser(this.user) && memberIds.includes(this.user.id);
      const allowed = isMember || isGhost(this.user);
      if (!allowed) return;

      this.socket.join(callId.toString());
      this.socket
        .to(callId.toString())
        .emit(Wss.ServerEvent.UserJoinedCall, { peerId });
    });
    if (error instanceof Error) stdout.error(error.message);
  }

  async registerPeer(data: unknown) {
    const result = await safe(async () => {
      const { peer } = registerPeerPayload.parse(data);
      const id = isGhost(this.user) ? this.user : this.user.email;
      stdout.info(`Register peer: ${peer} for ${id}`);
      if (isGhost(this.user))
        await cache.peer.setGhostPeerId(getGhostCall(this.user), peer);
      if (isTutor(this.user))
        await cache.peer.setUserPeerId(this.user.id, peer);

      // notify peers to refetch the peer id if needed
    });
    if (result instanceof Error) stdout.error(result.message);
  }

  async sendMessage(data: unknown) {
    const error = safe(async () => {
      if (isGhost(this.user)) return;
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
      if (isGhost(this.user)) return;
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
      if (isGhost(this.user)) return;
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
      if (isGhost(this.user)) return;
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
      if (isGhost(this.user)) return;
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
      if (isGhost(this.user)) return;
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
      if (isAdmin(this.user)) this.emitServerStats();
    });
    if (error instanceof Error) stdout.error(error.message);
  }

  async disconnect() {
    const error = safe(async () => {
      await this.offline();
      await this.deregisterPeer();
    });
    if (error instanceof Error) stdout.error(error.message);
  }

  async online() {
    if (isGhost(this.user)) return;
    const user = await users.update(this.user.id, { online: true });
    this.announceStatus(user);
  }

  async offline() {
    if (isGhost(this.user)) return;
    const user = await users.update(this.user.id, { online: false });
    this.announceStatus(user);
  }

  async emitServerStats() {
    background.on("message", (message: PartentPortMessage) => {
      if (message.type === PartentPortMessageType.Stats)
        return this.socket.emit(Wss.ServerEvent.ServerStats, message.stats);
    });
  }

  /**
   * Remove ghost and tutor peer id from the cache.
   *
   * @note should be called when the socket disconnects from the server.
   */
  async deregisterPeer() {
    // todo: notify peers that the current user got disconnected
    const display = isGhost(this.user) ? this.user : this.user.email;
    stdout.info(`Deregister peer for: ${display}`);

    if (isGhost(this.user))
      return await cache.peer.removeGhostPeerId(getGhostCall(this.user));
    if (isTutor(this.user)) await cache.peer.removeUserPeerId(this.user.id);
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
