import { isGhost } from "@litespace/auth";
import { logger, safe, sanitizeMessage } from "@litespace/sol";
import { Wss } from "@litespace/types";
import { WSSHandler } from "@/wss/handlers/base";
import { messages, rooms } from "@litespace/models";
import { asChatRoomId } from "@/wss/utils";
import wss from "@/validation/wss";

import zod from "zod";
import { id, string, withNamedId } from "@/validation/utils";

const stdout = logger("wss");

const updateMessagePayload = zod.object({ text: string, id });

export class MessageHandler extends WSSHandler {
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
        asChatRoomId(roomId),
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
        asChatRoomId(message.roomId),
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
        asChatRoomId(message.roomId),
        {
          roomId: message.roomId,
          messageId: message.id,
        }
      );
    });
    if (error instanceof Error) stdout.error(error.message);
  }
}
