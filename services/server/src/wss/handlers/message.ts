import { isGhost } from "@litespace/auth";
import { logger, safe } from "@litespace/sol";
import { Wss } from "@litespace/types";
import { WssHandler } from "@/wss/handlers/base";
import { messages, rooms } from "@litespace/models";
import { asChatRoomId } from "@/wss/utils";
import { id, string } from "@/validation/utils";
import zod from "zod";
import { isEmpty } from "lodash";
import { revertReasons } from "@/constants";

const stdout = logger("wss");

const sendMessagePayload = zod.object({
  roomId: id,
  ref: id,
  text: zod.string(),
});
const updateMessagePayload = zod.object({ text: string, id });
const userTypingPayload = zod.object({ roomId: zod.number() });
const deleteMessagePayload = zod.object({ id });
const markMessageAsReadPayload = zod.object({ id });

export class Messages extends WssHandler {
  public init(): Messages {
    this.socket.on(Wss.ClientEvent.SendMessage, this.onSendMessage.bind(this));
    this.socket.on(
      Wss.ClientEvent.UpdateMessage,
      this.onUpdateMessage.bind(this)
    );
    this.socket.on(
      Wss.ClientEvent.DeleteMessage,
      this.onDeleteMessage.bind(this)
    );
    this.socket.on(Wss.ClientEvent.UserTyping, this.onUserTyping.bind(this));
    this.socket.on(
      Wss.ClientEvent.MarkMessageAsRead,
      this.onMarkMessageAsRead.bind(this)
    );
    return this;
  }

  async onSendMessage(data: unknown) {
    const error = await safe(async () => {
      const user = this.user;
      if (isGhost(user)) return;

      const { roomId, ref, text } = sendMessagePayload.parse(data);

      const revert = (reason: string) =>
        this.revert({ type: "send-message", ref, reason });

      // todo: set a max message length
      if (!text) return revert(revertReasons.emptyText);

      const room = await rooms.findById(roomId);
      if (!room) return revert(revertReasons.notfound.room);

      const userId = user.id;
      stdout.log(`u:${userId} is sending a message to r:${roomId}`);

      const members = await rooms.findRoomMembers({ roomIds: [roomId] });
      const member = members.map((member) => member.id).includes(userId);
      if (!member) return revert(revertReasons.notMember);

      const message = await messages.create({
        text,
        userId,
        roomId,
      });

      this.broadcast(
        Wss.ServerEvent.RoomMessage,
        asChatRoomId(roomId),
        message
      );
    });

    if (error instanceof Error) stdout.log(error.message);
  }

  async onUpdateMessage(data: unknown) {
    const error = await safe(async () => {
      const user = this.user;
      if (isGhost(user)) return;

      const { id, text } = updateMessagePayload.parse(data);

      const revert = (reason: string) =>
        this.revert({ type: "update-message", id, reason });

      const message = await messages.findById(id);
      if (!message || message.deleted) return revert(revertReasons.notfound.message);

      const owner = message.userId === user.id;
      if (!owner) return revert(revertReasons.notOwner);
      if (!text) return revert(revertReasons.emptyText);

      const updated = await messages.update(id, { text });
      if (!updated) return revert(revertReasons.unreachable);

      this.broadcast(
        Wss.ServerEvent.RoomMessageUpdated,
        asChatRoomId(message.roomId),
        updated
      );
    });
    if (error instanceof Error) stdout.error(error.message);
  }

  async onDeleteMessage(data: unknown) {
    const error = await safe(async () => {
      const user = this.user;
      if (isGhost(user)) return;

      const { id } = deleteMessagePayload.parse(data);

      const revert = (reason: string) =>
        this.revert({ type: "delete-message", id, reason });

      const message = await messages.findById(id);
      if (!message || message.deleted) return revert(revertReasons.notfound.message);

      const owner = message.userId === user.id;
      if (!owner) return revert(revertReasons.notOwner);

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
    if (error instanceof Error) stdout.error(error.message);
  }

  async onUserTyping(data: unknown) {
    const error = await safe(async () => {
      const { roomId } = userTypingPayload.parse(data);

      const revert = (reason: string) =>
        this.revert({ type: "user-typing", roomId, reason });

      const user = this.user;
      if (isGhost(user)) return;

      const members = await rooms.findRoomMembers({ roomIds: [roomId] });
      if (isEmpty(members)) return;

      const isMember = members.find((member) => member.id === user.id);
      if (!isMember) return revert(revertReasons.notMember);

      this.socket.to(asChatRoomId(roomId)).emit(Wss.ServerEvent.UserTyping, {
        roomId,
        userId: user.id,
      });
    });

    if (error instanceof Error) stdout.error(error.message);
  }

  async onMarkMessageAsRead(data: unknown) {
    const error = await safe(async () => {
      const user = this.user;
      if (isGhost(user)) return;

      const { id } = markMessageAsReadPayload.parse(data);

      const revert = (reason: string) =>
        this.revert({ type: "mark-msg-as-read", id, reason });

      const message = await messages.findById(id);
      if (!message || message.deleted) return revert(revertReasons.notfound.message);

      const members = await rooms.findRoomMembers({
        roomIds: [message.roomId],
      });
      const isMember = members.find((member) => member.id === user.id);
      if (!isMember) return revert(revertReasons.notMember);

      if (user.id === message.userId)
        return revert(revertReasons.unallowed);

      await messages.markAsRead(id);

      this.broadcast(
        Wss.ServerEvent.RoomMessageRead,
        asChatRoomId(message.roomId),
        { userId: user.id }
      )
    });
    if (error instanceof Error) stdout.error(error.message);
  }
}
