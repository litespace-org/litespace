import { WithOptionalTx } from "@/query";
import { IDemoSession, Paginated } from "@litespace/types";
import { Knex } from "knex";
import { Model } from "@/lib/model";
import dayjs from "@/lib/dayjs";
import { first } from "lodash";
import { genSessionId } from "@/lib/utils";

const FIELD_TO_COLUMN = {
  id: "id",
  sessionId: "session_id",
  tutorId: "tutor_id",
  slotId: "slot_id",
  start: "start",
  status: "status",
  createdAt: "created_at",
  updatedAt: "updated_at",
} satisfies Record<IDemoSession.Field, IDemoSession.Column>;

export class DemoSessions extends Model<
  IDemoSession.Row,
  IDemoSession.Self,
  typeof FIELD_TO_COLUMN
> {
  constructor() {
    super({
      table: "demo_sessions",
      fieldColumnMap: FIELD_TO_COLUMN,
    });
  }

  async create(
    payload: IDemoSession.CreateModelPayload,
    tx?: Knex.Transaction
  ): Promise<IDemoSession.Self> {
    const now = dayjs.utc().toDate();
    const rows = await this.builder(tx)
      .insert({
        session_id: genSessionId("demo"),
        tutor_id: payload.tutorId,
        slot_id: payload.slotId,
        start: dayjs.utc(payload.start).toDate(),
        status: IDemoSession.Status.Pending,
        created_at: now,
        updated_at: now,
      })
      .returning("*");

    const row = first(rows);
    if (!row) throw new Error("demo session not found; should never happen");
    return this.from(row);
  }

  // @galal @TODO: implement this model function; it should update both the status and updated_at columns
  // for a certain demo-session row in the database.
  async update(
    _payload: IDemoSession.UpdateModelPayload,
    _tx?: Knex.Transaction
  ): Promise<void> {}

  // @mk @TODO: implement this model function and use the new convention the `select` parameter.
  // Notice, that tutorManagerId is not stored in the table. I've chosen this design for more
  // database integrity. To filter by tutorManagerIds left join the slots table then use the
  // user_id column; but make sure to proceed the joining only after filtering with the ids param.
  async find<T extends IDemoSession.Field = IDemoSession.Field>(
    _query: WithOptionalTx<IDemoSession.FindModelQuery<T>>
  ): Promise<Paginated<Pick<IDemoSession.Self, T>>> {
    return {} as Paginated<Pick<IDemoSession.Self, T>>;
  }
}

export const demoSessions = new DemoSessions();
