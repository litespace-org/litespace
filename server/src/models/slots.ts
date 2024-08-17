import { knex, query } from "@/models/query";
import { DeepPartial } from "@/types/utils";
import { ISlot } from "@litespace/types";
import { first } from "lodash";
import format from "pg-format";

export class Slots {
  readonly table = "slots" as const;

  async create(
    slot: Omit<ISlot.Self, "id" | "createdAt" | "updatedAt">
  ): Promise<ISlot.Self> {
    const now = new Date();
    const rows = await knex<ISlot.Row>("slots").insert(
      {
        user_id: slot.userId,
        title: slot.title,
        weekday: slot.weekday,
        start_time: slot.time.start,
        end_time: slot.time.end,
        start_date: slot.date.start,
        end_date: slot.date.end,
        repeat: slot.repeat,
        created_at: now,
        updated_at: now,
      },
      "*"
    );
    const row = first(rows);
    if (!row) throw new Error("Slot not found; should never happen");
    return this.from(row);
  }

  async update(
    id: number,
    slot: DeepPartial<Omit<ISlot.Self, "tutorId" | "createdAt">>
  ): Promise<void> {
    await query(
      `
            UPDATE slots
            SET
                title = COALESCE($1, title),
                weekday = COALESCE($3, weekday),
                start_time = COALESCE($4, start_time),
                end_time = COALESCE($5, end_time),
                repeat = COALESCE($6, repeat),
                start_date = COALESCE($7, start_date),
                end_date = COALESCE($8, end_date),
                updated_at = COALESCE($9, updated_at)
            WHERE
                id = $10;
        `,
      [
        slot.title,
        slot.weekday,
        slot.time?.start,
        slot.time?.end,
        slot.repeat,
        slot.date?.start,
        slot.date?.end,
        slot.updatedAt,
        id,
      ]
    );
  }

  async delete(id: number): Promise<void> {
    await query(`DELETE FROM slots WHERE id = $1;`, [id]);
  }

  async findById(id: number): Promise<ISlot.Self | null> {
    const rows = await knex<ISlot.Row>("slots").select().where("id", id);
    const slot = first(rows);
    if (!slot) return null;
    return this.from(slot);
  }

  async findByUserId(id: number): Promise<ISlot.Self[]> {
    const rows = await knex<ISlot.Row>("slots")
      .select("*")
      .where("user_id", id);
    return rows.map((slot) => this.from(slot));
  }

  async findByTutors(ids: number[]): Promise<ISlot.Self[]> {
    const { rows } = await query<ISlot.Row, []>(
      format(
        `
        SELECT
            id,
            tutor_id,
            title,
            weekday,
            start_time,
            end_time,
            repeat,
            start_date,
            end_date,
            created_at,
            updated_at
        FROM slots
        WHERE
            tutor_id in (%L);
     `,
        ids
      )
    );

    return rows.map((slot) => this.from(slot));
  }

  private from(slot: ISlot.Row): ISlot.Self {
    return {
      id: slot.id,
      userId: slot.user_id,
      title: slot.title,
      weekday: slot.weekday,
      time: { start: slot.start_time, end: slot.end_time },
      date: { start: slot.start_date, end: slot.end_date || undefined },
      repeat: slot.repeat,
      createdAt: slot.created_at.toISOString(),
      updatedAt: slot.updated_at.toISOString(),
    };
  }
}

export const slots = new Slots();
