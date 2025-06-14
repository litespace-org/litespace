import { IIntroVideo } from "@litespace/types";
import { Knex } from "knex";
import {
  column,
  countRows,
  knex,
  withDateFilter,
  withListFilter,
  WithOptionalTx,
  withSkippablePagination,
} from "@/query";
import dayjs from "@/lib/dayjs";
import { first } from "lodash";

export class IntroVideos {
  table = "intro_videos" as const;

  async create(
    payload: IIntroVideo.CreateModelPayload
  ): Promise<IIntroVideo.Self> {
    const now = dayjs.utc();
    const rows = await knex<IIntroVideo.Row>(this.table).insert(
      {
        src: payload.src,
        tutor_id: payload.tutorId,
        state: IIntroVideo.State.Pending,
        reviewer_id: payload.reviewerId,
        created_at: now.toDate(),
        updated_at: now.toDate(),
      },
      "*"
    );
    const row = first(rows);

    if (!row) throw new Error("Intro video not found: Should never happen");
    return this.from(row);
  }

  async update({
    tx,
    ...payload
  }: WithOptionalTx<IIntroVideo.UpdateModelPayload>): Promise<void> {
    const now = dayjs.utc();
    await this.builder(tx)
      .update(
        {
          reviewer_id: payload.reviewerId,
          state: payload.state,
          updated_at: now.toDate(),
        },
        "*"
      )
      .where("id", payload.id);
  }

  async delete(id: number, tx?: Knex.Transaction): Promise<void> {
    await this.builder(tx).delete().where("id", id);
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
    createdAt,
    reviewerIds,
    tutorIds,
    videoIds,
    ...pagination
  }: WithOptionalTx<IIntroVideo.FindModelPayload>): Promise<IIntroVideo.FindModelResponse> {
    const builder = this.builder(tx);

    if (state) builder.where("state", state);

    // ==============  list-based fileds ========
    withListFilter(builder, this.column("tutor_id"), tutorIds);
    withListFilter(builder, this.column("reviewer_id"), reviewerIds);
    withListFilter(builder, this.column("id"), videoIds);

    // ==============  date fileds ========
    withDateFilter(builder, "created_at", createdAt);

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
    const builder = tx || knex;
    return builder<IIntroVideo.Row>(this.table);
  }

  column(value: keyof IIntroVideo.Row) {
    return column(value, this.table);
  }
}

export const introVideos = new IntroVideos();
