import { query } from "@/database/query";
import { first } from "lodash";

export class Subscriptions {
  async create(subscription: Omit<Subscription.Self, "id">): Promise<number> {
    const { rows } = await query<
      { id: number },
      [
        studentId: number,
        montlyMinutes: number,
        remainingMinutes: number,
        renewalInterval: Subscription.RenewalInterval,
        start: string,
        end: string,
        createdAt: string,
        updatedAt: string
      ]
    >(
      `
        INSERT INTO
            "subscriptions" (
                "student_id",
                "montly_minutes",
                "remaining_minutes",
                "renewal_interval",
                "start",
                "end",
                "created_at",
                "updated_at"
            )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id;
      `,
      [
        subscription.studentId,
        subscription.monthlyMinutes,
        subscription.remainingMinutes,
        subscription.renewalInterval,
        subscription.start,
        subscription.end,
        subscription.createdAt,
        subscription.updatedAt,
      ]
    );

    const row = first(rows);
    if (!row) throw new Error("Subscription not found; should never happen");
    return row.id;
  }

  async update(
    subscription: Omit<
      Subscription.Self,
      "id" | "student_id" | "updated_at" | "created_at"
    >
  ): Promise<void> {
    await query<
      {},
      [
        montlyMinutes: number,
        remainingMinutes: number,
        renewalInterval: Subscription.RenewalInterval,
        start: string,
        end: string
      ]
    >(
      `
        UPDATE "subscriptions"
        SET
            montly_minutes = COALESCE($1, montly_minutes),
            remaining_minutes = COALESCE($2, remaining_minutes),
            renewal_interval = COALESCE($3, renewal_interval),
            start = COALESCE($4, start),
            end = COALESCE($5, end),
            updated_at = NOW()
        WHERE
            id = $6;
      `,
      [
        subscription.monthlyMinutes,
        subscription.remainingMinutes,
        subscription.renewalInterval,
        subscription.start,
        subscription.end,
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
            "montly_minutes",
            "remaining_minutes",
            "renewal_interval",
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

  from(row: Subscription.Row): Subscription.Self {
    return {
      id: row.id,
      studentId: row.student_id,
      monthlyMinutes: row.monthly_minutes,
      remainingMinutes: row.remaining_minutes,
      renewalInterval: row.renewal_interval,
      start: row.start.toISOString(),
      end: row.end.toISOString(),
      createdAt: row.created_at.toISOString(),
      updatedAt: row.updated_at.toISOString(),
    };
  }
}

export namespace Subscription {
  export enum RenewalInterval {
    No = "no",
    Montly = "montly",
    Quarterly = "quarterly",
    Yearly = "yearly",
  }

  export type Self = {
    id: number;
    studentId: number;
    monthlyMinutes: number;
    remainingMinutes: number;
    renewalInterval: RenewalInterval;
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
    renewal_interval: RenewalInterval;
    start: Date;
    end: Date;
    created_at: Date;
    updated_at: Date;
  };
}
