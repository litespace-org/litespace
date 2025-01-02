import { isGhost } from "@litespace/auth";
import { logger, safe } from "@litespace/sol";
import { Wss } from "@litespace/types";
import { WssHandler } from "@/wss/handlers/base";
import { messages, rooms } from "@litespace/models";
import { asChatRoomId } from "@/wss/utils";
import { id, string } from "@/validation/utils";
import zod from "zod";
import { isEmpty } from "lodash";

const stdout = logger("wss");

const sendMessagePayload = zod.object({
  roomId: id,
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

  async onSendMessage(data: unknown, callback?: Wss.AcknowledgeCallback) {
    const error = await safe(async () => {
      const user = this.user;
      if (isGhost(user)) return;

      const { roomId, text } = sendMessagePayload.parse(data);

      // todo: set a max message length
      if (!text)
        return this.call(callback, {
          code: Wss.AcknowledgeCode.EmptyText,
          message: "Cannot send an empty message.",
        });

      const room = await rooms.findById(roomId);
      if (!room)
        return this.call(callback, {
          code: Wss.AcknowledgeCode.RoomNotFound,
          message: "Cannot find the room in the database.",
        });

      const userId = user.id;
      stdout.log(`u:${userId} is sending a message to r:${roomId}`);

      const members = await rooms.findRoomMembers({ roomIds: [roomId] });
      const member = members.map((member) => member.id).includes(userId);
      if (!member)
        return this.call(callback, {
          code: Wss.AcknowledgeCode.NotMember,
          message: "The user is not a member of the room!",
        });

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

  async onUpdateMessage(data: unknown, callback?: Wss.AcknowledgeCallback) {
    const error = await safe(async () => {
      const user = this.user;
      if (isGhost(user)) return;

      const { id, text } = updateMessagePayload.parse(data);

      const message = await messages.findById(id);
      if (!message || message.deleted)
        return this.call(callback, {
          code: Wss.AcknowledgeCode.MessageNotFound,
          message: "Cannot find the message in the database.",
        });

      const owner = message.userId === user.id;
      if (!owner)
        return this.call(callback, {
          code: Wss.AcknowledgeCode.NotOwner,
          message:
            "The user is not the sender/owner of the message to be updated.",
        });
      if (!text)
        return this.call(callback, {
          code: Wss.AcknowledgeCode.EmptyText,
          message: "Cannot send an empty message.",
        });

      const updated = await messages.update(id, { text });
      if (!updated)
        return this.call(callback, {
          code: Wss.AcknowledgeCode.Unreachable,
          message:
            "Something went wrong! This needs to be debugged in the backend.",
        });

      this.broadcast(
        Wss.ServerEvent.RoomMessageUpdated,
        asChatRoomId(message.roomId),
        updated,
        () => {}
      );
    });
    if (error instanceof Error) stdout.error(error.message);
  }

  async onDeleteMessage(data: unknown, callback?: Wss.AcknowledgeCallback) {
    const error = await safe(async () => {
      const user = this.user;
      if (isGhost(user)) return;

      const { id } = deleteMessagePayload.parse(data);

      const message = await messages.findById(id);
      if (!message || message.deleted)
        return this.call(callback, {
          code: Wss.AcknowledgeCode.MessageNotFound,
          message: "Message not found; perhabs it's already deleted.",
        });

      const owner = message.userId === user.id;
      if (!owner)
        return this.call(callback, {
          code: Wss.AcknowledgeCode.NotOwner,
          message:
            "The user is not the sender/owner of the message to be deleted.",
        });

      await messages.markAsDeleted(id);

      this.broadcast(
        Wss.ServerEvent.RoomMessageDeleted,
        asChatRoomId(message.roomId),
        {
          roomId: message.roomId,
          messageId: message.id,
        },
        () => {}
      );
    });
    if (error instanceof Error) stdout.error(error.message);
  }

  async onUserTyping(data: unknown, callback?: Wss.AcknowledgeCallback) {
    const error = await safe(async () => {
      const { roomId } = userTypingPayload.parse(data);

      const user = this.user;
      if (isGhost(user)) return;

      const members = await rooms.findRoomMembers({ roomIds: [roomId] });
      if (isEmpty(members)) return;

      const isMember = members.find((member) => member.id === user.id);
      if (!isMember)
        return this.call(callback, {
          code: Wss.AcknowledgeCode.NotMember,
          message: "The user is not a member of the room!",
        });

      this.socket.to(asChatRoomId(roomId)).emit(Wss.ServerEvent.UserTyping, {
        roomId,
        userId: user.id,
      });
    });

    if (error instanceof Error) stdout.error(error.message);
  }

  async onMarkMessageAsRead(data: unknown, callback?: Wss.AcknowledgeCallback) {
    const error = await safe(async () => {
      const user = this.user;
      if (isGhost(user)) return;

      const { id } = markMessageAsReadPayload.parse(data);

      const message = await messages.findById(id);
      if (!message || message.deleted)
        return this.call(callback, {
          code: Wss.AcknowledgeCode.MessageNotFound,
          message: "Message is not found in the database. I might be deleted.",
        });

      const members = await rooms.findRoomMembers({
        roomIds: [message.roomId],
      });
      const isMember = members.find((member) => member.id === user.id);
      if (!isMember)
        return this.call(callback, {
          code: Wss.AcknowledgeCode.NotMember,
          message: "The user is not a member of the room!",
        });

      if (user.id === message.userId)
        return this.call(callback, {
          code: Wss.AcknowledgeCode.Unallowed,
          message: "The user cannot mark his own message as read.",
        });

      await messages.markAsRead(id);

      this.broadcast(
        Wss.ServerEvent.RoomMessageRead,
        asChatRoomId(message.roomId),
        { userId: user.id }
      );
    });
    if (error instanceof Error) stdout.error(error.message);
  }
}
