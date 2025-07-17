import {
  countRows,
  withDateFilter,
  withListFilter,
  WithOptionalTx,
  withSkippablePagination,
} from "@/query";
import { IDemoSession, Paginated } from "@litespace/types";
import { Knex } from "knex";
import { Model } from "@/lib/model";
import dayjs from "@/lib/dayjs";
import { first, isEmpty } from "lodash";
import { genSessionId } from "@/lib/utils";
import { availabilitySlots } from "@/availabilitySlots";

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

  async update(
    payload: WithOptionalTx<IDemoSession.UpdateModelPayload>
  ): Promise<void> {
    const now = dayjs.utc().toDate();
    await this.builder(payload.tx)
      .update({
        status: payload.status,
        updated_at: now,
      })
      .whereIn(this.column("id"), payload.ids);
  }

  async findById(
    id: number,
    tx?: Knex.Transaction
  ): Promise<IDemoSession.Self | null> {
    const { list } = await this.find({ ids: [id], tx });
    return first(list) || null;
  }

  async find<T extends IDemoSession.Field = IDemoSession.Field>({
    ids,
    sessionIds,
    tutorIds,
    slotIds,
    tutorManagerIds,
    statuses,
    start,
    createdAt,
    updatedAt,
    select,
    tx,
    ...pagination
  }: WithOptionalTx<IDemoSession.FindModelQuery<T>>): Promise<
    Paginated<Pick<IDemoSession.Self, T>>
  > {
    const base = this.builder(tx);

    // ============== list fields ========
    withListFilter(base, this.column("id"), ids);
    withListFilter(base, this.column("session_id"), sessionIds);
    withListFilter(base, this.column("tutor_id"), tutorIds);
    withListFilter(base, this.column("slot_id"), slotIds);
    withListFilter(base, this.column("status"), statuses);

    // ============== date fields ========
    withDateFilter(base, this.column("created_at"), createdAt);
    withDateFilter(base, this.column("updated_at"), updatedAt);
    withDateFilter(base, this.column("start"), start);

    //======= filters after joins ====== =
    if (tutorManagerIds && !isEmpty(tutorManagerIds)) {
      base.innerJoin(availabilitySlots.table, (builder) =>
        builder
          .on(availabilitySlots.column("id"), this.column("slot_id"))
          .andOnIn(availabilitySlots.column("user_id"), tutorManagerIds)
      );
    }

    const total = await countRows(base.clone(), {
      column: this.column("id"),
      distinct: true,
    });

    const queryBuilder = base
      .clone()
      .select(this.select(select))
      .orderBy([
        {
          column: this.column("created_at"),
          order: "desc",
        },
        {
          column: this.column("id"),
          order: "desc",
        },
      ]);

    const rows = await withSkippablePagination(queryBuilder, pagination);
    const demoSessions = rows.map((row) => this.from(row));
    return { list: demoSessions, total };
  }
}

export const demoSessions = new DemoSessions();
