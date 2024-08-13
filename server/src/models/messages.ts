import { knex } from "@/models/query";
import { first } from "lodash";
import { IMessage } from "@litespace/types";
import dayjs from "@/lib/dayjs";

export class Messages {
  table = "messages";

  async create(payload: IMessage.CreatePayload): Promise<IMessage.Self> {
    const now = dayjs.utc().toDate();
    const rows = await knex<IMessage.Row>(this.table)
      .insert({
        user_id: payload.userId,
        room_id: payload.roomId,
        text: payload.text,
        created_at: now,
        updated_at: now,
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
      .update({ [key]: value, updated_at: dayjs().utc().toDate() })
      .where("id", id);
  }

  async markAsRead(id: number): Promise<void> {
    return this.updateBy(id, "read", true);
  }

  async findById(id: number): Promise<IMessage.Self | null> {
    return await this.findOneBy("id", id);
  }

  async findOneBy<T extends keyof IMessage.Row>(
    key: T,
    value: IMessage.Row[T]
  ): Promise<IMessage.Self | null> {
    const messages = await this.findManyBy(key, value);
    return first(messages) || null;
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
      text: row.text,
      read: row.read,
      createdAt: row.created_at.toISOString(),
      updatedAt: row.updated_at.toISOString(),
    };
  }
}

export const messages = new Messages();
