import { query } from "@/models/query";
import { first } from "lodash";

export class Subscriptions {
  async create(
    subscription: Omit<Subscription.Self, "id" | "createdAt" | "updatedAt">
  ): Promise<number> {
    const { rows } = await query<
      { id: number },
      [
        studentId: number,
        montlyMinutes: number,
        remainingMinutes: number,
        autoRenewal: boolean,
        start: string,
        end: string
      ]
    >(
      `
        INSERT INTO
            "subscriptions" (
                "student_id",
                "monthly_minutes",
                "remaining_minutes",
                "auto_renewal",
                "start",
                "end",
                "created_at",
                "updated_at"
            )
        VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
        RETURNING id;
      `,
      [
        subscription.studentId,
        subscription.monthlyMinutes,
        subscription.remainingMinutes,
        subscription.autoRenewal,
        subscription.start,
        subscription.end,
      ]
    );

    const row = first(rows);
    if (!row) throw new Error("Subscription not found; should never happen");
    return row.id;
  }

  async update(
    subscription: Partial<
      Omit<Subscription.Self, "student_id" | "updated_at" | "created_at">
    > & { id: number }
  ): Promise<void> {
    await query<
      {},
      [
        montlyMinutes: number | undefined,
        remainingMinutes: number | undefined,
        autoRenewal: boolean | undefined,
        start: string | undefined,
        end: string | undefined,
        id: number
      ]
    >(
      `
        UPDATE "subscriptions" as s
        SET
            "monthly_minutes" = COALESCE($1, s.monthly_minutes),
            "remaining_minutes" = COALESCE($2, s.remaining_minutes),
            "auto_renewal" = COALESCE($3, s.auto_renewal),
            "start" = COALESCE($4, s.start),
            "end" = COALESCE($5, s.end),
            "updated_at" = NOW()
        WHERE
            id = $6;
      `,
      [
        subscription.monthlyMinutes,
        subscription.remainingMinutes,
        subscription.autoRenewal,
        subscription.start,
        subscription.end,
        subscription.id,
      ]
    );
  }

  async delete(id: number) {
    await query<{}, [id: number]>(
      `DELETE FROM "subscriptions" WHERE id = $1;`,
      [id]
    );
  }

  async findById(id: number): Promise<Subscription.Self | null> {
    const { rows } = await query<Subscription.Row, [id: number]>(
      `
        SELECT
            "id",
            "student_id",
            "monthly_minutes",
            "remaining_minutes",
            "auto_renewal",
            "start",
            "end",
            "created_at",
            "updated_at"
        FROM "subscriptions"
        WHERE
            id = $1;
      `,
      [id]
    );

    const row = first(rows);
    if (!row) return null;
    return this.from(row);
  }

  async findByStudentId(studentId: number): Promise<Subscription.Self | null> {
    const { rows } = await query<Subscription.Row, [studentId: number]>(
      `
        SELECT
            "id",
            "student_id",
            "monthly_minutes",
            "remaining_minutes",
            "auto_renewal",
            "start",
            "end",
            "created_at",
            "updated_at"
        FROM "subscriptions"
        WHERE
            student_id = $1;
      `,
      [studentId]
    );

    const row = first(rows);
    if (!row) return null;
    return this.from(row);
  }

  async findAll(): Promise<Subscription.Self[]> {
    const { rows } = await query<Subscription.Row, []>(
      `
        SELECT
            "id",
            "student_id",
            "monthly_minutes",
            "remaining_minutes",
            "auto_renewal",
            "start",
            "end",
            "created_at",
            "updated_at"
        FROM "subscriptions";
      `,
      []
    );

    return rows.map((row) => this.from(row));
  }

  from(row: Subscription.Row): Subscription.Self {
    return {
      id: row.id,
      studentId: row.student_id,
      monthlyMinutes: row.monthly_minutes,
      remainingMinutes: row.remaining_minutes,
      autoRenewal: row.auto_renewal,
      start: row.start.toISOString(),
      end: row.end.toISOString(),
      createdAt: row.created_at.toISOString(),
      updatedAt: row.updated_at.toISOString(),
    };
  }
}

export namespace Subscription {
  export enum Period {
    Month = "month",
    Quarter = "quarter",
    Year = "year",
  }

  export type Self = {
    id: number;
    studentId: number;
    monthlyMinutes: number;
    remainingMinutes: number;
    autoRenewal: boolean;
    start: string;
    end: string;
    createdAt: string;
    updatedAt: string;
  };

  export type Row = {
    id: number;
    student_id: number;
    monthly_minutes: number;
    remaining_minutes: number;
    auto_renewal: boolean;
    start: Date;
    end: Date;
    created_at: Date;
    updated_at: Date;
  };
}
