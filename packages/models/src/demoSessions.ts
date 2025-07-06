import { WithOptionalTx } from "@/query";
import { IDemoSession, Paginated } from "@litespace/types";
import { Knex } from "knex";
import { Model } from "@/lib/model";
import { dayjs } from "@litespace/utils";

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

  // @galal @TODO: implement this model function; it should create a new demo-session in the database.
  // @NOTE: generate session_id value by the unitility function genSessionId.
  async create(
    _payload: IDemoSession.CreateModelPayload,
    _tx?: Knex.Transaction
  ): Promise<IDemoSession.Self> {
    return {} as IDemoSession.Self;
  }

  async update(
    id: number,
    payload: IDemoSession.UpdateModelPayload,
    tx?: Knex.Transaction
  ): Promise<void> {
    if (!payload.status) return;

    await this.builder(tx).where(this.column("id"), id).update({
      status: payload.status,
      updated_at: dayjs.utc().toDate(),
    });
  }

  async findById(id: number): Promise<IDemoSession.Self | null> {
    const rows = await this.builder().select("*").where(this.column("id"), id);
    const row = rows[0];
    return row ? this.from(row) : null;
  }

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
