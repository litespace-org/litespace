import { isGhost, isUser } from "@litespace/auth";
import { logger, safe, sanitizeMessage } from "@litespace/sol";
import { Wss } from "@litespace/types";
import { WssHandler } from "@/wss/handlers/base";
import { messages, rooms } from "@litespace/models";
import { asChatRoomId } from "@/wss/utils";
import { id, string, withNamedId } from "@/validation/utils";
import wss from "@/validation/wss";
import zod from "zod";
import { isEmpty } from "lodash";
import ResponseError, { bad, forbidden, notfound } from "@/lib/error";

const stdout = logger("wss");

const updateMessagePayload = zod.object({ text: string, id });
const userTypingPayload = zod.object({ roomId: zod.number() });

export class Messages extends WssHandler {
  public init(): Messages {
    this.socket.on(Wss.ClientEvent.SendMessage, this.sendMessage.bind(this));
    this.socket.on(
      Wss.ClientEvent.UpdateMessage,
      this.updateMessage.bind(this)
    );
    this.socket.on(
      Wss.ClientEvent.DeleteMessage,
      this.deleteMessage.bind(this)
    );
    this.socket.on(Wss.ClientEvent.UserTyping, this.onUserTyping.bind(this));
    this.socket.on(Wss.ClientEvent.MarkAsRead, this.markAsRead.bind(this));
    return this;
  }

  async sendMessage(data: unknown) {
    const error = await safe(async () => {
      const user = this.user;
      if (isGhost(user) || !isUser(user)) return;

      const { roomId, text } = wss.message.send.parse(data);
      if (!roomId || !text) throw bad();

      const room = await rooms.findById(roomId);
      if (!room) throw notfound.base();

      const userId = user.id;
      stdout.log(`u:${userId} is sending a message to r:${roomId}`);

      const members = await rooms.findRoomMembers({ roomIds: [roomId] });
      const member = members.map((member) => member.id).includes(userId);
      if (!member) throw forbidden();

      const sanitized = sanitizeMessage(text);
      if (!sanitized) return; // empty message
      const message = await messages.create({
        text: sanitized,
        userId,
        roomId,
      });

      this.broadcast(
        Wss.ServerEvent.RoomMessage,
        asChatRoomId(roomId),
        message
      );
    });
    if (error instanceof ResponseError)
      this.socket.emit(Wss.ServerEvent.RoomMessageReverted, { 
        code: error.statusCode, 
        message: error.message
      });
    else if (error instanceof Error)
      stdout.error(error.message);
  }

  async updateMessage(data: unknown) {
    const error = await safe(async () => {
      const user = this.user;
      if (isGhost(user) || !isUser(user)) return;

      const { id, text } = updateMessagePayload.parse(data);
      const message = await messages.findById(id);
      if (!message || message.deleted) throw notfound.base();

      const owner = message.userId === user.id;
      if (!owner) throw forbidden();

      const sanitized = sanitizeMessage(text);
      if (!sanitized) throw bad();

      const updated = await messages.update(id, { text: sanitized });
      if (!updated) throw new Error("Mesasge not update; should never happen.");

      this.broadcast(
        Wss.ServerEvent.RoomMessageUpdated,
        asChatRoomId(message.roomId),
        updated
      );
    });
    if (error instanceof ResponseError)
      this.socket.emit(Wss.ServerEvent.RoomMessageReverted, { 
        code: error.statusCode, 
        message: error.message
      });
    else if (error instanceof Error)
      stdout.error(error.message);
  }

  async deleteMessage(data: unknown) {
    const error = await safe(async () => {
      const user = this.user;
      if (isGhost(user) || !isUser(user)) return;

      const { id }: { id: number } = withNamedId("id").parse(data);

      const message = await messages.findById(id);
      if (!message || message.deleted) throw notfound.base();

      const owner = message.userId === user.id;
      if (!owner) throw forbidden();

      await messages.markAsDeleted(id);

      this.broadcast(
        Wss.ServerEvent.RoomMessageDeleted,
        asChatRoomId(message.roomId),
        {
          roomId: message.roomId,
          messageId: message.id,
        }
      );
    });
    if (error instanceof ResponseError)
      this.socket.emit(Wss.ServerEvent.RoomMessageReverted, { 
        code: error.statusCode, 
        message: error.message
      });
    else if (error instanceof Error)
      stdout.error(error.message);
  }

  async onUserTyping(data: unknown) {
    const error = await safe(async () => {
      const { roomId } = userTypingPayload.parse(data);

      const user = this.user;
      if (isGhost(user)) return;

      const members = await rooms.findRoomMembers({ roomIds: [roomId] });
      if (isEmpty(members)) return;

      const isMember = members.find((member) => member.id === user.id);
      if (!isMember) throw forbidden();

      this.socket.to(roomId.toString()).emit(Wss.ServerEvent.UserTyping, {
        roomId,
        userId: user.id,
      });
    });

    if (error instanceof Error) stdout.error(error.message);
  }

  async markAsRead(data: unknown) {
    const error = await safe(async () => {
      const { id }: { id: number } = withNamedId("id").parse(data);

      const user = this.user;
      if (isGhost(user) || !isUser(user)) return;

      const message = await messages.findById(id);
      if (!message || message.deleted) throw notfound.base();

      const members = await rooms.findRoomMembers({ roomIds: [message.roomId] });
      const isMember = members.find((member) => member.id === user.id);
      if (!isMember) throw forbidden();

      await messages.markAsRead(id);
    });
    if (error instanceof ResponseError)
      this.socket.emit(Wss.ServerEvent.RoomMessageReverted, { 
        code: error.statusCode, 
        message: error.message
      });
    else if (error instanceof Error)
      stdout.error(error.message);
  }
}
