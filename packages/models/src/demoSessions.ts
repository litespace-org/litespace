import { WithOptionalTx } from "@/query";
import { IDemoSession, Paginated } from "@litespace/types";
import { Knex } from "knex";
import { Model } from "@/lib/model";

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

  // @galal @TODO: implement this model function; it should update both the status and updated_at columns
  // for a certain demo-session row in the database.
  async update(
    _id: number,
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
