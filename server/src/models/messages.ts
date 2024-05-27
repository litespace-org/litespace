import { query } from "@/models/query";
import { first } from "lodash";

export class Messages {
  async create(
    msg: Omit<Message.Self, "id" | "createdAt" | "updatedAt">
  ): Promise<Message.Self> {
    const { rows } = await query<
      Message.Row,
      [
        userId: number,
        roomId: number,
        replyId: number | null,
        body: string,
        isRead: boolean
      ]
    >(
      `
        INSERT INTO
            "messages" (
                "user_id",
                "room_id",
                "reply_id",
                "body",
                "is_read",
                "created_at",
                "updated_at"
            )
        VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) 
        RETURNING
            "id",
            "user_id",
            "room_id",
            "reply_id",
            "body",
            "is_read",
            "created_at",
            "updated_at";
        `,
      [msg.userId, msg.roomId, msg.replyId, msg.body, msg.isRead]
    );

    const row = first(rows);
    if (!row) throw new Error("Message not found; should never happen");
    return this.from(row);
  }

  async updateBody(id: number, body: string): Promise<Message.Self> {
    const { rows } = await query<Message.Row, [body: string, id: number]>(
      `
        UPDATE "messages"
        SET
            messages.body = COALESCE($1, messages.body),
            messages.updated_at = NOW()
        WHERE
            messages.id = $2
        RETURNING
            "id",
            "user_id",
            "room_id",
            "reply_id",
            "body",
            "is_read",
            "created_at",
            "updated_at";
      `,
      [body, id]
    );

    const row = first(rows);
    if (!row) throw new Error("Message not found; should never happen");
    return this.from(row);
  }

  async markAsRead(id: number): Promise<Message.Self> {
    const { rows } = await query<Message.Row, [id: number]>(
      `
        UPDATE "messages"
        SET
            "is_read" = true,
            "updated_at" = NOW()
        WHERE
            messages.id = $1
        RETURNING
            "id",
            "user_id",
            "room_id",
            "reply_id",
            "body",
            "is_read",
            "created_at",
            "updated_at";
      `,
      [id]
    );

    const row = first(rows);
    if (!row) throw new Error("Message not found; should never happen");
    return this.from(row);
  }

  async findById(id: number): Promise<Message.Self | null> {
    const { rows } = await query<Message.Row, [id: number]>(
      `
        SELECT "id", "user_id", "room_id", "reply_id", "body", "is_read", "created_at", "updated_at"
        FROM "messages"
        WHERE
            messages.id = $1;
      `,
      [id]
    );

    const row = first(rows);
    if (!row) throw new Error("Message not found; should never happen");
    return this.from(row);
  }

  async delete(id: number): Promise<void> {
    await query(`DELETE FROM "messages" WHERE id = $1;`, [id]);
  }

  from(row: Message.Row): Message.Self {
    return {
      id: row.id,
      userId: row.user_id,
      roomId: row.room_id,
      replyId: row.reply_id,
      body: row.body,
      isRead: row.is_read,
      createdAt: row.created_at.toISOString(),
      updatedAt: row.updated_at.toISOString(),
    };
  }
}

export namespace Message {
  export type Self = {
    id: number;
    userId: number;
    roomId: number;
    replyId: number | null;
    body: string;
    isRead: boolean;
    createdAt: string;
    updatedAt: string;
  };

  export type Row = {
    id: number;
    user_id: number;
    room_id: number;
    reply_id: number | null;
    body: string;
    is_read: boolean;
    created_at: Date;
    updated_at: Date;
  };
}
