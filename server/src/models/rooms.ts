import { column, knex } from "@/models/query";
import { first, merge, omit } from "lodash";
import { IRoom, IUser } from "@litespace/types";
import { Knex } from "knex";
import dayjs from "@/lib/dayjs";
import { users } from "./users";

class Rooms {
  tables = {
    rooms: "rooms",
    members: "room_members",
  };

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
    const rows = await knex<IRoom.Row>(this.tables.rooms)
      .select("*")
      .where("id", id);

    const row = first(rows);
    if (!row) return null;
    return this.asRoom(row);
  }

  async findRoomMembers(roomIds: number[]): Promise<IRoom.PopulatedMember[]> {
    const rows = await knex<IUser.Row>(users.table)
      .select<IRoom.PopulatedMemberRow[]>({
        id: users.column("id"),
        roomId: this.column.members("room_id"),
        email: users.column("email"),
        arabicName: users.column("name_ar"),
        englishName: users.column("name_en"),
        photo: users.column("photo"),
        role: users.column("role"),
        online: users.column("online"),
        createdAt: users.column("created_at"),
        updatedAt: users.column("updated_at"),
      })
      .join(
        this.tables.members,
        column<IRoom.MemberRow>("user_id", this.tables.members),
        column<IUser.Row>("id", users.table)
      )
      .whereIn("room_id", roomIds);

    return rows.map((row) => this.asPopulatedMember(row));
  }

  async findRoomByMembers(members: number[]): Promise<number | null> {
    const rows = await knex<IRoom.MemberRow>(this.tables.members)
      .select("room_id")
      .groupBy("room_id")
      .havingRaw(
        `array_agg(room_members.user_id order by room_members.user_id) = ?`,
        [members]
      );

    const row = first(rows);
    if (!row) return null;
    return row.room_id;
  }

  async findMemberRooms(userId: number): Promise<number[]> {
    const rows = await knex<IUser.Row>("users")
      .select<Array<{ roomId: number }>>({ roomId: "rooms.id" })
      .join(this.tables.members, "room_members.user_id", "users.id")
      .join(this.tables.rooms, "rooms.id", "room_members.room_id")
      .where("users.id", userId);
    return rows.map((row) => row.roomId);
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
    return merge(
      omit(row, "arabicName", "englishName", "createdAt", "updatedAt"),
      {
        name: { ar: row.arabicName, en: row.englishName },
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString(),
      }
    );
  }
}

export const rooms = new Rooms();
