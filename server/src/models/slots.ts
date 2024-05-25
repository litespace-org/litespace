import { query } from "@/models/query";
import { DeepPartial } from "@/types/utils";
import { first } from "lodash";

export class Slots {
  async create(slot: Omit<Slot.Self, "id">): Promise<void> {
    await query(
      `
        INSERT INTO
            slots (
                tutor_id,
                title,
                description,
                weekday,
                start_time,
                end_time,
                repeat,
                start_date,
                end_date,
                created_at,
                updated_at
            )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11);
      `,
      [
        slot.tutorId,
        slot.title,
        slot.description,
        slot.weekday,
        slot.time.start,
        slot.time.end,
        slot.repeat,
        slot.date.start,
        slot.date.end,
        slot.createdAt,
        slot.updatedAt,
      ]
    );
  }

  async update(
    slot: DeepPartial<Omit<Slot.Self, "tutorId" | "createdAt">> & {
      id: number;
    }
  ): Promise<void> {
    await query(
      `
            UPDATE slots
            SET
                title = COALESCE($1, title),
                description = COALESCE($2, description),
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
        slot.description,
        slot.weekday,
        slot.time?.start,
        slot.time?.end,
        slot.repeat,
        slot.date?.start,
        slot.date?.end,
        slot.updatedAt,
        slot.id,
      ]
    );
  }

  async delete(id: number): Promise<void> {
    await query(`DELETE FROM slots WHERE id = $1;`, [id]);
  }

  async findById(id: number): Promise<Slot.Self | null> {
    const { rows } = await query<Slot.Row, [number]>(
      `
        SELECT
            id,
            tutor_id,
            title,
            description,
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

  async findByTutor(id: number): Promise<Slot.Self[]> {
    const { rows } = await query<Slot.Row, [number]>(
      `
        SELECT
            id,
            tutor_id,
            title,
            description,
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

  private as(slot: Slot.Row): Slot.Self {
    return {
      id: slot.id,
      tutorId: slot.tutor_id,
      title: slot.title,
      description: slot.description,
      weekday: slot.weekday,
      time: { start: slot.start_time, end: slot.end_time },
      date: { start: slot.start_date, end: slot.end_date || undefined },
      repeat: slot.repeat,
      createdAt: slot.created_at.toISOString(),
      updatedAt: slot.updated_at.toISOString(),
    };
  }
}

export namespace Slot {
  export enum Repeat {
    No = "no",
    Daily = "daily",
    Weekly = "weekly",
    Monthly = "monthly",
  }

  export type Self = {
    id: number;
    tutorId: number;
    title: string;
    description: string;
    weekday: number;
    time: { start: string; end: string };
    date: { start: string; end?: string };
    repeat: Repeat;
    createdAt: string;
    updatedAt: string;
  };

  export type Row = {
    id: number;
    tutor_id: number;
    title: string;
    description: string;
    weekday: number;
    start_time: string;
    end_time: string;
    start_date: string;
    end_date: string | null;
    repeat: Repeat;
    created_at: Date;
    updated_at: Date;
  };

  export type Discrete = {
    id: number;
    tutorId: number;
    title: string;
    description: string;
    start: string;
    end: string;
    createdAt: string;
    updatedAt: string;
  };
}
