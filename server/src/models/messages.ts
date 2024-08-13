import { knex } from "@/models/query";
import { first } from "lodash";
import { IMessage } from "@litespace/types";

export class Messages {
  table = "messages";

  async create(payload: IMessage.CreatePayload): Promise<IMessage.Self> {
    const rows = await knex<IMessage.Row>(this.table)
      .insert({
        user_id: payload.userId,
        room_id: payload.roomId,
        body: payload.body,
      })
      .returning("*");
    const row = first(rows);
    if (!row) throw new Error("Message not found; should never happen");
    return this.from(row);
  }

  async updateBy<T extends keyof IMessage.Row>(
    id: number,
    key: T,
    value: IMessage.Row[T]
  ): Promise<void> {
    await knex<IMessage.Row>(this.table)
      .update({ [key]: value })
      .where("id", id);
  }

  async markAsRead(id: number): Promise<void> {
    return this.updateBy(id, "read", true);
  }

  async findManyBy<T extends keyof IMessage.Row>(
    key: T,
    value: IMessage.Row[T]
  ): Promise<IMessage.Self[]> {
    const rows = await knex<IMessage.Row>(this.table)
      .select("*")
      .where(key, value);

    return rows.map((row) => this.from(row));
  }

  async findRoomMessages(roomId: number): Promise<IMessage.Self[]> {
    return await this.findManyBy("room_id", roomId);
  }

  from(row: IMessage.Row): IMessage.Self {
    return {
      id: row.id,
      userId: row.user_id,
      roomId: row.room_id,
      body: row.body,
      read: row.read,
      createdAt: row.created_at.toISOString(),
      updatedAt: row.updated_at.toISOString(),
    };
  }
}
