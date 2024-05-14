import { query } from "@/database/query";
import { isEmpty, first } from "lodash";

export class User {
  async create(user: Omit<User.Self, "id">): Promise<void> {
    await query(
      "INSERT INTO users (email, password, name, avatar, type) values ($1, $2, $3, $4, $5);",
      [user.email, user.password, user.name, user.avatar, user.type]
    );
  }

  async update(user: Partial<User.Self> & { id: number }): Promise<void> {
    await query(
      `
        UPDATE users
        SET
            email = COALESCE($1, email),
            password = COALESCE($2, pasword),
            name = COALESCE($3, name),
            avatar = COALESCE($4, avatar),
            type = COALESCE($5, type)
        where
            id = $6;
      `,
      [user.email, user.password, user.name, user.avatar, user.type, user.id]
    );
  }

  async delete(id: number): Promise<void> {
    await query("DELETE FROM users WHERE id = $1", [id]);
  }

  async findOne(id: number): Promise<User.Self | null> {
    const { rows } = await query<User.Self, [number]>(
      `
        SELECT id, email, password, name, avatar, type
        FROM users
        WHERE id = 1;
      `,
      [id]
    );

    return first(rows) || null;
  }

  async findMany(ids: number[]): Promise<User.Self[]> {
    const { rows } = await query<User.Self, [number[]]>(
      `
        SELECT id, email, password, name, avatar, type
        FROM users
        WHERE id in $1;
      `,
      [ids]
    );

    return rows;
  }

  async findAll(): Promise<User.Self[]> {
    const { rows } = await query<User.Self, []>(
      `
        SELECT id, email, password, name, avatar, type
        FROM users;
      `
    );

    return rows;
  }
}

export namespace User {
  export enum Type {
    SuperAdmin = "super_admin",
    RegularAdmin = "reg_admin",
    Teacher = "teacher",
    Student = "student",
  }

  export type Self = {
    id: number;
    email: string;
    password: string;
    name: string;
    avatar: string | null;
    type: Type;
  };
}
