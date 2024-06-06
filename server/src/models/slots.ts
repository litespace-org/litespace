import { query } from "@/models/query";
import { DeepPartial } from "@/types/utils";
import { ISlot } from "@litespace/types";
import { first } from "lodash";
import format from "pg-format";

export class Slots {
  async create(
    slot: Omit<ISlot.Self, "id" | "createdAt" | "updatedAt">
  ): Promise<void> {
    await query(
      `
        INSERT INTO
            "slots" (
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
            )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW());
      `,
      [
        slot.tutorId,
        slot.title,
        slot.weekday,
        slot.time.start,
        slot.time.end,
        slot.repeat,
        slot.date.start,
        slot.date.end,
      ]
    );
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
    const { rows } = await query<ISlot.Row, [number]>(
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
            id = $1;
     `,
      [id]
    );

    const slot = first(rows);
    if (!slot) return null;
    return this.as(slot);
  }

  async findByTutor(id: number): Promise<ISlot.Self[]> {
    const { rows } = await query<ISlot.Row, [number]>(
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
            tutor_id = $1;
     `,
      [id]
    );

    return rows.map((slot) => this.as(slot));
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

    return rows.map((slot) => this.as(slot));
  }

  private as(slot: ISlot.Row): ISlot.Self {
    return {
      id: slot.id,
      tutorId: slot.tutor_id,
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
