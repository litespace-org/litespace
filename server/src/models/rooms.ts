import { knex } from "@/models/query";
import { first } from "lodash";
import { IRoom, IUser } from "@litespace/types";
import { Knex } from "knex";
import dayjs from "@/lib/dayjs";

class Rooms {
  tables = {
    rooms: "rooms",
    members: "room_members",
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

  async findRoomMembers(roomId: number): Promise<IRoom.Member[]> {
    const rows = await knex<IRoom.MemberRow>(this.tables.members)
      .select("*")
      .where("room_id", roomId);

    return rows.map((row) => this.asRoomMember(row));
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
}

export const rooms = new Rooms();
