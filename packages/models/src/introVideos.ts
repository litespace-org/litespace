import { IIntroVideo, Paginated } from "@litespace/types";
import { Knex } from "knex";
import {
  column,
  countRows,
  knex,
  withListFilter,
  WithOptionalTx,
  withSkippablePagination,
  withStringFilter,
} from "@/query";
import dayjs from "@/lib/dayjs";
import { first } from "lodash";

export class IntroVideos {
  table = "intro_videos" as const;

  async create(
    payload: IIntroVideo.CreatePayloadModel
  ): Promise<IIntroVideo.Self> {
    const now = dayjs.utc();
    const rows = await knex<IIntroVideo.Row>(this.table).insert(
      {
        src: payload.src,
        tutor_id: payload.tutorId,
        state: "pending",
        reviewer_id: null,
        created_at: now.toDate(),
        updated_at: now.toDate(),
      },
      "*"
    );

    const row = first(rows);

    if (!row) throw new Error("IntroVideo not found: Should never happen");
    return this.from(row);
  }

  async update(
    id: number,
    payload: IIntroVideo.UpdatePayloadModel
  ): Promise<IIntroVideo.Self> {
    const now = dayjs.utc();
    const rows = await knex<IIntroVideo.Row>(this.table)
      .update(
        {
          reviewer_id: payload.reviewerId,
          state: payload.state,
          updated_at: now.toDate(),
        },
        "*"
      )
      .where("id", id);
    const row = first(rows);

    if (!row) throw new Error("IntroVideo not found: Should never happen");
    return this.from(row);
  }

  async delete(id: number): Promise<void> {
    await knex<IIntroVideo.Row>(this.table).delete().where("id", id);
  }

  async findById(
    id: number,
    tx?: Knex.Transaction
  ): Promise<IIntroVideo.Self | null> {
    const rows = await this.builder(tx)
      .where(this.column("id"), id)
      .select("*");
    const row = first(rows);
    if (!row) return null;
    return this.from(row);
  }

  async find({
    tx,
    state,
    after,
    before,
    reviewerIds,
    tutorIds,
    ...pagination
  }: WithOptionalTx<IIntroVideo.FindPayloadModel>): Promise<
    Paginated<IIntroVideo.Self>
  > {
    const builder = this.builder(tx);

    // ==============  String fileds ========
    withStringFilter(builder, this.column("state"), state);

    // ==============  list-based fileds ========
    withListFilter(builder, this.column("tutor_id"), tutorIds);
    withListFilter(builder, this.column("reviewer_id"), reviewerIds);

    if (after) builder.where("created_at", ">=", dayjs.utc(after).toDate());
    if (before) builder.where("created_at", "<=", dayjs.utc(before).toDate());

    const total = await countRows(builder.clone(), { distinct: true });
    const query = builder.select().orderBy([
      {
        column: this.column("created_at"),
        order: "desc",
      },
      {
        column: this.column("id"),
        order: "desc",
      },
    ]);

    const rows = await withSkippablePagination(query, pagination);
    const list = rows.map((row) => this.from(row));

    return { list, total };
  }

  from(row: IIntroVideo.Row): IIntroVideo.Self {
    return {
      id: row.id,
      tutorId: row.tutor_id,
      reviewerId: row.reviewer_id,
      state: row.state,
      src: row.src,
      createdAt: row.created_at.toISOString(),
      updatedAt: row.updated_at.toISOString(),
    };
  }

  builder(tx?: Knex.Transaction) {
    return tx
      ? tx<IIntroVideo.Row>(this.table)
      : knex<IIntroVideo.Row>(this.table);
  }

  column(value: keyof IIntroVideo.Row) {
    return column(value, this.table);
  }
}

export const introVideos = new IntroVideos();
