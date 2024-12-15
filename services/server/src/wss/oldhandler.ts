import { calls, messages, rooms, users } from "@litespace/models";
import { ICall, IUser, Wss } from "@litespace/types";
import { Socket } from "socket.io";
import wss from "@/validation/wss";
import zod from "zod";
import { boolean, id, string, withNamedId } from "@/validation/utils";
import { isEmpty } from "lodash";
import { logger } from "@litespace/sol/log";
import { safe } from "@litespace/sol/error";
import { sanitizeMessage } from "@litespace/sol/chat";
import "colors";
import { isAdmin, isGhost, isStudent, isTutor, isUser } from "@litespace/auth";
import { background } from "@/workers";
import { PartentPortMessage, PartentPortMessageType } from "@/workers/messages";
import { cache } from "@/lib/cache";
import { getGhostCall } from "@litespace/sol/ghost";
import { canJoinCall } from "@/lib/call";
import dayjs from "@/lib/dayjs";

const peerPayload = zod.object({ callId: id, peerId: string });
const updateMessagePayload = zod.object({ text: string, id });
const toggleCameraPayload = zod.object({ call: id, camera: boolean });
const toggleMicPayload = zod.object({ call: id, mic: boolean });
const registerPeerPayload = zod.object({ peer: zod.string() });
const userTypingPayload = zod.object({
  roomId: zod.number(),
});

const callTypes = ["lesson", "interview"] as const satisfies ICall.Type[];
const onJoinCallPayload = zod.object({
  callId: zod.number(),
  type: zod.enum(callTypes),
});
const onLeaveCallPayload = zod.object({ callId: zod.number() });

const stdout = logger("wss");

/**
 * @deprecated
 */
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
    this.socket.on(Wss.ClientEvent.UpdateMessage, this.updateMessage.bind(this));
    this.socket.on(Wss.ClientEvent.DeleteMessage, this.deleteMessage.bind(this));

    this.socket.on(Wss.ClientEvent.PeerOpened, this.peerOpened.bind(this));
    this.socket.on(Wss.ClientEvent.RegisterPeer, this.registerPeer.bind(this));

    this.socket.on(Wss.ClientEvent.Disconnect, this.disconnect.bind(this));
    this.socket.on(Wss.ClientEvent.ToggleCamera, this.toggleCamera.bind(this));
    this.socket.on(Wss.ClientEvent.ToggleMic, this.toggleMic.bind(this));
    this.socket.on(Wss.ClientEvent.UserTyping, this.userTyping.bind(this));
    this.socket.on(Wss.ClientEvent.JoinCall, this.onJoinCall.bind(this));
    this.socket.on(Wss.ClientEvent.LeaveCall, this.onLeaveCall.bind(this));
  }

  /*
   *  This event listener will be called whenever a user
   *  joins a call. For instance, when
   *  users are joining a lesson, or a tutor is joining an
   *  interview.
   */
  async onJoinCall(data: unknown) {
    const result = await safe(async () => {
      const { callId, type } = onJoinCallPayload.parse(data);

      const user = this.user;
      // todo: add ghost as a member of the call
      if (isGhost(user)) return stdout.warning("Unsupported");

      stdout.info(`User ${user.id} is joining call ${callId}.`);

      const canJoin = await canJoinCall({
        userId: user.id,
        callType: type,
        callId,
      });

      if (!canJoin) throw Error("Forbidden");

      // add user to the call by inserting row to call_members relation
      await cache.call.addMember({ userId: user.id, callId: callId });
      this.socket.join(this.asCallRoomId(callId));

      stdout.info(`User ${user.id} has joined call ${callId}.`);

      // TODO: retrieve user data (ICall.PopulatedMember) from the database
      // discuss with the team if shall we retrieve it from postgres,
      // or store it in redis in the first place.

      // notify members that a new member has joined the call
      // NOTE: the user notifies himself as well that he successfully joined the call.
      this.broadcast(
        Wss.ServerEvent.MemberJoinedCall,
        this.asCallRoomId(callId),
        { userId: user.id } // TODO: define the payload struct type in the types package
      );
    });
    if (result instanceof Error) stdout.error(result.message);
  }

  /*
   *  This event listener will be called whenever a user
   *  leaves a call. For instance, when users are leaving
   *  a lesson, or a tutor is leaving an interview.
   */
  async onLeaveCall(data: unknown) {
    const result = await safe(async () => {
      const { callId } = onLeaveCallPayload.parse(data);

      const user = this.user;
      if (isGhost(user)) return;

      stdout.info(`User ${user.id} is leaving call ${callId}.`);

      // remove user from the call by deleting the corresponding row from call_members relation
      await cache.call.removeMember({
        userId: user.id,
        callId: callId,
      });

      stdout.info(`User ${user.id} has left call ${callId}.`);

      // notify members that a member has left the call
      this.socket.broadcast
        .to(this.asCallRoomId(callId))
        .emit(Wss.ServerEvent.MemberLeftCall, {
          userId: user.id,
        });
    });
    if (result instanceof Error) stdout.error(result.message);
  }

  async joinRooms() {
    const error = await safe(async () => {
      const user = this.user;
      if (isGhost(user)) return;

      const { list } = await rooms.findMemberRooms({ userId: user.id });

      this.socket.join(list.map((roomId) => this.asChatRoomId(roomId)));
      // private channel
      this.socket.join(user.id.toString());

      if (isStudent(this.user)) this.socket.join(Wss.Room.TutorsCache);
      if (isAdmin(this.user)) this.socket.join(Wss.Room.ServerStats);

      // todo: get user calls from cache
      const callsList = await calls.find({
        users: [user.id],
        full: true,
        after: dayjs.utc().startOf("day").toISOString(),
        before: dayjs.utc().add(1, "day").toISOString(),
      });

      this.socket.join(
        callsList.list.map((call) => this.asCallRoomId(call.id))
      );
    });

    if (error instanceof Error) stdout.error(error.message);
  }

  /**
   * @deprecated should be removed in favor of the new arch.
   */
  async peerOpened(ids: unknown) {
    const error = await safe(async () => {
      const { callId, peerId } = peerPayload.parse(ids);
      const user = this.user;

      const members = await calls.findCallMembers([callId]);
      if (isEmpty(members)) return;

      const memberIds = members.map((member) => member.userId);
      const isMember = isUser(user) && memberIds.includes(user.id);
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
      const user = this.user;
      const id = isGhost(user) ? user : user.email;
      stdout.info(`Register peer: ${peer} for ${id}`);

      if (isGhost(user))
        await cache.peer.setGhostPeerId(getGhostCall(user), peer);
      if (isTutor(user)) await cache.peer.setUserPeerId(user.id, peer);

      // notify peers to refetch the peer id if needed
    });
    if (result instanceof Error) stdout.error(result.message);
  }

  async userTyping(data: unknown) {
    const error = safe(async () => {
      const { roomId } = userTypingPayload.parse(data);

      const user = this.user;
      if (isGhost(user)) return;

      const members = await rooms.findRoomMembers({ roomIds: [roomId] });
      if (isEmpty(members)) return;

      const isMember = members.find((member) => member.id === user.id);
      if (!isMember)
        throw new Error(`User(${user.id}) isn't member of room Id: ${roomId}`);

      this.socket.to(roomId.toString()).emit(Wss.ServerEvent.UserTyping, {
        roomId,
        userId: user.id,
      });
    });

    if (error instanceof Error) stdout.error(error.message);
  }

  async sendMessage(data: unknown) {
    const error = safe(async () => {
      const user = this.user;
      if (isGhost(user)) return;

      const { roomId, text } = wss.message.send.parse(data);
      const userId = user.id;

      stdout.log(`u:${userId} is send a message to r:${roomId}`);

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

      this.broadcast(
        Wss.ServerEvent.RoomMessage,
        this.asChatRoomId(roomId),
        message
      );
    });

    if (error instanceof Error) stdout.error(error);
  }

  async updateMessage(data: unknown) {
    const error = await safe(async () => {
      const user = this.user;
      if (isGhost(user)) return;

      const { id, text } = updateMessagePayload.parse(data);
      const message = await messages.findById(id);
      if (!message || message.deleted) throw new Error("Message not found");

      const owner = message.userId === user.id;
      if (!owner) throw new Error("Forbidden");

      const sanitized = sanitizeMessage(text);
      if (!sanitized) throw new Error("Invalid message");

      const updated = await messages.update(id, { text: sanitized });
      if (!updated) throw new Error("Mesasge not update; should never happen.");

      this.broadcast(
        Wss.ServerEvent.RoomMessageUpdated,
        this.asChatRoomId(message.roomId),
        updated
      );
    });

    if (error instanceof Error) stdout.error(error.message);
  }

  async deleteMessage(data: unknown) {
    const error = safe(async () => {
      const user = this.user;
      if (isGhost(user)) return;

      const { id }: { id: number } = withNamedId("id").parse(data);

      const message = await messages.findById(id);
      if (!message || message.deleted) throw new Error("Message not found");

      const owner = message.userId === user.id;
      if (!owner) throw new Error("Forbidden");

      await messages.markAsDeleted(id);

      this.broadcast(
        Wss.ServerEvent.RoomMessageDeleted,
        this.asChatRoomId(message.roomId),
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
      const user = this.user;
      if (isGhost(user)) return;
      const { call, camera } = toggleCameraPayload.parse(data);
      // todo: add validation
      this.broadcast(Wss.ServerEvent.CameraToggled, call.toString(), {
        user: user.id,
        camera,
      });
    });

    if (error instanceof Error) stdout.error(error.message);
  }

  async toggleMic(data: unknown) {
    const error = safe(async () => {
      const user = this.user;
      if (isGhost(user)) return;
      const { call, mic } = toggleMicPayload.parse(data);
      // todo: add validation
      this.broadcast(Wss.ServerEvent.MicToggled, call.toString(), {
        user: user.id,
        mic,
      });
    });

    if (error instanceof Error) stdout.error(error.message);
  }

  async broadcast<T extends keyof Wss.ServerEventsMap>(
    event: T,
    room: string,
    ...data: Parameters<Wss.ServerEventsMap[T]>
  ) {
    this.socket.emit(event, ...data);
    this.socket.broadcast.to(room).emit(event, ...data);
  }

  async markMessageAsRead(data: unknown) {
    try {
      const user = this.user;
      if (isGhost(user)) return;

      const messageId = wss.message.markMessageAsRead.parse(data).id;
      const message = await messages.findById(messageId);
      if (!message) throw new Error("Message not found");

      const userId = user.id;
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
      await this.removeUserFromCalls();
    });
    if (error instanceof Error) stdout.error(error.message);
  }

  async online() {
    const user = this.user;
    if (isGhost(user)) return;
    const info = await users.update(user.id, { online: true });
    this.announceStatus(info);
  }

  async offline() {
    const user = this.user;
    if (isGhost(user)) return;
    const info = await users.update(user.id, { online: false });
    this.announceStatus(info);
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
    const user = this.user;
    const display = isGhost(user) ? user : user.email;
    stdout.info(`Deregister peer for: ${display}`);

    if (isGhost(user))
      return await cache.peer.removeGhostPeerId(getGhostCall(user));
    if (isTutor(user)) await cache.peer.removeUserPeerId(user.id);
  }

  async removeUserFromCalls() {
    const user = this.user;
    if (isGhost(user)) return;

    const callId = await cache.call.removeMemberByUserId(user.id);
    if (!callId) return;

    // notify members that a member has left the call
    this.socket.broadcast
      .to(this.asCallRoomId(callId))
      .emit(Wss.ServerEvent.MemberLeftCall, {
        userId: user.id,
      });
  }

  async announceStatus(user: IUser.Self) {
    const userRooms = await rooms.findMemberFullRoomIds(user.id);

    for (const room of userRooms) {
      this.broadcast(Wss.ServerEvent.UserStatusChanged, room.toString(), {
        online: user.online,
      });
    }
  }

  asCallRoomId(callId: number) {
    return `call:${callId}`;
  }

  asChatRoomId(roomId: number) {
    return `room:${roomId}`;
  }
}

export function wssHandler(socket: Socket) {
  const user = socket.request.user;
  if (!user) {
    stdout.warning(
      "(function) wssHandler: No user has been found in the request obj!"
    );
    return;
  }
  return new WssHandler(socket, user);
}

