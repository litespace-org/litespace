import { column, countRows, knex, withPagination } from "@/query";
import { first, merge, omit, orderBy } from "lodash";
import { IFilter, IRoom, IUser, Paginated } from "@litespace/types";
import { Knex } from "knex";
import dayjs from "@/lib/dayjs";
import { users } from "@/users";
import { messages } from "@/messages";

export class Rooms {
  tables = {
    rooms: "rooms",
    members: "room_members",
  } as const;

  column = {
    rooms: (value: keyof IRoom.Row) => column(value, this.tables.rooms),
    members: (value: keyof IRoom.MemberRow) =>
      column(value, this.tables.members),
  };

  async create(ids: number[]): Promise<number> {
    return await knex.transaction(async (tx: Knex.Transaction) => {
      const now = dayjs.utc();
      const rows = await knex<IRoom.Row>(this.tables.rooms)
        .transacting(tx)
        .insert({ created_at: now.toDate() })
        .returning("*");

      const room = first(rows);
      if (!room) throw new Error("Room not found; should never happen");

      await knex<IRoom.MemberRow>(this.tables.members)
        .transacting(tx)
        .insert(ids.map((id) => ({ user_id: id, room_id: room.id })));

      return room.id;
    });
  }

  async findById(id: number): Promise<IRoom.Self | null> {
    const rows: IRoom.Row[] = await knex<IRoom.Row>(this.tables.rooms)
      .select("*")
      .where("id", id);

    const row = first(rows);
    if (!row) return null;
    return this.asRoom(row);
  }

  async findRoomMembers({
    roomIds,
    excludeUsers,
    tx,
  }: {
    roomIds: number[];
    excludeUsers?: number[];
    tx?: Knex.Transaction;
  }): Promise<IRoom.PopulatedMember[]> {
    const cols: Record<keyof IRoom.PopulatedMemberRow, string> = {
      id: users.column("id"),
      roomId: this.column.members("room_id"),
      email: users.column("email"),
      name: users.column("name"),
      image: users.column("image"),
      role: users.column("role"),
      online: users.column("online"),
      createdAt: users.column("created_at"),
      updatedAt: users.column("updated_at"),
    };

    const builder = this.builder(tx)
      .members.select<IRoom.PopulatedMemberRow[]>(cols)
      .join(users.table, users.column("id"), this.column.members("user_id"))
      .whereIn(this.column.members("room_id"), roomIds);

    if (excludeUsers)
      builder.whereNotIn(this.column.members("user_id"), excludeUsers);

    const rows = await builder.then();
    return rows.map((row) => this.asPopulatedMember(row));
  }

  async findRoomByMembers(members: number[]): Promise<number | null> {
    const rows = await knex<IRoom.MemberRow>(this.tables.members)
      .select("room_id")
      .groupBy("room_id")
      .havingRaw(
        `array_agg(room_members.user_id order by room_members.user_id) = ?`,
        [orderBy(members)]
      );

    const row = first(rows);
    if (!row) return null;
    return row.room_id;
  }

  async findMemberRooms({
    tx,
    userId,
    pagination,
  }: {
    userId: number;
    tx?: Knex.Transaction;
    pagination?: IFilter.Pagination;
  }): Promise<Paginated<number>> {
    const base = this.builder(tx)
      .members.join(
        this.tables.rooms,
        this.column.rooms("id"),
        this.column.members("room_id")
      )
      .where(this.column.members("user_id"), userId);

    const subquery = messages
      .builder(tx)
      .select(
        knex.raw(
          `
      (
        CASE
            WHEN max(updated_at) IS NULL THEN to_timestamp(0)
            ELSE max(updated_at)
        END
      )
      `
        )
      )
      .where(
        messages.column("room_id"),
        knex.ref(this.column.members("room_id"))
      );

    const query = base
      .clone()
      .select<Array<{ roomId: number }>>({
        roomId: this.column.members("room_id"),
      })
      .orderBy([
        { column: subquery, order: "DESC" },
        { column: this.column.rooms("created_at"), order: "DESC" },
      ]);

    const total = await countRows(base.clone());
    const rows = pagination
      ? await withPagination(query, pagination)
      : await query.then();

    return { list: rows.map((row) => row.roomId), total };
  }

  async findMemberFullRoomIds(
    user: number,
    tx?: Knex.Transaction
  ): Promise<number[]> {
    return this.builder(tx)
      .members.select<Array<{ room: number }>>({
        room: this.column.members("room_id"),
      })
      .where(this.column.members("user_id"), user)
      .then((data) => data.map(({ room }) => room));
  }

  builder(tx?: Knex.Transaction) {
    const fn = tx || knex;
    return {
      rooms: fn(this.tables.rooms),
      members: fn(this.tables.members),
    };
  }

  asRoom(row: IRoom.Row): IRoom.Self {
    return {
      id: row.id,
      createdAt: row.created_at.toISOString(),
    };
  }

  asRoomMember(row: IRoom.MemberRow): IRoom.Member {
    return {
      userId: row.user_id,
      roomId: row.room_id,
    };
  }

  asPopulatedMember(row: IRoom.PopulatedMemberRow): IRoom.PopulatedMember {
    return merge(omit(row, "createdAt", "updatedAt"), {
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    });
  }
}

export const rooms = new Rooms();
